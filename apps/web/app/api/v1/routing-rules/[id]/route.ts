import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

const updateSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  priority: z.number().int().min(0).max(100).optional(),
  isActive: z.boolean().optional(),
  matchTier: z.enum(['hot', 'warm', 'cold']).nullable().optional(),
  matchStepId: z.string().max(50).nullable().optional(),
  matchOptionId: z.string().max(50).nullable().optional(),
  assignToMemberId: z.string().uuid().nullable().optional(),
  routingStrategy: z.enum(['direct', 'skill', 'geographic', 'value', 'round_robin', 'availability']).optional(),
  matchCountry: z.array(z.string().max(10)).max(50).nullable().optional(),
  matchRegion: z.array(z.string().max(100)).max(50).nullable().optional(),
  matchSkillTags: z.array(z.string().max(50)).max(20).nullable().optional(),
  matchScoreMin: z.number().int().min(0).max(100).nullable().optional(),
  matchScoreMax: z.number().int().min(0).max(100).nullable().optional(),
  roundRobinPool: z.array(z.string().uuid()).max(50).nullable().optional(),
  roundRobinWeights: z.record(z.string(), z.number().int().min(1).max(100)).nullable().optional(),
  fallbackStrategy: z.enum(['none', 'round_robin', 'unassigned']).optional(),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  const { id } = await params;

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

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Validation failed', details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const admin = createAdminClient();

  // Verify rule belongs to account
  const { data: existing } = await admin
    .from('lead_routing_rules')
    .select('id')
    .eq('id', id)
    .eq('account_id', member.account_id)
    .single();

  if (!existing) {
    return NextResponse.json({ error: 'Rule not found' }, { status: 404 });
  }

  const updates: Record<string, unknown> = {};
  const {
    name, priority, isActive, matchTier, matchStepId, matchOptionId,
    assignToMemberId, routingStrategy, matchCountry, matchRegion,
    matchSkillTags, matchScoreMin, matchScoreMax, roundRobinPool,
    roundRobinWeights, fallbackStrategy,
  } = parsed.data;

  if (name !== undefined) updates.name = name;
  if (priority !== undefined) updates.priority = priority;
  if (isActive !== undefined) updates.is_active = isActive;
  if (matchTier !== undefined) updates.match_tier = matchTier;
  if (matchStepId !== undefined) updates.match_step_id = matchStepId;
  if (matchOptionId !== undefined) updates.match_option_id = matchOptionId;
  if (routingStrategy !== undefined) updates.routing_strategy = routingStrategy;
  if (matchCountry !== undefined) updates.match_country = matchCountry;
  if (matchRegion !== undefined) updates.match_region = matchRegion;
  if (matchSkillTags !== undefined) updates.match_skill_tags = matchSkillTags;
  if (matchScoreMin !== undefined) updates.match_score_min = matchScoreMin;
  if (matchScoreMax !== undefined) updates.match_score_max = matchScoreMax;
  if (roundRobinPool !== undefined) updates.round_robin_pool = roundRobinPool;
  if (roundRobinWeights !== undefined) updates.round_robin_weights = roundRobinWeights;
  if (fallbackStrategy !== undefined) updates.fallback_strategy = fallbackStrategy;
  if (assignToMemberId !== undefined) {
    if (assignToMemberId === null) {
      updates.assign_to_member_id = null;
    } else {
      // Verify assignee
      const { data: assignee } = await admin
        .from('members')
        .select('id')
        .eq('id', assignToMemberId)
        .eq('account_id', member.account_id)
        .single();
      if (!assignee) {
        return NextResponse.json({ error: 'Assignee must be a member of your account' }, { status: 400 });
      }
      updates.assign_to_member_id = assignToMemberId;
    }
  }

  const { data: rule, error: updateError } = await admin
    .from('lead_routing_rules')
    .update(updates)
    .eq('id', id)
    .select('*')
    .single();

  if (updateError || !rule) {
    return NextResponse.json({ error: 'Failed to update rule' }, { status: 500 });
  }

  return NextResponse.json({ data: rule });
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  const { id } = await params;

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

  const { error: deleteError } = await admin
    .from('lead_routing_rules')
    .delete()
    .eq('id', id)
    .eq('account_id', member.account_id);

  if (deleteError) {
    return NextResponse.json({ error: 'Failed to delete rule' }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
