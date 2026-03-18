import type { WidgetConfig, SubmitPayload, SubmitResponse } from './types';

const TIMEOUT_MS = 15_000;

// ── Error Classes ──────────────────────────────────────────────────────────
export class WidgetApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly code: string
  ) {
    super(message);
    this.name = 'WidgetApiError';
  }
}

// ── Timeout Wrapper ────────────────────────────────────────────────────────
function fetchWithTimeout(
  url: string,
  options: RequestInit,
  timeoutMs: number = TIMEOUT_MS
): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  const mergedOptions: RequestInit = {
    ...options,
    signal: controller.signal,
  };

  return fetch(url, mergedOptions).finally(() => clearTimeout(timer));
}

// ── Error Status Mapper ────────────────────────────────────────────────────
function mapStatusToError(status: number, body: string): WidgetApiError {
  switch (status) {
    case 402:
      return new WidgetApiError(
        'This widget subscription has expired.',
        402,
        'EXPIRED'
      );
    case 404:
      return new WidgetApiError(
        'Widget not found. Please check your widget key.',
        404,
        'NOT_FOUND'
      );
    case 409:
      return new WidgetApiError(
        'You have already submitted a response.',
        409,
        'DUPLICATE'
      );
    case 410:
      return new WidgetApiError(
        'This widget is no longer active.',
        410,
        'INACTIVE'
      );
    case 429:
      return new WidgetApiError(
        'Too many requests. Please try again later.',
        429,
        'RATE_LIMITED'
      );
    default:
      return new WidgetApiError(
        body || 'An unexpected error occurred.',
        status,
        'SERVER_ERROR'
      );
  }
}

// ── Fetch Config ───────────────────────────────────────────────────────────
export async function fetchConfig(
  widgetKey: string,
  apiUrl: string
): Promise<WidgetConfig> {
  const url = `${apiUrl}/api/v1/widget/${encodeURIComponent(widgetKey)}`;

  let response: Response;
  try {
    response = await fetchWithTimeout(url, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
    });
  } catch (err: unknown) {
    if (err instanceof DOMException && err.name === 'AbortError') {
      throw new WidgetApiError(
        'Request timed out. Please check your connection.',
        0,
        'TIMEOUT'
      );
    }
    throw new WidgetApiError(
      'Network error. Please check your connection.',
      0,
      'NETWORK_ERROR'
    );
  }

  if (!response.ok) {
    const body = await response.text().catch(() => '');
    throw mapStatusToError(response.status, body);
  }

  const data: WidgetConfig = await response.json();
  return data;
}

// ── Submit Form ────────────────────────────────────────────────────────────
export async function submitForm(
  payload: SubmitPayload,
  apiUrl: string
): Promise<SubmitResponse> {
  const url = `${apiUrl}/api/v1/submit`;

  const attempt = async (): Promise<Response> => {
    try {
      return await fetchWithTimeout(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(payload),
      });
    } catch (err: unknown) {
      if (err instanceof DOMException && err.name === 'AbortError') {
        throw new WidgetApiError(
          'Request timed out. Please try again.',
          0,
          'TIMEOUT'
        );
      }
      throw new WidgetApiError(
        'Network error. Please try again.',
        0,
        'NETWORK_ERROR'
      );
    }
  };

  let response = await attempt();

  // Auto-retry once on 500 errors after a 2-second delay
  if (response.status >= 500 && response.status < 600) {
    await new Promise((resolve) => setTimeout(resolve, 2000));
    response = await attempt();
  }

  if (!response.ok) {
    const body = await response.text().catch(() => '');
    throw mapStatusToError(response.status, body);
  }

  const data: SubmitResponse = await response.json();
  return data;
}
