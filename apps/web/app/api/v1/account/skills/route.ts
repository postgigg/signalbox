import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET(
  _request: NextRequest,
): Promise<NextResponse> {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const admin = createAdminClient();

  const { data: member } = await admin
    .from('members')
    .select('id, account_id')
    .eq('user_id', user.id)
    .limit(1)
    .single();

  if (!member) {
    return NextResponse.json({ error: 'Not a member' }, { status: 403 });
  }

  const { data: rows, error: queryError } = await admin
    .from('member_skills')
    .select('skill_tag')
    .eq('account_id', member.account_id);

  if (queryError) {
    return NextResponse.json({ error: 'Failed to fetch skills' }, { status: 500 });
  }

  // Deduplicate skill tags
  const uniqueSkills = [...new Set((rows as Array<{ skill_tag: string }>).map((r: { skill_tag: string }) => r.skill_tag))];
  uniqueSkills.sort();

  return NextResponse.json({ skills: uniqueSkills });
}
