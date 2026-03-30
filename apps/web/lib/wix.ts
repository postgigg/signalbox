import crypto from 'crypto';

import {
  WIX_OAUTH_URL,
  WIX_INSTALL_URL,
  WIX_SCRIPTS_API_URL,
  WIX_WIDGET_SCRIPT_URL,
  APP_URL,
} from '@/lib/constants';

// ---------------------------------------------------------------------------
// Environment helpers
// ---------------------------------------------------------------------------

function getWixAppId(): string {
  const appId = process.env.WIX_APP_ID;
  if (!appId) {
    throw new Error('Missing WIX_APP_ID environment variable');
  }
  return appId;
}

function getWixAppSecret(): string {
  const secret = process.env.WIX_APP_SECRET;
  if (!secret) {
    throw new Error('Missing WIX_APP_SECRET environment variable');
  }
  return secret;
}

// ---------------------------------------------------------------------------
// Wix OAuth token response interface
// ---------------------------------------------------------------------------

interface WixTokenResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
}

function isWixTokenResponse(value: unknown): value is WixTokenResponse {
  if (typeof value !== 'object' || value === null) {
    return false;
  }
  const obj = value as Record<string, unknown>;
  return (
    typeof obj['access_token'] === 'string' &&
    typeof obj['refresh_token'] === 'string' &&
    typeof obj['expires_in'] === 'number'
  );
}

// ---------------------------------------------------------------------------
// Wix Embedded Script response interface
// ---------------------------------------------------------------------------

interface WixScriptResponse {
  script: {
    id: string;
  };
}

function isWixScriptResponse(value: unknown): value is WixScriptResponse {
  if (typeof value !== 'object' || value === null) {
    return false;
  }
  const obj = value as Record<string, unknown>;
  if (typeof obj['script'] !== 'object' || obj['script'] === null) {
    return false;
  }
  const script = obj['script'] as Record<string, unknown>;
  return typeof script['id'] === 'string';
}

// ---------------------------------------------------------------------------
// Wix error response interface
// ---------------------------------------------------------------------------

interface WixErrorResponse {
  message: string;
}

function isWixErrorResponse(value: unknown): value is WixErrorResponse {
  if (typeof value !== 'object' || value === null) {
    return false;
  }
  const obj = value as Record<string, unknown>;
  return typeof obj['message'] === 'string';
}

// ---------------------------------------------------------------------------
// HMAC state signing for OAuth state parameter
// ---------------------------------------------------------------------------

export function signState(accountId: string): string {
  const secret = getWixAppSecret();
  const timestamp = Date.now().toString();
  const payload = `${accountId}:${timestamp}`;
  const hmac = crypto.createHmac('sha256', secret).update(payload).digest('hex');
  return `${payload}:${hmac}`;
}

export function verifyState(state: string): { valid: boolean; accountId: string | null } {
  const parts = state.split(':');
  if (parts.length !== 3) {
    return { valid: false, accountId: null };
  }

  const accountId = parts[0];
  const timestamp = parts[1];
  const receivedHmac = parts[2];

  if (!accountId || !timestamp || !receivedHmac) {
    return { valid: false, accountId: null };
  }

  const secret = getWixAppSecret();
  const payload = `${accountId}:${timestamp}`;
  const expectedHmac = crypto.createHmac('sha256', secret).update(payload).digest('hex');

  // Timing-safe comparison
  const expected = Buffer.from(expectedHmac, 'hex');
  const received = Buffer.from(receivedHmac, 'hex');

  if (expected.length !== received.length) {
    return { valid: false, accountId: null };
  }

  if (!crypto.timingSafeEqual(expected, received)) {
    return { valid: false, accountId: null };
  }

  // Check timestamp is within 10 minutes
  const MAX_STATE_AGE_MS = 10 * 60 * 1000;
  const timestampNum = parseInt(timestamp, 10);
  if (Number.isNaN(timestampNum) || Date.now() - timestampNum > MAX_STATE_AGE_MS) {
    return { valid: false, accountId: null };
  }

  return { valid: true, accountId };
}

// ---------------------------------------------------------------------------
// Build Wix OAuth consent URL
// ---------------------------------------------------------------------------

export function getWixAuthUrl(state: string, token: string): string {
  const appId = getWixAppId();
  const redirectUrl = `${APP_URL}/api/v1/integrations/wix/callback`;

  const params = new URLSearchParams({
    appId,
    redirectUrl,
    token,
    state,
  });

  return `${WIX_INSTALL_URL}?${params.toString()}`;
}

// ---------------------------------------------------------------------------
// Exchange authorization code for tokens
// ---------------------------------------------------------------------------

export async function exchangeWixCode(code: string): Promise<WixTokenResponse> {
  const appId = getWixAppId();
  const appSecret = getWixAppSecret();

  const response = await fetch(WIX_OAUTH_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      grant_type: 'authorization_code',
      client_id: appId,
      client_secret: appSecret,
      code,
    }),
  });

  if (!response.ok) {
    const errorBody: unknown = await response.json().catch(() => null);
    const message = isWixErrorResponse(errorBody)
      ? errorBody.message
      : `HTTP ${String(response.status)}`;
    throw new Error(`Wix token exchange failed: ${message}`);
  }

  const data: unknown = await response.json();

  if (!isWixTokenResponse(data)) {
    throw new Error('Wix token exchange returned unexpected response shape');
  }

  return data;
}

// ---------------------------------------------------------------------------
// Refresh an expired access token
// ---------------------------------------------------------------------------

export async function refreshWixToken(refreshToken: string): Promise<WixTokenResponse> {
  const appId = getWixAppId();
  const appSecret = getWixAppSecret();

  const response = await fetch(WIX_OAUTH_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      grant_type: 'refresh_token',
      client_id: appId,
      client_secret: appSecret,
      refresh_token: refreshToken,
    }),
  });

  if (!response.ok) {
    const errorBody: unknown = await response.json().catch(() => null);
    const message = isWixErrorResponse(errorBody)
      ? errorBody.message
      : `HTTP ${String(response.status)}`;
    throw new Error(`Wix token refresh failed: ${message}`);
  }

  const data: unknown = await response.json();

  if (!isWixTokenResponse(data)) {
    throw new Error('Wix token refresh returned unexpected response shape');
  }

  return data;
}

// ---------------------------------------------------------------------------
// Inject the HawkLeads widget script into a Wix site
// ---------------------------------------------------------------------------

export async function injectWidgetScript(
  accessToken: string,
  widgetKey: string,
  apiUrl: string
): Promise<string> {
  const response = await fetch(WIX_SCRIPTS_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: accessToken,
    },
    body: JSON.stringify({
      properties: {
        parameters: {
          'data-widget-key': widgetKey,
          'data-api-url': apiUrl,
        },
        placement: {
          location: 'BODY_END',
        },
        source: {
          url: WIX_WIDGET_SCRIPT_URL,
        },
        disabled: false,
      },
    }),
  });

  if (!response.ok) {
    const errorBody: unknown = await response.json().catch(() => null);
    const message = isWixErrorResponse(errorBody)
      ? errorBody.message
      : `HTTP ${String(response.status)}`;
    throw new Error(`Wix script injection failed: ${message}`);
  }

  const data: unknown = await response.json();

  if (!isWixScriptResponse(data)) {
    throw new Error('Wix script injection returned unexpected response shape');
  }

  return data.script.id;
}

// ---------------------------------------------------------------------------
// Remove the HawkLeads widget script from a Wix site
// ---------------------------------------------------------------------------

export async function removeWidgetScript(
  accessToken: string,
  scriptId: string
): Promise<void> {
  const url = `${WIX_SCRIPTS_API_URL}/${encodeURIComponent(scriptId)}`;

  const response = await fetch(url, {
    method: 'DELETE',
    headers: {
      Authorization: accessToken,
    },
  });

  if (!response.ok) {
    const errorBody: unknown = await response.json().catch(() => null);
    const message = isWixErrorResponse(errorBody)
      ? errorBody.message
      : `HTTP ${String(response.status)}`;
    throw new Error(`Wix script removal failed: ${message}`);
  }
}

// ---------------------------------------------------------------------------
// Verify Wix webhook signature
// ---------------------------------------------------------------------------

export function verifyWixWebhookSignature(
  body: string,
  signature: string
): boolean {
  const secret = getWixAppSecret();
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(body)
    .digest('base64');

  const expected = Buffer.from(expectedSignature);
  const received = Buffer.from(signature);

  if (expected.length !== received.length) {
    return false;
  }

  return crypto.timingSafeEqual(expected, received);
}
