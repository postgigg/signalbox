import { NextRequest, NextResponse } from 'next/server';

import { createAdminClient } from '@/lib/supabase/admin';
import { shopifyGdprLimit, checkRateLimit, rateLimitHeaders } from '@/lib/rate-limit';
import { verifyShopifyHmac } from '@/lib/shopify';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const SHOPIFY_HMAC_HEADER = 'x-shopify-hmac-sha256';

// ---------------------------------------------------------------------------
// Shop redact payload interface
// ---------------------------------------------------------------------------

interface ShopRedactPayload {
  shop_domain: string;
  shop_id: number;
}

function isShopRedactPayload(value: unknown): value is ShopRedactPayload {
  if (typeof value !== 'object' || value === null) {
    return false;
  }
  const obj = value as Record<string, unknown>;
  return (
    typeof obj['shop_domain'] === 'string' &&
    typeof obj['shop_id'] === 'number'
  );
}

// ---------------------------------------------------------------------------
// POST — Handle Shopify GDPR shop/redact webhook
//
// Shopify requires this endpoint for app approval. This fires 48 hours
// after a merchant uninstalls the app, requesting full data deletion.
// HawkLeads deletes the shopify_installations record for this shop.
// ---------------------------------------------------------------------------

export async function POST(request: NextRequest): Promise<NextResponse> {
  // 1. Rate limit
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown';
  const rlResult = await checkRateLimit(shopifyGdprLimit(), ip);
  if (!rlResult.success) {
    return NextResponse.json(
      { error: 'Too many requests' },
      { status: 429, headers: rateLimitHeaders(rlResult) }
    );
  }

  // 2. Read raw body for signature verification
  const rawBody = await request.text();

  // 3. Verify Shopify HMAC signature
  const hmacHeader = request.headers.get(SHOPIFY_HMAC_HEADER);
  if (!hmacHeader) {
    return NextResponse.json({ error: 'Missing HMAC signature' }, { status: 401 });
  }

  const isValid = verifyShopifyHmac(rawBody, hmacHeader);
  if (!isValid) {
    return NextResponse.json({ error: 'Invalid HMAC signature' }, { status: 401 });
  }

  // 4. Parse body to extract shop domain
  let body: unknown;
  try {
    body = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  if (!isShopRedactPayload(body)) {
    return NextResponse.json({ error: 'Invalid payload shape' }, { status: 400 });
  }

  // 5. Delete all data for this shop
  const admin = createAdminClient();

  const { error: deleteError } = await admin
    .from('shopify_installations')
    .delete()
    .eq('shop_domain', body.shop_domain);

  if (deleteError) {
    return NextResponse.json({ error: 'Failed to delete shop data' }, { status: 500 });
  }

  // 6. Acknowledge the request
  return NextResponse.json({ received: true }, { status: 200 });
}
