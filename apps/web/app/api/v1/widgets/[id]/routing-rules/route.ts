import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createAdminClient } from '@/lib/supabase/admin';
import { authenticateRequest, requireRole } from '@/lib/auth';
import { getPlanLimits } from '@/lib/plan-limits';
import { stripHtml } from '@/lib/sanitize';

import type { Plan } from '@/lib/supabase/types';

export const runtime = 'nodejs';

const createSchema = z.object({
  name: z.string().min(1).max(200).transform(stripHtml),
  priority: z.number().int().min(0).max(100).default(0),
  matchTier: z.enum(['hot', 'warm', 'cold']).optional(),
  matchStepId: z.string().max(50).optional(),
  matchOptionId: z.string().max(50).optional(),
  assignToMemberId: z.string().uuid(),
}).strict().refine(
  (data) => data.matchTier !== undefined || (data.matchStepId !== undefined && data.matchOptionId !== undefined),
  { message: 'Either matchTier or both matchStepId and matchOptionId must be provided' },
);

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  const { id: widgetId } = await params;

  const authResult = await authenticateRequest(request);
  if ('error' in authResult) return authResult.error;
  const { account } = authResult.ctx;

  const planLimits = getPlanLimits(account.plan as Plan);
  if (!planLimits.leadRouting || account.plan !== 'agency') {
    return NextResponse.json(
      { error: 'Per-widget routing requires an Agency plan' },
      { status: 403 },
    );
  }

  const admin = createAdminClient();

  // Verify widget belongs to this account
  const { data: widget, error: widgetError } = await admin
    .from('widgets')
    .select('id')
    .eq('id', widgetId)
    .eq('account_id', account.id)
    .single();

  if (widgetError || !widget) {
    return NextResponse.json({ error: 'Widget not found' }, { status: 404 });
  }

  const { data: rules, error } = await admin
    .from('lead_routing_rules')
    .select('*')
    .eq('account_id', account.id)
    .eq('widget_id', widgetId)
    .order('priority', { ascending: false });

  if (error) {
    return NextResponse.json({ error: 'Failed to fetch routing rules' }, { status: 500 });
  }

  return NextResponse.json({ data: rules ?? [] });
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  const { id: widgetId } = await params;

  const authResult = await authenticateRequest(request);
  if ('error' in authResult) return authResult.error;
  const { member, account } = authResult.ctx;

  const roleError = requireRole(member, ['owner', 'admin']);
  if (roleError) return roleError;

  const planLimits = getPlanLimits(account.plan as Plan);
  if (!planLimits.leadRouting || account.plan !== 'agency') {
    return NextResponse.json(
      { error: 'Per-widget routing requires an Agency plan' },
      { status: 403 },
    );
  }

  const admin = createAdminClient();

  // Verify widget belongs to this account
  const { data: widget, error: widgetError } = await admin
    .from('widgets')
    .select('id')
    .eq('id', widgetId)
    .eq('account_id', account.id)
    .single();

  if (widgetError || !widget) {
    return NextResponse.json({ error: 'Widget not found' }, { status: 404 });
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
      { error: 'Validation failed', details: parsed.error.flatten().fieldErrors },
      { status: 400 },
    );
  }

  const { name, priority, matchTier, matchStepId, matchOptionId, assignToMemberId } = parsed.data;

  // Verify assignee is a member of this account
  const { data: assignee } = await admin
    .from('members')
    .select('id')
    .eq('id', assignToMemberId)
    .eq('account_id', account.id)
    .single();

  if (!assignee) {
    return NextResponse.json({ error: 'Assignee must be a member of your account' }, { status: 400 });
  }

  const { data: rule, error: insertError } = await admin
    .from('lead_routing_rules')
    .insert({
      account_id: account.id,
      widget_id: widgetId,
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
    return NextResponse.json({ error: 'Failed to create routing rule' }, { status: 500 });
  }

  return NextResponse.json({ data: rule }, { status: 201 });
}
