import { NextRequest, NextResponse } from 'next/server';

import { shopifyGdprLimit, checkRateLimit, rateLimitHeaders } from '@/lib/rate-limit';
import { verifyShopifyHmac } from '@/lib/shopify';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const SHOPIFY_HMAC_HEADER = 'x-shopify-hmac-sha256';

// ---------------------------------------------------------------------------
// POST — Handle Shopify GDPR customers/redact webhook
//
// Shopify requires this endpoint for app approval. When a customer requests
// data deletion, Shopify sends this webhook. HawkLeads does not store
// Shopify customer data beyond form submissions (which are tied to the
// merchant's HawkLeads account, not the Shopify customer). This is a
// no-op acknowledgment.
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

  // 4. Acknowledge the request
  // HawkLeads does not store Shopify customer PII beyond form submissions.
  // No customer-specific data deletion is needed.
  return NextResponse.json({ received: true }, { status: 200 });
}
