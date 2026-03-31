import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

import { createAdminClient } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/server';

const linkSchema = z.object({
  instanceId: z.string().min(1).max(500),
});

/**
 * POST — Link a Wix instance to the authenticated user's account.
 * Called after signup/login when the user came from the Wix iframe.
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  // 1. Auth via Supabase session (user just signed up/logged in)
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // 2. Parse body
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const parsed = linkSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }

  const { instanceId } = parsed.data;

  // 3. Get user's account
  const { data: member } = await supabase
    .from('members')
    .select('account_id')
    .eq('user_id', user.id)
    .limit(1)
    .single();

  if (!member) {
    return NextResponse.json({ error: 'No account found. Complete onboarding first.' }, { status: 404 });
  }

  // 4. Upsert wix_installations record
  const admin = createAdminClient();

  const { data: existing } = await admin
    .from('wix_installations')
    .select('id')
    .eq('wix_instance_id', instanceId)
    .limit(1)
    .maybeSingle();

  if (existing) {
    // Update existing to point to this account
    await admin
      .from('wix_installations')
      .update({
        account_id: member.account_id,
        is_active: true,
        uninstalled_at: null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', existing.id);
  } else {
    // Create new installation record
    await admin
      .from('wix_installations')
      .insert({
        wix_instance_id: instanceId,
        account_id: member.account_id,
        is_active: true,
        wix_refresh_token: '',
        installed_at: new Date().toISOString(),
      });
  }

  return NextResponse.json({ success: true, accountId: member.account_id });
}
