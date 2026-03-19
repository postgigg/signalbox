import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createAdminClient } from '@/lib/supabase/admin';
import { authenticateRequest, requireRole } from '@/lib/auth';

export const runtime = 'nodejs';

const patchClientSchema = z.object({
  name: z.string().trim().min(1).max(200).optional(),
  slug: z.string().trim().min(1).max(100).regex(/^[a-z0-9-]+$/).optional(),
  contact_name: z.string().trim().max(200).nullable().optional(),
  contact_email: z.string().email().max(320).nullable().optional(),
  notes: z.string().max(2000).nullable().optional(),
  is_active: z.boolean().optional(),
}).strict();

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  const { id } = await params;

  const authResult = await authenticateRequest(request);
  if ('error' in authResult) return authResult.error;
  const { account } = authResult.ctx;

  if (account.plan !== 'agency') {
    return NextResponse.json(
      { error: 'Multi-client dashboard is only available on the Agency plan' },
      { status: 403 },
    );
  }

  const admin = createAdminClient();

  const { data: client, error } = await admin
    .from('client_accounts')
    .select('*')
    .eq('id', id)
    .eq('parent_account_id', account.id)
    .single();

  if (error || !client) {
    return NextResponse.json({ error: 'Client not found' }, { status: 404 });
  }

  // Fetch widgets assigned to this client
  const { data: widgets } = await admin
    .from('widgets')
    .select('id, name, widget_key, is_active, submission_count, created_at')
    .eq('account_id', account.id)
    .eq('client_account_id', id)
    .order('created_at', { ascending: false });

  // Fetch recent leads for this client's widgets
  const widgetIds = widgets?.map((w: { id: string }) => w.id) ?? [];
  let leads: Array<{ id: string; visitor_name: string; visitor_email: string; lead_tier: string; lead_score: number; created_at: string }> = [];

  if (widgetIds.length > 0) {
    const { data: submissionData } = await admin
      .from('submissions')
      .select('id, visitor_name, visitor_email, lead_tier, lead_score, created_at')
      .in('widget_id', widgetIds)
      .order('created_at', { ascending: false })
      .limit(50);

    leads = (submissionData ?? []) as typeof leads;
  }

  return NextResponse.json({
    data: {
      ...client,
      widgets: widgets ?? [],
      leads,
    },
  });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  const { id } = await params;

  const authResult = await authenticateRequest(request);
  if ('error' in authResult) return authResult.error;
  const { member, account } = authResult.ctx;

  const roleError = requireRole(member, ['owner', 'admin']);
  if (roleError) return roleError;

  if (account.plan !== 'agency') {
    return NextResponse.json(
      { error: 'Multi-client dashboard is only available on the Agency plan' },
      { status: 403 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const parsed = patchClientSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Validation failed', details: parsed.error.flatten().fieldErrors },
      { status: 400 },
    );
  }

  const admin = createAdminClient();

  // Verify client belongs to account
  const { data: existing, error: fetchError } = await admin
    .from('client_accounts')
    .select('id')
    .eq('id', id)
    .eq('parent_account_id', account.id)
    .single();

  if (fetchError || !existing) {
    return NextResponse.json({ error: 'Client not found' }, { status: 404 });
  }

  const updates: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };

  if (parsed.data.name !== undefined) updates['name'] = parsed.data.name;
  if (parsed.data.slug !== undefined) updates['slug'] = parsed.data.slug;
  if (parsed.data.contact_name !== undefined) updates['contact_name'] = parsed.data.contact_name;
  if (parsed.data.contact_email !== undefined) updates['contact_email'] = parsed.data.contact_email;
  if (parsed.data.notes !== undefined) updates['notes'] = parsed.data.notes;
  if (parsed.data.is_active !== undefined) updates['is_active'] = parsed.data.is_active;

  const { data: updated, error: updateError } = await admin
    .from('client_accounts')
    .update(updates)
    .eq('id', id)
    .select('*')
    .single();

  if (updateError) {
    if (updateError.code === '23505') {
      return NextResponse.json(
        { error: 'A client with this slug already exists' },
        { status: 409 },
      );
    }
    return NextResponse.json({ error: 'Failed to update client' }, { status: 500 });
  }

  return NextResponse.json({ data: updated });
}

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

  if (account.plan !== 'agency') {
    return NextResponse.json(
      { error: 'Multi-client dashboard is only available on the Agency plan' },
      { status: 403 },
    );
  }

  const admin = createAdminClient();

  const { data: existing, error: fetchError } = await admin
    .from('client_accounts')
    .select('id')
    .eq('id', id)
    .eq('parent_account_id', account.id)
    .single();

  if (fetchError || !existing) {
    return NextResponse.json({ error: 'Client not found' }, { status: 404 });
  }

  const { error: deleteError } = await admin
    .from('client_accounts')
    .delete()
    .eq('id', id);

  if (deleteError) {
    return NextResponse.json({ error: 'Failed to delete client' }, { status: 500 });
  }

  return NextResponse.json({ message: 'Client deleted' });
}
