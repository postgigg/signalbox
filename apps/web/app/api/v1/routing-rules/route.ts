import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { getPlanLimits } from '@/lib/plan-limits';

import type { Plan } from '@/lib/supabase/types';

const createSchema = z.object({
  name: z.string().min(1).max(200),
  widgetId: z.string().uuid().optional(),
  priority: z.number().int().min(0).max(100).default(0),
  matchTier: z.enum(['hot', 'warm', 'cold']).optional(),
  matchStepId: z.string().max(50).optional(),
  matchOptionId: z.string().max(50).optional(),
  assignToMemberId: z.string().uuid(),
}).refine(
  (data) => data.matchTier !== undefined || (data.matchStepId !== undefined && data.matchOptionId !== undefined),
  { message: 'Either matchTier or both matchStepId and matchOptionId must be provided' },
);

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
  const { data: rules, error } = await admin
    .from('lead_routing_rules')
    .select('*')
    .eq('account_id', member.account_id)
    .order('priority', { ascending: false });

  if (error) {
    return NextResponse.json({ error: 'Failed to fetch rules' }, { status: 500 });
  }

  return NextResponse.json({ data: rules });
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

  // Plan gate
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
  if (!limits.leadRouting) {
    return NextResponse.json({ error: 'Lead routing is available on Pro and Agency plans' }, { status: 403 });
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

  const { name, widgetId, priority, matchTier, matchStepId, matchOptionId, assignToMemberId } = parsed.data;

  // Verify assignee is a member of this account
  const { data: assignee } = await admin
    .from('members')
    .select('id')
    .eq('id', assignToMemberId)
    .eq('account_id', member.account_id)
    .single();

  if (!assignee) {
    return NextResponse.json({ error: 'Assignee must be a member of your account' }, { status: 400 });
  }

  // Verify widget belongs to account if specified
  if (widgetId) {
    const { data: widget } = await admin
      .from('widgets')
      .select('id')
      .eq('id', widgetId)
      .eq('account_id', member.account_id)
      .single();

    if (!widget) {
      return NextResponse.json({ error: 'Widget not found in your account' }, { status: 400 });
    }
  }

  const { data: rule, error: insertError } = await admin
    .from('lead_routing_rules')
    .insert({
      account_id: member.account_id,
      widget_id: widgetId ?? null,
      name,
      priority,
      match_tier: matchTier ?? null,
      match_step_id: matchStepId ?? null,
      match_option_id: matchOptionId ?? null,
      assign_to_member_id: assignToMemberId,
    })
    .select('*')
    .single();

  if (insertError || !rule) {
    return NextResponse.json({ error: 'Failed to create rule' }, { status: 500 });
  }

  return NextResponse.json({ data: rule }, { status: 201 });
}
