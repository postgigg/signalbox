import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

const updateSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  isActive: z.boolean().optional(),
  expiresAt: z.string().datetime().nullable().optional(),
  allowedMetrics: z.array(z.enum(['submissions', 'tier_breakdown', 'conversion_rate', 'over_time'])).optional(),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  const { id } = await params;

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

  if (!member || member.role === 'viewer') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Validation failed', details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const admin = createAdminClient();

  const updates: Record<string, unknown> = {};
  if (parsed.data.name !== undefined) updates.name = parsed.data.name;
  if (parsed.data.isActive !== undefined) updates.is_active = parsed.data.isActive;
  if (parsed.data.expiresAt !== undefined) updates.expires_at = parsed.data.expiresAt;
  if (parsed.data.allowedMetrics !== undefined) updates.allowed_metrics = parsed.data.allowedMetrics;

  const { data: link, error: updateError } = await admin
    .from('shared_analytics_links')
    .update(updates)
    .eq('id', id)
    .eq('account_id', member.account_id)
    .select('*')
    .single();

  if (updateError || !link) {
    return NextResponse.json({ error: 'Link not found or update failed' }, { status: 404 });
  }

  return NextResponse.json({ data: link });
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  const { id } = await params;

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

  if (!member || member.role === 'viewer') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const admin = createAdminClient();

  const { error: deleteError } = await admin
    .from('shared_analytics_links')
    .delete()
    .eq('id', id)
    .eq('account_id', member.account_id);

  if (deleteError) {
    return NextResponse.json({ error: 'Failed to delete link' }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
