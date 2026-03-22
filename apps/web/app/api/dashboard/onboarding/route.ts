import { NextRequest, NextResponse } from 'next/server';

import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest): Promise<NextResponse> {
  void request;

  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Find the user's account via members table
  const { data: memberData } = await supabase
    .from('members')
    .select('account_id')
    .eq('user_id', user.id)
    .limit(1)
    .single();

  if (!memberData) {
    return NextResponse.json({ error: 'No account found' }, { status: 404 });
  }

  // Mark onboarding as completed
  const { error: updateError } = await supabase
    .from('accounts')
    .update({ onboarding_completed_at: new Date().toISOString() })
    .eq('id', memberData.account_id);

  if (updateError) {
    return NextResponse.json({ error: 'Failed to update' }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
