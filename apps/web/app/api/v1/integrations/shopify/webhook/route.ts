import { NextRequest, NextResponse } from 'next/server';

import { createAdminClient } from '@/lib/supabase/admin';
import { shopifyWebhookLimit, checkRateLimit, rateLimitHeaders } from '@/lib/rate-limit';
import { verifyShopifyHmac } from '@/lib/shopify';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const SHOPIFY_HMAC_HEADER = 'x-shopify-hmac-sha256';
const SHOPIFY_SHOP_HEADER = 'x-shopify-shop-domain';
const SHOPIFY_TOPIC_HEADER = 'x-shopify-topic';

// ---------------------------------------------------------------------------
// POST — Handle Shopify lifecycle webhooks (app/uninstalled)
// ---------------------------------------------------------------------------

export async function POST(request: NextRequest): Promise<NextResponse> {
  // 1. Rate limit
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown';
  const rlResult = await checkRateLimit(shopifyWebhookLimit(), ip);
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

  // 4. Read shop domain and topic from headers
  const shopDomain = request.headers.get(SHOPIFY_SHOP_HEADER);
  const topic = request.headers.get(SHOPIFY_TOPIC_HEADER);

  if (!shopDomain) {
    return NextResponse.json({ error: 'Missing shop domain header' }, { status: 400 });
  }

  if (!topic) {
    return NextResponse.json({ error: 'Missing topic header' }, { status: 400 });
  }

  // 5. Handle event
  const admin = createAdminClient();

  if (topic === 'app/uninstalled') {
    const { error: updateError } = await admin
      .from('shopify_installations')
      .update({
        is_active: false,
        uninstalled_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('shop_domain', shopDomain);

    if (updateError) {
      return NextResponse.json({ error: 'Failed to process uninstall' }, { status: 500 });
    }
  }

  // 6. Return 200 OK
  return NextResponse.json({ received: true }, { status: 200 });
}
