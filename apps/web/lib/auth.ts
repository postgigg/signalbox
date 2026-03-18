import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import type { Member, Account, MemberRole } from '@/lib/supabase/types';

export interface AuthContext {
  userId: string;
  member: Member;
  account: Account;
}

/**
 * Authenticate a request and resolve the user's member + account.
 * Returns null and a NextResponse error if authentication fails.
 */
export async function authenticateRequest(
  _request: NextRequest,
): Promise<{ ctx: AuthContext } | { error: NextResponse }> {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return {
      error: NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 },
      ),
    };
  }

  const admin = createAdminClient();

  const { data: member, error: memberError } = await admin
    .from('members')
    .select('*')
    .eq('user_id', user.id)
    .limit(1)
    .single();

  if (memberError || !member) {
    return {
      error: NextResponse.json(
        { error: 'No account membership found' },
        { status: 403 },
      ),
    };
  }

  const { data: account, error: accountError } = await admin
    .from('accounts')
    .select('*')
    .eq('id', member.account_id)
    .single();

  if (accountError || !account) {
    return {
      error: NextResponse.json(
        { error: 'Account not found' },
        { status: 404 },
      ),
    };
  }

  return { ctx: { userId: user.id, member, account } };
}

/** Check whether the member has one of the required roles */
export function requireRole(
  member: Member,
  roles: MemberRole[],
): NextResponse | null {
  if (!roles.includes(member.role)) {
    return NextResponse.json(
      { error: 'Insufficient permissions', details: `Required role: ${roles.join(' or ')}` },
      { status: 403 },
    );
  }
  return null;
}
