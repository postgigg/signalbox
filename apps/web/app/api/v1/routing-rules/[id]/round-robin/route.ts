import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(
  _request: NextRequest,
  { params }: RouteParams,
): Promise<NextResponse> {
  const { id } = await params;
  const supabase = await createClient();
  const admin = createAdminClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: member } = await admin
    .from('members')
    .select('id, account_id, role')
    .eq('user_id', user.id)
    .limit(1)
    .single();

  if (!member) {
    return NextResponse.json({ error: 'Not a member' }, { status: 403 });
  }

  // Verify rule belongs to account
  const { data: rule } = await admin
    .from('lead_routing_rules')
    .select('id, account_id')
    .eq('id', id)
    .eq('account_id', member.account_id)
    .single();

  if (!rule) {
    return NextResponse.json({ error: 'Rule not found' }, { status: 404 });
  }

  const { data: state, error: stateError } = await admin
    .from('round_robin_state')
    .select('*')
    .eq('rule_id', id)
    .eq('account_id', member.account_id)
    .maybeSingle();

  if (stateError) {
    return NextResponse.json({ error: 'Failed to fetch round-robin state' }, { status: 500 });
  }

  if (!state) {
    return NextResponse.json({
      currentIndex: 0,
      assignmentCounts: {},
      lastAssignedMemberId: null,
    });
  }

  return NextResponse.json({
    currentIndex: state.current_index,
    assignmentCounts: state.assignment_counts,
    lastAssignedMemberId: state.last_assigned_member_id,
  });
}
