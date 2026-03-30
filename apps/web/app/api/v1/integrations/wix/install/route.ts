import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { wixOAuthLimit, checkRateLimit, rateLimitHeaders } from '@/lib/rate-limit';
import { getWixAuthUrl, signState } from '@/lib/wix';

// ---------------------------------------------------------------------------
// Query schema
// ---------------------------------------------------------------------------

const querySchema = z.object({
  token: z.string().min(1).max(2048),
  state: z.string().max(500).optional(),
});

// ---------------------------------------------------------------------------
// GET — Initiate Wix OAuth install flow
// ---------------------------------------------------------------------------

export async function GET(request: NextRequest): Promise<NextResponse> {
  // 1. Rate limit
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown';
  const rlResult = await checkRateLimit(wixOAuthLimit(), ip);
  if (!rlResult.success) {
    return NextResponse.json(
      { error: 'Too many requests' },
      { status: 429, headers: rateLimitHeaders(rlResult) }
    );
  }

  // 2. Auth check — user must be logged in to connect Wix
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // 3. Resolve account membership
  const admin = createAdminClient();
  const { data: member } = await admin
    .from('members')
    .select('account_id, role')
    .eq('user_id', user.id)
    .limit(1)
    .single();

  if (!member) {
    return NextResponse.json({ error: 'Account not found' }, { status: 404 });
  }

  // Only owner or admin can install integrations
  if (member.role === 'viewer') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  // 4. Parse query params
  const searchParams = Object.fromEntries(request.nextUrl.searchParams.entries());
  const parsed = querySchema.safeParse(searchParams);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid query parameters', details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  // 5. Build signed state containing account_id
  const state = signState(member.account_id);

  // 6. Redirect to Wix consent screen
  const wixUrl = getWixAuthUrl(state, parsed.data.token);

  return NextResponse.redirect(wixUrl);
}
