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
  assignToMemberId: z.string().uuid().optional(),
  routingStrategy: z.enum(['direct', 'skill', 'geographic', 'value', 'round_robin', 'availability']).default('direct'),
  matchCountry: z.array(z.string().max(10)).max(50).optional(),
  matchRegion: z.array(z.string().max(100)).max(50).optional(),
  matchSkillTags: z.array(z.string().max(50)).max(20).optional(),
  matchScoreMin: z.number().int().min(0).max(100).optional(),
  matchScoreMax: z.number().int().min(0).max(100).optional(),
  roundRobinPool: z.array(z.string().uuid()).max(50).optional(),
  roundRobinWeights: z.record(z.string(), z.number().int().min(1).max(100)).optional(),
  fallbackStrategy: z.enum(['none', 'round_robin', 'unassigned']).default('none'),
}).refine(
  (data) => {
    if (data.routingStrategy === 'direct' || data.routingStrategy === 'value') {
      return data.assignToMemberId !== undefined;
    }
    return true;
  },
  { message: 'assignToMemberId is required for direct and value strategies' },
).refine(
  (data) => {
    if (data.routingStrategy === 'direct') {
      return data.matchTier !== undefined || (data.matchStepId !== undefined && data.matchOptionId !== undefined);
    }
    return true;
  },
  { message: 'Direct strategy requires matchTier or matchStepId+matchOptionId' },
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

  // Enforce max routing rules limit
  if (limits.maxRoutingRules > 0) {
    const { count: ruleCount } = await admin
      .from('lead_routing_rules')
      .select('id', { count: 'exact', head: true })
      .eq('account_id', member.account_id);

    if (ruleCount !== null && ruleCount >= limits.maxRoutingRules) {
      return NextResponse.json(
        { error: `Maximum ${String(limits.maxRoutingRules)} routing rules allowed on your plan` },
        { status: 403 },
      );
    }
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

  const {
    name, widgetId, priority, matchTier, matchStepId, matchOptionId,
    assignToMemberId, routingStrategy, matchCountry, matchRegion,
    matchSkillTags, matchScoreMin, matchScoreMax, roundRobinPool,
    roundRobinWeights, fallbackStrategy,
  } = parsed.data;

  // Gate advanced routing strategies behind advancedRouting plan limit
  if (routingStrategy !== 'direct' && !limits.advancedRouting) {
    return NextResponse.json(
      { error: 'Advanced routing strategies require a Pro or Agency plan' },
      { status: 403 },
    );
  }

  // Verify assignee is a member of this account (if specified)
  if (assignToMemberId) {
    const { data: assignee } = await admin
      .from('members')
      .select('id')
      .eq('id', assignToMemberId)
      .eq('account_id', member.account_id)
      .single();

    if (!assignee) {
      return NextResponse.json({ error: 'Assignee must be a member of your account' }, { status: 400 });
    }
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
      assign_to_member_id: assignToMemberId ?? null,
      routing_strategy: routingStrategy,
      match_country: matchCountry ?? null,
      match_region: matchRegion ?? null,
      match_skill_tags: matchSkillTags ?? null,
      match_score_min: matchScoreMin ?? null,
      match_score_max: matchScoreMax ?? null,
      round_robin_pool: roundRobinPool ?? null,
      round_robin_weights: (roundRobinWeights ?? null) as Record<string, number> | null,
      fallback_strategy: fallbackStrategy,
    })
    .select('*')
    .single();

  if (insertError || !rule) {
    return NextResponse.json({ error: 'Failed to create rule' }, { status: 500 });
  }

  return NextResponse.json({ data: rule }, { status: 201 });
}
