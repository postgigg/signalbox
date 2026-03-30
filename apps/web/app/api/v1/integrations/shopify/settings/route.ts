import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

import { createAdminClient } from '@/lib/supabase/admin';
import { authenticateRequest, requireRole } from '@/lib/auth';
import { shopifySettingsLimit, checkRateLimit, rateLimitHeaders } from '@/lib/rate-limit';
import { SHOPIFY_WIDGET_SCRIPT_URL } from '@/lib/constants';
import { createScriptTag, deleteScriptTag } from '@/lib/shopify';

// ---------------------------------------------------------------------------
// Schemas
// ---------------------------------------------------------------------------

const SHOP_DOMAIN_REGEX = /^[a-zA-Z0-9][a-zA-Z0-9-]*\.myshopify\.com$/;

const getQuerySchema = z.object({
  shopDomain: z.string().min(1).max(255).regex(SHOP_DOMAIN_REGEX),
});

const putBodySchema = z.object({
  shopDomain: z.string().min(1).max(255).regex(SHOP_DOMAIN_REGEX),
  widgetId: z.string().uuid(),
});

// ---------------------------------------------------------------------------
// GET — Return current widget assignment for a Shopify installation
// ---------------------------------------------------------------------------

export async function GET(request: NextRequest): Promise<NextResponse> {
  // 1. Rate limit
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown';
  const rlResult = await checkRateLimit(shopifySettingsLimit(), ip);
  if (!rlResult.success) {
    return NextResponse.json(
      { error: 'Too many requests' },
      { status: 429, headers: rateLimitHeaders(rlResult) }
    );
  }

  // 2. Auth check
  const authResult = await authenticateRequest(request);
  if ('error' in authResult) return authResult.error;
  const { account } = authResult.ctx;

  // 3. Parse query params
  const searchParams = Object.fromEntries(request.nextUrl.searchParams.entries());
  const parsed = getQuerySchema.safeParse(searchParams);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid query parameters', details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  // 4. Look up installation
  const admin = createAdminClient();
  const { data: installation, error: queryError } = await admin
    .from('shopify_installations')
    .select('id, account_id, widget_id, shop_domain, script_tag_id, is_active, installed_at')
    .eq('shop_domain', parsed.data.shopDomain)
    .eq('account_id', account.id)
    .eq('is_active', true)
    .limit(1)
    .maybeSingle();

  if (queryError) {
    return NextResponse.json({ error: 'Failed to fetch installation' }, { status: 500 });
  }

  if (!installation) {
    return NextResponse.json({ error: 'Shopify installation not found' }, { status: 404 });
  }

  return NextResponse.json({
    data: {
      id: installation.id,
      widgetId: installation.widget_id,
      shopDomain: installation.shop_domain,
      scriptTagId: installation.script_tag_id,
      isActive: installation.is_active,
      installedAt: installation.installed_at,
    },
  });
}

// ---------------------------------------------------------------------------
// PUT — Update widget assignment, swap ScriptTag on Shopify store
// ---------------------------------------------------------------------------

export async function PUT(request: NextRequest): Promise<NextResponse> {
  // 1. Rate limit
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown';
  const rlResult = await checkRateLimit(shopifySettingsLimit(), ip);
  if (!rlResult.success) {
    return NextResponse.json(
      { error: 'Too many requests' },
      { status: 429, headers: rateLimitHeaders(rlResult) }
    );
  }

  // 2. Auth check
  const authResult = await authenticateRequest(request);
  if ('error' in authResult) return authResult.error;
  const { member, account } = authResult.ctx;

  // 3. Role check — only owner or admin
  const roleError = requireRole(member, ['owner', 'admin']);
  if (roleError) return roleError;

  // 4. Parse body
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

  const { shopDomain, widgetId } = parsed.data;

  // 5. Verify the widget belongs to this account
  const admin = createAdminClient();

  const { data: widget, error: widgetError } = await admin
    .from('widgets')
    .select('id, widget_key')
    .eq('id', widgetId)
    .eq('account_id', account.id)
    .eq('is_active', true)
    .limit(1)
    .maybeSingle();

  if (widgetError) {
    return NextResponse.json({ error: 'Failed to verify widget' }, { status: 500 });
  }

  if (!widget) {
    return NextResponse.json({ error: 'Widget not found' }, { status: 404 });
  }

  // 6. Look up Shopify installation
  const { data: installation, error: installError } = await admin
    .from('shopify_installations')
    .select('id, account_id, shop_domain, access_token, script_tag_id, is_active, widget_id')
    .eq('shop_domain', shopDomain)
    .eq('account_id', account.id)
    .eq('is_active', true)
    .limit(1)
    .maybeSingle();

  if (installError) {
    return NextResponse.json({ error: 'Failed to fetch installation' }, { status: 500 });
  }

  if (!installation) {
    return NextResponse.json({ error: 'Shopify installation not found' }, { status: 404 });
  }

  // 7. Delete old ScriptTag if one exists
  if (installation.script_tag_id) {
    try {
      await deleteScriptTag(
        installation.shop_domain,
        installation.access_token,
        installation.script_tag_id
      );
    } catch {
      // Old tag deletion is non-fatal; proceed with creating new one
    }
  }

  // 8. Create new ScriptTag with updated widget script URL
  let newScriptTagId: number | null = null;

  try {
    newScriptTagId = await createScriptTag(
      installation.shop_domain,
      installation.access_token,
      SHOPIFY_WIDGET_SCRIPT_URL
    );
  } catch {
    return NextResponse.json(
      { error: 'Failed to inject widget script into Shopify store' },
      { status: 502 }
    );
  }

  // 9. Update widget_id and script_tag_id on installation record
  const { error: updateError } = await admin
    .from('shopify_installations')
    .update({
      widget_id: widgetId,
      script_tag_id: newScriptTagId,
      updated_at: new Date().toISOString(),
    })
    .eq('id', installation.id);

  if (updateError) {
    return NextResponse.json({ error: 'Failed to update installation' }, { status: 500 });
  }

  return NextResponse.json({
    data: {
      shopDomain,
      widgetId,
      scriptTagId: newScriptTagId,
      scriptInjected: true,
    },
  });
}
