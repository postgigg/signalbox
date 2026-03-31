import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

import { createAdminClient } from '@/lib/supabase/admin';
import { wixSettingsLimit, checkRateLimit, rateLimitHeaders } from '@/lib/rate-limit';
import { APP_URL } from '@/lib/constants';
import { injectWidgetScript, refreshWixToken } from '@/lib/wix';

// ---------------------------------------------------------------------------
// Schemas
// ---------------------------------------------------------------------------

const getQuerySchema = z.object({
  instanceId: z.string().min(1).max(500),
});

const putBodySchema = z.object({
  instanceId: z.string().min(1).max(500),
  widgetId: z.string().uuid(),
});

// ---------------------------------------------------------------------------
// Helper: get a valid access token, refreshing if expired
// ---------------------------------------------------------------------------

interface WixInstallationTokenFields {
  id: string;
  wix_refresh_token: string;
  wix_access_token: string | null;
  wix_token_expires_at: string | null;
}

async function getValidAccessToken(
  installation: WixInstallationTokenFields
): Promise<string> {
  // Check if current token is still valid (with 60s buffer)
  if (
    installation.wix_access_token &&
    installation.wix_token_expires_at
  ) {
    const expiresAt = new Date(installation.wix_token_expires_at).getTime();
    const bufferMs = 60 * 1000;
    if (Date.now() < expiresAt - bufferMs) {
      return installation.wix_access_token;
    }
  }

  // Token expired or missing: refresh
  const tokenResponse = await refreshWixToken(installation.wix_refresh_token);

  // Update stored tokens
  const admin = createAdminClient();
  const expiresAt = new Date(Date.now() + tokenResponse.expires_in * 1000).toISOString();

  await admin
    .from('wix_installations')
    .update({
      wix_access_token: tokenResponse.access_token,
      wix_refresh_token: tokenResponse.refresh_token,
      wix_token_expires_at: expiresAt,
      updated_at: new Date().toISOString(),
    })
    .eq('id', installation.id);

  return tokenResponse.access_token;
}

// ---------------------------------------------------------------------------
// GET — Return current widget_id for a Wix installation
// ---------------------------------------------------------------------------

export async function GET(request: NextRequest): Promise<NextResponse> {
  // 1. Rate limit
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown';
  const rlResult = await checkRateLimit(wixSettingsLimit(), ip);
  if (!rlResult.success) {
    return NextResponse.json(
      { error: 'Too many requests' },
      { status: 429, headers: rateLimitHeaders(rlResult) }
    );
  }

  // 2. Parse query params (auth is via Wix instance ID, not Supabase session)
  const searchParams = Object.fromEntries(request.nextUrl.searchParams.entries());
  const parsed = getQuerySchema.safeParse(searchParams);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid query parameters', details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  // 3. Look up installation by instance ID
  const admin = createAdminClient();
  const { data: installation, error: queryError } = await admin
    .from('wix_installations')
    .select('id, account_id, widget_id, wix_instance_id, wix_site_url, is_active, installed_at')
    .eq('wix_instance_id', parsed.data.instanceId)
    .eq('is_active', true)
    .limit(1)
    .maybeSingle();

  if (queryError) {
    return NextResponse.json({ error: 'Failed to fetch installation' }, { status: 500 });
  }

  // 4. If no installation found, return hasAccount: false so the UI shows signup
  if (!installation) {
    return NextResponse.json({ hasAccount: false, widgets: [], selectedWidgetId: null });
  }

  // 5. Fetch widgets for this account
  const { data: widgets } = await admin
    .from('widgets')
    .select('id, name, steps:flows(id)')
    .eq('account_id', installation.account_id)
    .eq('is_active', true)
    .order('created_at', { ascending: false });

  const widgetList = (widgets ?? []).map((w: Record<string, unknown>) => ({
    id: String(w.id),
    name: String(w.name),
    steps_count: Array.isArray(w.steps) ? w.steps.length : 0,
  }));

  return NextResponse.json({
    hasAccount: true,
    widgets: widgetList,
    selectedWidgetId: installation.widget_id,
  });
}

// ---------------------------------------------------------------------------
// PUT — Update widget_id and inject script into Wix site
// ---------------------------------------------------------------------------

export async function PUT(request: NextRequest): Promise<NextResponse> {
  // 1. Rate limit
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown';
  const rlResult = await checkRateLimit(wixSettingsLimit(), ip);
  if (!rlResult.success) {
    return NextResponse.json(
      { error: 'Too many requests' },
      { status: 429, headers: rateLimitHeaders(rlResult) }
    );
  }

  // 2. Parse body (auth is via Wix instance ID, not Supabase session)
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const parsed = putBodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Validation failed', details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { instanceId, widgetId } = parsed.data;

  // 3. Look up installation to get account_id
  const admin = createAdminClient();

  const { data: installation, error: installLookupError } = await admin
    .from('wix_installations')
    .select('id, account_id, wix_refresh_token, wix_access_token, wix_token_expires_at, is_active, widget_id')
    .eq('wix_instance_id', instanceId)
    .eq('is_active', true)
    .limit(1)
    .maybeSingle();

  if (installLookupError || !installation) {
    return NextResponse.json({ error: 'Wix installation not found' }, { status: 404 });
  }

  // 4. Verify the widget belongs to this account
  const { data: widget, error: widgetError } = await admin
    .from('widgets')
    .select('id, widget_key')
    .eq('id', widgetId)
    .eq('account_id', installation.account_id)
    .eq('is_active', true)
    .limit(1)
    .maybeSingle();

  if (widgetError) {
    return NextResponse.json({ error: 'Failed to verify widget' }, { status: 500 });
  }

  if (!widget) {
    return NextResponse.json({ error: 'Widget not found' }, { status: 404 });
  }

  // 5. Try to inject widget script (optional — works when OAuth tokens exist)
  let scriptInjected = false;
  if (installation.wix_refresh_token) {
    try {
      const accessToken = await getValidAccessToken(installation);
      const apiUrl = `${APP_URL}/api/v1`;
      await injectWidgetScript(accessToken, widget.widget_key, apiUrl);
      scriptInjected = true;
    } catch {
      // Script injection failed — widget can still be embedded manually via embed code
    }
  }

  // 6. Update widget_id on installation record
  const { error: updateError } = await admin
    .from('wix_installations')
    .update({
      widget_id: widgetId,
      updated_at: new Date().toISOString(),
    })
    .eq('id', installation.id);

  if (updateError) {
    return NextResponse.json({ error: 'Failed to update installation' }, { status: 500 });
  }

  return NextResponse.json({
    data: {
      instanceId,
      widgetId,
      scriptInjected,
    },
  });
}

// POST — alias for PUT (Wix settings page sends POST)
export async function POST(request: NextRequest): Promise<NextResponse> {
  return PUT(request);
}
