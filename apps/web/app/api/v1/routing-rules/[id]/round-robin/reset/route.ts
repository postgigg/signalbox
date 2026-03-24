import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function POST(
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

  // Only owner/admin can reset
  if (member.role !== 'owner' && member.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
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

  const { error: updateError } = await admin
    .from('round_robin_state')
    .update({
      current_index: 0,
      assignment_counts: {},
      last_assigned_member_id: null,
      updated_at: new Date().toISOString(),
    })
    .eq('rule_id', id)
    .eq('account_id', member.account_id);

  if (updateError) {
    return NextResponse.json({ error: 'Failed to reset round-robin state' }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
