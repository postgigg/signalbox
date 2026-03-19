import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { getPlanLimits } from '@/lib/plan-limits';

import type { Plan } from '@/lib/supabase/types';

const optionSchema = z.object({
  id: z.string().min(1).max(50),
  label: z.string().min(1).max(200),
  icon: z.string().max(50).optional(),
  scoreWeight: z.number().int().min(0).max(100),
});

const createSchema = z.object({
  widgetId: z.string().uuid(),
  name: z.string().min(1).max(200),
  targetStepId: z.string().min(1).max(50),
  trafficSplit: z.number().int().min(1).max(99).default(50),
  variantBQuestion: z.string().min(1).max(500),
  variantBOptions: z.array(optionSchema).min(1).max(10),
});

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

  // Optional widget filter
  const widgetId = request.nextUrl.searchParams.get('widgetId');

  const admin = createAdminClient();
  let query = admin
    .from('ab_tests')
    .select('*')
    .eq('account_id', member.account_id)
    .order('created_at', { ascending: false });

  if (widgetId) {
    query = query.eq('widget_id', widgetId);
  }

  const { data: tests, error } = await query;

  if (error) {
    return NextResponse.json({ error: 'Failed to fetch tests' }, { status: 500 });
  }

  return NextResponse.json({ data: tests });
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
  if (!limits.abTesting) {
    return NextResponse.json({ error: 'A/B testing is available on Pro and Agency plans' }, { status: 403 });
  }

  // Check count
  const { count } = await admin
    .from('ab_tests')
    .select('id', { count: 'exact', head: true })
    .eq('account_id', member.account_id)
    .in('status', ['draft', 'running', 'paused']);

  if (count !== null && count >= limits.maxAbTests) {
    return NextResponse.json({ error: `Maximum of ${String(limits.maxAbTests)} active A/B tests allowed` }, { status: 403 });
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

  const { widgetId, name, targetStepId, trafficSplit, variantBQuestion, variantBOptions } = parsed.data;

  // Verify widget belongs to account
  const { data: widget } = await admin
    .from('widgets')
    .select('id')
    .eq('id', widgetId)
    .eq('account_id', member.account_id)
    .single();

  if (!widget) {
    return NextResponse.json({ error: 'Widget not found in your account' }, { status: 400 });
  }

  // Check no running test on same step for same widget
  const { data: conflicting } = await admin
    .from('ab_tests')
    .select('id')
    .eq('widget_id', widgetId)
    .eq('target_step_id', targetStepId)
    .in('status', ['running', 'draft', 'paused'])
    .limit(1)
    .maybeSingle();

  if (conflicting) {
    return NextResponse.json(
      { error: 'An A/B test already exists for this step on this widget' },
      { status: 409 },
    );
  }

  const { data: test, error: insertError } = await admin
    .from('ab_tests')
    .insert({
      widget_id: widgetId,
      account_id: member.account_id,
      name,
      target_step_id: targetStepId,
      traffic_split: trafficSplit,
      variant_b_question: variantBQuestion,
      variant_b_options: variantBOptions as unknown as Record<string, unknown>[],
    })
    .select('*')
    .single();

  if (insertError || !test) {
    return NextResponse.json({ error: 'Failed to create test' }, { status: 500 });
  }

  return NextResponse.json({ data: test }, { status: 201 });
}
