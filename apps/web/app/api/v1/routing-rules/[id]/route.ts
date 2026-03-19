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
  assignToMemberId: z.string().uuid().optional(),
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
  const { name, priority, isActive, matchTier, matchStepId, matchOptionId, assignToMemberId } = parsed.data;

  if (name !== undefined) updates.name = name;
  if (priority !== undefined) updates.priority = priority;
  if (isActive !== undefined) updates.is_active = isActive;
  if (matchTier !== undefined) updates.match_tier = matchTier;
  if (matchStepId !== undefined) updates.match_step_id = matchStepId;
  if (matchOptionId !== undefined) updates.match_option_id = matchOptionId;
  if (assignToMemberId !== undefined) {
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
