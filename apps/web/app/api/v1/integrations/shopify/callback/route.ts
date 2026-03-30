import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

import { createAdminClient } from '@/lib/supabase/admin';
import { shopifyOAuthLimit, checkRateLimit, rateLimitHeaders } from '@/lib/rate-limit';
import { APP_URL, SHOPIFY_WIDGET_SCRIPT_URL } from '@/lib/constants';
import {
  exchangeShopifyCode,
  verifyState,
  verifyShopifyQueryHmac,
  createScriptTag,
  registerUninstallWebhook,
} from '@/lib/shopify';

// ---------------------------------------------------------------------------
// Query schema
// ---------------------------------------------------------------------------

const SHOP_DOMAIN_REGEX = /^[a-zA-Z0-9][a-zA-Z0-9-]*\.myshopify\.com$/;

const callbackSchema = z.object({
  code: z.string().min(1).max(2048),
  shop: z.string().min(1).max(255).regex(SHOP_DOMAIN_REGEX),
  state: z.string().min(1).max(2048),
  hmac: z.string().min(1).max(512),
  timestamp: z.string().min(1).max(20),
});

// ---------------------------------------------------------------------------
// GET — Shopify OAuth callback after merchant grants consent
// ---------------------------------------------------------------------------

export async function GET(request: NextRequest): Promise<NextResponse> {
  // 1. Rate limit
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown';
  const rlResult = await checkRateLimit(shopifyOAuthLimit(), ip);
  if (!rlResult.success) {
    return NextResponse.json(
      { error: 'Too many requests' },
      { status: 429, headers: rateLimitHeaders(rlResult) }
    );
  }

  // 2. Parse query params
  const searchParams = Object.fromEntries(request.nextUrl.searchParams.entries());
  const parsed = callbackSchema.safeParse(searchParams);
  if (!parsed.success) {
    const errorUrl = `${APP_URL}/dashboard/integrations/shopify?error=invalid_params`;
    return NextResponse.redirect(errorUrl);
  }

  const { code, shop, state } = parsed.data;

  // 3. Verify HMAC of query params (Shopify signs the entire query string)
  const isHmacValid = verifyShopifyQueryHmac(searchParams);
  if (!isHmacValid) {
    const errorUrl = `${APP_URL}/dashboard/integrations/shopify?error=invalid_hmac`;
    return NextResponse.redirect(errorUrl);
  }

  // 4. Verify HMAC-signed state
  const stateResult = verifyState(state);
  if (!stateResult.valid || !stateResult.accountId) {
    const errorUrl = `${APP_URL}/dashboard/integrations/shopify?error=invalid_state`;
    return NextResponse.redirect(errorUrl);
  }

  const accountId = stateResult.accountId;

  // 5. Exchange code for permanent access token
  let accessToken: string;

  try {
    const tokenResponse = await exchangeShopifyCode(shop, code);
    accessToken = tokenResponse.access_token;
  } catch {
    const errorUrl = `${APP_URL}/dashboard/integrations/shopify?error=token_exchange_failed`;
    return NextResponse.redirect(errorUrl);
  }

  // 6. Create ScriptTag to inject HawkLeads widget
  let scriptTagId: number | null = null;

  try {
    scriptTagId = await createScriptTag(shop, accessToken, SHOPIFY_WIDGET_SCRIPT_URL);
  } catch {
    // Script tag creation is non-fatal; merchant can configure widget later
  }

  // 7. Register app/uninstalled webhook
  const webhookCallbackUrl = `${APP_URL}/api/v1/integrations/shopify/webhook`;

  try {
    await registerUninstallWebhook(shop, accessToken, webhookCallbackUrl);
  } catch {
    // Webhook registration is non-fatal; app can still function
  }

  // 8. Upsert into shopify_installations
  const admin = createAdminClient();

  const { error: upsertError } = await admin
    .from('shopify_installations')
    .upsert(
      {
        account_id: accountId,
        shop_domain: shop,
        access_token: accessToken,
        script_tag_id: scriptTagId,
        is_active: true,
        uninstalled_at: null,
        installed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'shop_domain' }
    );

  if (upsertError) {
    const errorUrl = `${APP_URL}/dashboard/integrations/shopify?error=save_failed`;
    return NextResponse.redirect(errorUrl);
  }

  // 9. Redirect to success page
  const successUrl = `${APP_URL}/dashboard/integrations/shopify?installed=true`;
  return NextResponse.redirect(successUrl);
}
