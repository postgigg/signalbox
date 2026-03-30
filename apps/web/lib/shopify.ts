import crypto from 'crypto';

import {
  SHOPIFY_API_VERSION,
  SHOPIFY_REQUIRED_SCOPES,
  APP_URL,
} from '@/lib/constants';

// ---------------------------------------------------------------------------
// Environment helpers
// ---------------------------------------------------------------------------

function getShopifyApiKey(): string {
  const apiKey = process.env.SHOPIFY_API_KEY;
  if (!apiKey) {
    throw new Error('Missing SHOPIFY_API_KEY environment variable');
  }
  return apiKey;
}

function getShopifyApiSecret(): string {
  const secret = process.env.SHOPIFY_API_SECRET;
  if (!secret) {
    throw new Error('Missing SHOPIFY_API_SECRET environment variable');
  }
  return secret;
}

// ---------------------------------------------------------------------------
// Shopify access token response interface
// ---------------------------------------------------------------------------

interface ShopifyTokenResponse {
  access_token: string;
  scope: string;
}

function isShopifyTokenResponse(value: unknown): value is ShopifyTokenResponse {
  if (typeof value !== 'object' || value === null) {
    return false;
  }
  const obj = value as Record<string, unknown>;
  return (
    typeof obj['access_token'] === 'string' &&
    typeof obj['scope'] === 'string'
  );
}

// ---------------------------------------------------------------------------
// Shopify ScriptTag response interface
// ---------------------------------------------------------------------------

interface ShopifyScriptTagResponse {
  script_tag: {
    id: number;
    src: string;
    event: string;
  };
}

function isShopifyScriptTagResponse(value: unknown): value is ShopifyScriptTagResponse {
  if (typeof value !== 'object' || value === null) {
    return false;
  }
  const obj = value as Record<string, unknown>;
  if (typeof obj['script_tag'] !== 'object' || obj['script_tag'] === null) {
    return false;
  }
  const tag = obj['script_tag'] as Record<string, unknown>;
  return typeof tag['id'] === 'number' && typeof tag['src'] === 'string';
}

// ---------------------------------------------------------------------------
// Shopify ScriptTag list response interface
// ---------------------------------------------------------------------------

interface ShopifyScriptTagListResponse {
  script_tags: Array<{
    id: number;
    src: string;
    event: string;
  }>;
}

function isShopifyScriptTagListResponse(value: unknown): value is ShopifyScriptTagListResponse {
  if (typeof value !== 'object' || value === null) {
    return false;
  }
  const obj = value as Record<string, unknown>;
  return Array.isArray(obj['script_tags']);
}

// ---------------------------------------------------------------------------
// Shopify webhook response interface
// ---------------------------------------------------------------------------

interface ShopifyWebhookResponse {
  webhook: {
    id: number;
    topic: string;
    address: string;
  };
}

function isShopifyWebhookResponse(value: unknown): value is ShopifyWebhookResponse {
  if (typeof value !== 'object' || value === null) {
    return false;
  }
  const obj = value as Record<string, unknown>;
  if (typeof obj['webhook'] !== 'object' || obj['webhook'] === null) {
    return false;
  }
  const webhook = obj['webhook'] as Record<string, unknown>;
  return typeof webhook['id'] === 'number' && typeof webhook['topic'] === 'string';
}

// ---------------------------------------------------------------------------
// Shopify error response interface
// ---------------------------------------------------------------------------

interface ShopifyErrorResponse {
  errors: string;
}

function isShopifyErrorResponse(value: unknown): value is ShopifyErrorResponse {
  if (typeof value !== 'object' || value === null) {
    return false;
  }
  const obj = value as Record<string, unknown>;
  return typeof obj['errors'] === 'string';
}

// ---------------------------------------------------------------------------
// HMAC state signing for OAuth state parameter
// ---------------------------------------------------------------------------

export function signState(accountId: string): string {
  const secret = getShopifyApiSecret();
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

  const secret = getShopifyApiSecret();
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
// Build Shopify OAuth consent URL
// ---------------------------------------------------------------------------

export function getShopifyAuthUrl(shop: string, state: string): string {
  const apiKey = getShopifyApiKey();
  const redirectUri = `${APP_URL}/api/v1/integrations/shopify/callback`;

  const params = new URLSearchParams({
    client_id: apiKey,
    scope: SHOPIFY_REQUIRED_SCOPES,
    redirect_uri: redirectUri,
    state,
  });

  return `https://${shop}/admin/oauth/authorize?${params.toString()}`;
}

// ---------------------------------------------------------------------------
// Exchange authorization code for permanent access token
// ---------------------------------------------------------------------------

export async function exchangeShopifyCode(
  shop: string,
  code: string
): Promise<ShopifyTokenResponse> {
  const apiKey = getShopifyApiKey();
  const apiSecret = getShopifyApiSecret();

  const response = await fetch(`https://${shop}/admin/oauth/access_token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      client_id: apiKey,
      client_secret: apiSecret,
      code,
    }),
  });

  if (!response.ok) {
    const errorBody: unknown = await response.json().catch(() => null);
    const message = isShopifyErrorResponse(errorBody)
      ? errorBody.errors
      : `HTTP ${String(response.status)}`;
    throw new Error(`Shopify token exchange failed: ${message}`);
  }

  const data: unknown = await response.json();

  if (!isShopifyTokenResponse(data)) {
    throw new Error('Shopify token exchange returned unexpected response shape');
  }

  return data;
}

// ---------------------------------------------------------------------------
// Verify Shopify webhook HMAC signature
// ---------------------------------------------------------------------------

export function verifyShopifyHmac(body: string, hmacHeader: string): boolean {
  const secret = getShopifyApiSecret();
  const expectedHmac = crypto
    .createHmac('sha256', secret)
    .update(body, 'utf8')
    .digest('base64');

  const expected = Buffer.from(expectedHmac);
  const received = Buffer.from(hmacHeader);

  if (expected.length !== received.length) {
    return false;
  }

  return crypto.timingSafeEqual(expected, received);
}

// ---------------------------------------------------------------------------
// Verify Shopify OAuth callback query HMAC
// ---------------------------------------------------------------------------

export function verifyShopifyQueryHmac(query: Record<string, string>): boolean {
  const secret = getShopifyApiSecret();
  const receivedHmac = query['hmac'];

  if (!receivedHmac) {
    return false;
  }

  // Build the message string from query params, excluding hmac
  const entries = Object.entries(query)
    .filter(([key]) => key !== 'hmac')
    .sort(([a], [b]) => a.localeCompare(b));

  const message = entries
    .map(([key, value]) => `${key}=${value}`)
    .join('&');

  const expectedHmac = crypto
    .createHmac('sha256', secret)
    .update(message)
    .digest('hex');

  // Timing-safe comparison
  const expected = Buffer.from(expectedHmac, 'hex');
  const received = Buffer.from(receivedHmac, 'hex');

  if (expected.length !== received.length) {
    return false;
  }

  return crypto.timingSafeEqual(expected, received);
}

// ---------------------------------------------------------------------------
// Create a ScriptTag to inject HawkLeads widget
// ---------------------------------------------------------------------------

export async function createScriptTag(
  shop: string,
  accessToken: string,
  scriptUrl: string
): Promise<number> {
  const url = `https://${shop}/admin/api/${SHOPIFY_API_VERSION}/script_tags.json`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Access-Token': accessToken,
    },
    body: JSON.stringify({
      script_tag: {
        event: 'onload',
        src: scriptUrl,
      },
    }),
  });

  if (!response.ok) {
    const errorBody: unknown = await response.json().catch(() => null);
    const message = isShopifyErrorResponse(errorBody)
      ? errorBody.errors
      : `HTTP ${String(response.status)}`;
    throw new Error(`Shopify ScriptTag creation failed: ${message}`);
  }

  const data: unknown = await response.json();

  if (!isShopifyScriptTagResponse(data)) {
    throw new Error('Shopify ScriptTag creation returned unexpected response shape');
  }

  return data.script_tag.id;
}

// ---------------------------------------------------------------------------
// Delete a ScriptTag
// ---------------------------------------------------------------------------

export async function deleteScriptTag(
  shop: string,
  accessToken: string,
  scriptTagId: number
): Promise<void> {
  const url = `https://${shop}/admin/api/${SHOPIFY_API_VERSION}/script_tags/${String(scriptTagId)}.json`;

  const response = await fetch(url, {
    method: 'DELETE',
    headers: {
      'X-Shopify-Access-Token': accessToken,
    },
  });

  if (!response.ok) {
    const errorBody: unknown = await response.json().catch(() => null);
    const message = isShopifyErrorResponse(errorBody)
      ? errorBody.errors
      : `HTTP ${String(response.status)}`;
    throw new Error(`Shopify ScriptTag deletion failed: ${message}`);
  }
}

// ---------------------------------------------------------------------------
// List all ScriptTags
// ---------------------------------------------------------------------------

export interface ShopifyScriptTag {
  id: number;
  src: string;
  event: string;
}

export async function listScriptTags(
  shop: string,
  accessToken: string
): Promise<ShopifyScriptTag[]> {
  const url = `https://${shop}/admin/api/${SHOPIFY_API_VERSION}/script_tags.json`;

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'X-Shopify-Access-Token': accessToken,
    },
  });

  if (!response.ok) {
    const errorBody: unknown = await response.json().catch(() => null);
    const message = isShopifyErrorResponse(errorBody)
      ? errorBody.errors
      : `HTTP ${String(response.status)}`;
    throw new Error(`Shopify ScriptTag listing failed: ${message}`);
  }

  const data: unknown = await response.json();

  if (!isShopifyScriptTagListResponse(data)) {
    throw new Error('Shopify ScriptTag listing returned unexpected response shape');
  }

  return data.script_tags.map((tag) => ({
    id: tag.id,
    src: tag.src,
    event: tag.event,
  }));
}

// ---------------------------------------------------------------------------
// Register the app/uninstalled webhook
// ---------------------------------------------------------------------------

export async function registerUninstallWebhook(
  shop: string,
  accessToken: string,
  callbackUrl: string
): Promise<number> {
  const url = `https://${shop}/admin/api/${SHOPIFY_API_VERSION}/webhooks.json`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Access-Token': accessToken,
    },
    body: JSON.stringify({
      webhook: {
        topic: 'app/uninstalled',
        address: callbackUrl,
        format: 'json',
      },
    }),
  });

  if (!response.ok) {
    const errorBody: unknown = await response.json().catch(() => null);
    const message = isShopifyErrorResponse(errorBody)
      ? errorBody.errors
      : `HTTP ${String(response.status)}`;
    throw new Error(`Shopify webhook registration failed: ${message}`);
  }

  const data: unknown = await response.json();

  if (!isShopifyWebhookResponse(data)) {
    throw new Error('Shopify webhook registration returned unexpected response shape');
  }

  return data.webhook.id;
}
