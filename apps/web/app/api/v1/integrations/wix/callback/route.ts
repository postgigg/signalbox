import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

import { createAdminClient } from '@/lib/supabase/admin';
import { wixOAuthLimit, checkRateLimit, rateLimitHeaders } from '@/lib/rate-limit';
import { APP_URL } from '@/lib/constants';
import { exchangeWixCode, verifyState } from '@/lib/wix';

// ---------------------------------------------------------------------------
// Query schema
// ---------------------------------------------------------------------------

const callbackSchema = z.object({
  code: z.string().min(1).max(2048),
  instanceId: z.string().min(1).max(500),
  state: z.string().min(1).max(2048),
});

// ---------------------------------------------------------------------------
// GET — Wix OAuth callback after user grants consent
// ---------------------------------------------------------------------------

export async function GET(request: NextRequest): Promise<NextResponse> {
  // 1. Rate limit
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown';
  const rlResult = await checkRateLimit(wixOAuthLimit(), ip);
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
    const errorUrl = `${APP_URL}/dashboard/integrations/wix?error=invalid_params`;
    return NextResponse.redirect(errorUrl);
  }

  const { code, instanceId, state } = parsed.data;

  // 3. Verify HMAC-signed state
  const stateResult = verifyState(state);
  if (!stateResult.valid || !stateResult.accountId) {
    const errorUrl = `${APP_URL}/dashboard/integrations/wix?error=invalid_state`;
    return NextResponse.redirect(errorUrl);
  }

  const accountId = stateResult.accountId;

  // 4. Exchange code for tokens
  let accessToken: string;
  let refreshToken: string;
  let expiresIn: number;

  try {
    const tokenResponse = await exchangeWixCode(code);
    accessToken = tokenResponse.access_token;
    refreshToken = tokenResponse.refresh_token;
    expiresIn = tokenResponse.expires_in;
  } catch {
    const errorUrl = `${APP_URL}/dashboard/integrations/wix?error=token_exchange_failed`;
    return NextResponse.redirect(errorUrl);
  }

  // 5. Calculate token expiry
  const expiresAt = new Date(Date.now() + expiresIn * 1000).toISOString();

  // 6. Upsert into wix_installations
  const admin = createAdminClient();

  const { error: upsertError } = await admin
    .from('wix_installations')
    .upsert(
      {
        account_id: accountId,
        wix_instance_id: instanceId,
        wix_refresh_token: refreshToken,
        wix_access_token: accessToken,
        wix_token_expires_at: expiresAt,
        is_active: true,
        uninstalled_at: null,
        installed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'wix_instance_id' }
    );

  if (upsertError) {
    const errorUrl = `${APP_URL}/dashboard/integrations/wix?error=save_failed`;
    return NextResponse.redirect(errorUrl);
  }

  // 7. Redirect to success page
  const successUrl = `${APP_URL}/dashboard/integrations/wix?installed=true`;
  return NextResponse.redirect(successUrl);
}
