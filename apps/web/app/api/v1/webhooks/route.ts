import crypto from 'crypto';

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { getPlanLimits } from '@/lib/plan-limits';
import { RATE_LIMITS } from '@/lib/constants';
import { validateWebhookUrl } from '@/lib/url-validation';

import type { Plan } from '@/lib/supabase/types';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const VALID_WEBHOOK_EVENTS = [
  'submission.created',
  'submission.updated',
  'lead.qualified',
  'lead.converted',
  'lead.score_changed',
] as const;

const MAX_PAGE_SIZE = 100;
const DEFAULT_PAGE_SIZE = 50;

// ---------------------------------------------------------------------------
// Schemas
// ---------------------------------------------------------------------------

const querySchema = z.object({
  cursor: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(MAX_PAGE_SIZE).default(DEFAULT_PAGE_SIZE),
});

const createSchema = z.object({
  url: z.string().min(1).max(2048),
  events: z
    .array(z.enum(VALID_WEBHOOK_EVENTS))
    .min(1)
    .max(VALID_WEBHOOK_EVENTS.length),
  active: z.boolean().optional().default(true),
});

// ---------------------------------------------------------------------------
// GET — list webhooks for account (paginated)
// ---------------------------------------------------------------------------

export async function GET(request: NextRequest): Promise<NextResponse> {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: member } = await supabase
    .from('members')
    .select('account_id')
    .eq('user_id', user.id)
    .limit(1)
    .single();

  if (!member) {
    return NextResponse.json({ error: 'Account not found' }, { status: 404 });
  }

  const searchParams = Object.fromEntries(request.nextUrl.searchParams.entries());
  const parsed = querySchema.safeParse(searchParams);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid query parameters', details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const { cursor, limit } = parsed.data;
  const admin = createAdminClient();

  let query = admin
    .from('webhook_endpoints')
    .select('id, url, events, is_active, last_triggered_at, last_status_code, failure_count, created_at')
    .eq('account_id', member.account_id)
    .order('created_at', { ascending: false })
    .limit(limit + 1);

  if (cursor) {
    query = query.lt('created_at', cursor);
  }

  const { data: endpoints, error: queryError } = await query;

  if (queryError) {
    return NextResponse.json({ error: 'Failed to fetch webhooks' }, { status: 500 });
  }

  const hasMore = (endpoints?.length ?? 0) > limit;
  const items = endpoints?.slice(0, limit) ?? [];
  const nextCursor = hasMore && items.length > 0
    ? items[items.length - 1]?.created_at ?? null
    : null;

  return NextResponse.json({ data: items, nextCursor, hasMore });
}

// ---------------------------------------------------------------------------
// POST — create webhook with plan enforcement
// ---------------------------------------------------------------------------

export async function POST(request: NextRequest): Promise<NextResponse> {
  // 1. Rate limit
  const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
  const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (redisUrl && redisToken) {
    const redis = new Redis({ url: redisUrl, token: redisToken });
    const limiter = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(RATE_LIMITS.webhooks_create.tokens, RATE_LIMITS.webhooks_create.window),
      prefix: RATE_LIMITS.webhooks_create.prefix,
    });
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown';
    const rl = await limiter.limit(ip);
    if (!rl.success) {
      return NextResponse.json(
        { error: 'Too many requests' },
        { status: 429, headers: { 'Retry-After': String(Math.ceil((rl.reset - Date.now()) / 1000)) } },
      );
    }
  }

  // 2. Auth check
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: member } = await supabase
    .from('members')
    .select('account_id, role')
    .eq('user_id', user.id)
    .limit(1)
    .single();

  if (!member || member.role === 'viewer') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  // 3. Fetch account plan
  const admin = createAdminClient();
  const { data: account } = await admin
    .from('accounts')
    .select('plan')
    .eq('id', member.account_id)
    .single();

  if (!account) {
    return NextResponse.json({ error: 'Account not found' }, { status: 404 });
  }

  const limits = getPlanLimits(account.plan as Plan);

  // 4. Check webhookAccess feature flag
  if (!limits.webhookAccess) {
    return NextResponse.json(
      { error: 'Webhook access is not available on your current plan' },
      { status: 403 },
    );
  }

  // 5. Check webhook count vs plan limit
  const { count } = await admin
    .from('webhook_endpoints')
    .select('id', { count: 'exact', head: true })
    .eq('account_id', member.account_id);

  if (count !== null && count >= limits.webhooks) {
    return NextResponse.json(
      { error: `Maximum of ${String(limits.webhooks)} webhooks allowed on your plan` },
      { status: 403 },
    );
  }

  // 6. Parse + validate body
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Validation failed', details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const { url, events, active } = parsed.data;

  // 7. Validate webhook URL (HTTPS, no private IPs, no localhost)
  const urlCheck = validateWebhookUrl(url);
  if (!urlCheck.valid) {
    return NextResponse.json(
      { error: `Invalid webhook URL: ${urlCheck.error ?? 'unknown'}` },
      { status: 400 },
    );
  }

  // 8. Generate HMAC secret
  const secret = crypto.randomBytes(32).toString('hex');

  // 9. Insert into webhook_endpoints
  const { data: endpoint, error: insertError } = await admin
    .from('webhook_endpoints')
    .insert({
      account_id: member.account_id,
      url,
      events,
      is_active: active,
      secret,
    })
    .select('id, url, events, is_active, created_at')
    .single();

  if (insertError || !endpoint) {
    return NextResponse.json({ error: 'Failed to create webhook' }, { status: 500 });
  }

  return NextResponse.json({ data: { ...endpoint, secret } }, { status: 201 });
}
