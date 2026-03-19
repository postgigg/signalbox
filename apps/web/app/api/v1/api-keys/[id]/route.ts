import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { authenticateRequest, requireRole } from '@/lib/auth';

export const runtime = 'nodejs';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  const { id } = await params;

  const authResult = await authenticateRequest(request);
  if ('error' in authResult) return authResult.error;
  const { member, account } = authResult.ctx;

  const roleError = requireRole(member, ['owner', 'admin']);
  if (roleError) return roleError;

  const admin = createAdminClient();

  const { data: existing, error: fetchError } = await admin
    .from('api_keys')
    .select('id, is_active')
    .eq('id', id)
    .eq('account_id', account.id)
    .single();

  if (fetchError || !existing) {
    return NextResponse.json({ error: 'API key not found' }, { status: 404 });
  }

  if (!existing.is_active) {
    return NextResponse.json({ error: 'API key is already revoked' }, { status: 409 });
  }

  const { error: updateError } = await admin
    .from('api_keys')
    .update({ is_active: false })
    .eq('id', id);

  if (updateError) {
    return NextResponse.json({ error: 'Failed to revoke API key' }, { status: 500 });
  }

  return NextResponse.json({ message: 'API key revoked' });
}
