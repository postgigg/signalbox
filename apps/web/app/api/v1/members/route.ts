import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { getPlanLimits } from '@/lib/plan-limits';
import { sendTeamInviteEmail } from '@/lib/email';
import { RATE_LIMITS } from '@/lib/constants';

import type { Plan } from '@/lib/supabase/types';

// ---------------------------------------------------------------------------
// Schemas
// ---------------------------------------------------------------------------

const inviteSchema = z.object({
  email: z.string().email().max(320).toLowerCase(),
  role: z.enum(['admin', 'viewer']),
});

// ---------------------------------------------------------------------------
// GET — list members for account
// ---------------------------------------------------------------------------

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

  const { data: members, error: queryError } = await admin
    .from('members')
    .select('id, account_id, user_id, role, invited_email, invited_at, accepted_at, created_at')
    .eq('account_id', member.account_id)
    .order('created_at', { ascending: true });

  if (queryError) {
    return NextResponse.json({ error: 'Failed to fetch members' }, { status: 500 });
  }

  // Resolve auth user emails for accepted members (user_id is set)
  const enriched = await Promise.all(
    (members ?? []).map(async (m) => {
      if (m.user_id && m.accepted_at) {
        const { data: authData } = await admin.auth.admin.getUserById(m.user_id as string);
        if (authData?.user?.email) {
          return { ...m, email: authData.user.email, full_name: (authData.user.user_metadata?.full_name as string | undefined) ?? null };
        }
      }
      return { ...m, email: m.invited_email, full_name: null };
    }),
  );

  return NextResponse.json({ data: enriched });
}

// ---------------------------------------------------------------------------
// POST — invite member with plan enforcement
// ---------------------------------------------------------------------------

export async function POST(request: NextRequest): Promise<NextResponse> {
  // 1. Rate limit
  const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
  const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (redisUrl && redisToken) {
    const redis = new Redis({ url: redisUrl, token: redisToken });
    const limiter = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(RATE_LIMITS.members_invite.tokens, RATE_LIMITS.members_invite.window),
      prefix: RATE_LIMITS.members_invite.prefix,
    });
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown';
    const rl = await limiter.limit(ip);
    if (!rl.success) {
      return NextResponse.json(
        { error: 'Too many requests' },
        { status: 429, headers: { 'Retry-After': String(Math.ceil((rl.reset - Date.now()) / 1000)) } },
      );
    }
  }

  // 2. Auth check
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

  if (!member) {
    return NextResponse.json({ error: 'Account not found' }, { status: 404 });
  }

  // 3. Must be owner or admin
  if (member.role !== 'owner' && member.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  // 4. Fetch account plan
  const admin = createAdminClient();
  const { data: account } = await admin
    .from('accounts')
    .select('plan, name')
    .eq('id', member.account_id)
    .single();

  if (!account) {
    return NextResponse.json({ error: 'Account not found' }, { status: 404 });
  }

  const limits = getPlanLimits(account.plan as Plan);

  // 5. Check member count vs plan limit
  const { count } = await admin
    .from('members')
    .select('id', { count: 'exact', head: true })
    .eq('account_id', member.account_id);

  if (count !== null && count >= limits.teamMembers) {
    return NextResponse.json(
      { error: `Maximum of ${String(limits.teamMembers)} team members allowed on your plan` },
      { status: 403 },
    );
  }

  // 6. Parse + validate body
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const parsed = inviteSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Validation failed', details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const { email, role } = parsed.data;

  // 7. Check if email already has a member record for this account
  const { data: existing } = await admin
    .from('members')
    .select('id')
    .eq('account_id', member.account_id)
    .eq('invited_email', email)
    .limit(1)
    .maybeSingle();

  if (existing) {
    return NextResponse.json(
      { error: 'A member with this email already exists in your account' },
      { status: 409 },
    );
  }

  // 8. Insert into members with invited_at timestamp (user_id is null until accepted)
  const now = new Date().toISOString();

  const { data: invited, error: insertError } = await admin
    .from('members')
    .insert({
      account_id: member.account_id,
      role,
      invited_email: email,
      invited_at: now,
    })
    .select('id, account_id, role, invited_email, invited_at, created_at')
    .single();

  if (insertError || !invited) {
    return NextResponse.json({ error: 'Failed to invite member' }, { status: 500 });
  }

  // 9. Send invite email (non-blocking)
  const inviterName = user.user_metadata?.full_name as string | undefined
    ?? user.email
    ?? 'A team member';
  const accountName = account.name as string | undefined ?? 'your team';

  void sendTeamInviteEmail({
    to: email,
    accountName,
    inviterName,
    role,
  });

  return NextResponse.json({ data: invited }, { status: 201 });
}
