import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import crypto from 'crypto';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { getPlanLimits } from '@/lib/plan-limits';

import type { Plan } from '@/lib/supabase/types';

const createSchema = z.object({
  name: z.string().min(1).max(200),
  clientAccountId: z.string().uuid().optional(),
  widgetId: z.string().uuid().optional(),
  expiresAt: z.string().datetime().optional(),
  password: z.string().min(6).max(100).optional(),
  allowedMetrics: z.array(z.enum(['submissions', 'tier_breakdown', 'conversion_rate', 'over_time'])).optional(),
});

export async function GET(_request: NextRequest): Promise<NextResponse> {
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

  const admin = createAdminClient();
  const { data: links, error } = await admin
    .from('shared_analytics_links')
    .select('id, name, token, is_active, expires_at, client_account_id, widget_id, allowed_metrics, access_count, last_accessed_at, created_at')
    .eq('account_id', member.account_id)
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: 'Failed to fetch links' }, { status: 500 });
  }

  return NextResponse.json({ data: links });
}

export async function POST(request: NextRequest): Promise<NextResponse> {
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
  if (!limits.sharedAnalytics) {
    return NextResponse.json({ error: 'Shared analytics is available on the Agency plan' }, { status: 403 });
  }

  // Check count
  const { count } = await admin
    .from('shared_analytics_links')
    .select('id', { count: 'exact', head: true })
    .eq('account_id', member.account_id);

  if (count !== null && count >= limits.maxSharedLinks) {
    return NextResponse.json({ error: `Maximum of ${String(limits.maxSharedLinks)} shared links allowed` }, { status: 403 });
  }

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

  const { name, clientAccountId, widgetId, expiresAt, password, allowedMetrics } = parsed.data;

  // Generate a 32-char hex token
  const token = crypto.randomBytes(16).toString('hex');

  // Hash password if provided
  let passwordHash: string | null = null;
  if (password) {
    const hashBuffer = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(password));
    passwordHash = Array.from(new Uint8Array(hashBuffer)).map((b) => b.toString(16).padStart(2, '0')).join('');
  }

  const { data: link, error: insertError } = await admin
    .from('shared_analytics_links')
    .insert({
      account_id: member.account_id,
      client_account_id: clientAccountId ?? null,
      widget_id: widgetId ?? null,
      token,
      name,
      expires_at: expiresAt ?? null,
      password_hash: passwordHash,
      allowed_metrics: allowedMetrics ?? ['submissions', 'tier_breakdown', 'conversion_rate', 'over_time'],
    })
    .select('id, name, token, is_active, expires_at, allowed_metrics, created_at')
    .single();

  if (insertError || !link) {
    return NextResponse.json({ error: 'Failed to create link' }, { status: 500 });
  }

  return NextResponse.json({ data: link }, { status: 201 });
}
