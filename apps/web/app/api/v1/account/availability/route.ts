import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

interface MemberAvailabilityOverview {
  memberId: string;
  memberName: string | null;
  role: string;
  status: string;
  maxActiveLeads: number | null;
  lastActiveAt: string;
  timezone: string;
  activeLeadCount: number;
}

interface MemberRow {
  id: string;
  role: string;
  user_id: string;
}

interface AvailRow {
  member_id: string;
  status: string;
  max_active_leads: number | null;
  last_active_at: string;
  timezone: string;
}

async function countActiveLeads(
  admin: ReturnType<typeof createAdminClient>,
  accountId: string,
  memberIds: string[],
): Promise<Record<string, number>> {
  const counts: Record<string, number> = {};

  if (memberIds.length === 0) return counts;

  // Count leads assigned to each member that are in active statuses
  const { data: rows } = await admin
    .from('submissions')
    .select('assigned_to')
    .eq('account_id', accountId)
    .in('assigned_to', memberIds)
    .in('status', ['new', 'viewed', 'contacted', 'qualified']);

  if (!rows) return counts;

  for (const row of rows) {
    if (row.assigned_to) {
      counts[row.assigned_to] = (counts[row.assigned_to] ?? 0) + 1;
    }
  }

  return counts;
}

export async function GET(
  _request: NextRequest,
): Promise<NextResponse> {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const admin = createAdminClient();

  const { data: requester } = await admin
    .from('members')
    .select('id, account_id, role')
    .eq('user_id', user.id)
    .limit(1)
    .single();

  if (!requester) {
    return NextResponse.json({ error: 'Not a member' }, { status: 403 });
  }

  // Fetch all members in account
  const { data: members, error: membersError } = await admin
    .from('members')
    .select('id, role, user_id')
    .eq('account_id', requester.account_id);

  if (membersError || !members) {
    return NextResponse.json({ error: 'Failed to fetch members' }, { status: 500 });
  }

  const typedMembers = members as MemberRow[];
  const memberIds = typedMembers.map((m: MemberRow) => m.id);

  // Fetch availability rows
  const { data: availRows } = await admin
    .from('member_availability')
    .select('member_id, status, max_active_leads, last_active_at, timezone')
    .eq('account_id', requester.account_id);

  const availMap = new Map<string, AvailRow>(
    ((availRows ?? []) as AvailRow[]).map((r: AvailRow) => [r.member_id, r]),
  );

  // Count active leads per member
  const leadCounts = await countActiveLeads(admin, requester.account_id, memberIds);

  const result: MemberAvailabilityOverview[] = typedMembers.map((m: MemberRow) => {
    const avail: AvailRow | undefined = availMap.get(m.id);
    return {
      memberId: m.id,
      memberName: m.user_id,
      role: m.role,
      status: avail?.status ?? 'offline',
      maxActiveLeads: avail?.max_active_leads ?? null,
      lastActiveAt: avail?.last_active_at ?? new Date().toISOString(),
      timezone: avail?.timezone ?? 'UTC',
      activeLeadCount: leadCounts[m.id] ?? 0,
    };
  });

  return NextResponse.json({ members: result });
}
