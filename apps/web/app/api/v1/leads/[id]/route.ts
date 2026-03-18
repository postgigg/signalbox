import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createAdminClient } from '@/lib/supabase/admin';
import { authenticateRequest, requireRole } from '@/lib/auth';
import { stripHtml } from '@/lib/sanitize';

export const runtime = 'nodejs';

const patchSchema = z.object({
  status: z
    .enum([
      'new',
      'viewed',
      'contacted',
      'qualified',
      'disqualified',
      'converted',
      'archived',
    ])
    .optional(),
  notes: z.string().max(5000).optional().transform((v) => v ? stripHtml(v) : v),
}).strict();

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  const { id } = await params;

  const authResult = await authenticateRequest(request);
  if ('error' in authResult) return authResult.error;
  const { account } = authResult.ctx;

  const admin = createAdminClient();

  const { data: lead, error } = await admin
    .from('submissions')
    .select('*')
    .eq('id', id)
    .eq('account_id', account.id)
    .single();

  if (error || !lead) {
    return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
  }

  // Auto-set viewed_at on first view
  if (!lead.viewed_at) {
    const now = new Date().toISOString();
    await admin
      .from('submissions')
      .update({
        viewed_at: now,
        status: lead.status === 'new' ? 'viewed' : lead.status,
      })
      .eq('id', id);

    lead.viewed_at = now;
    if (lead.status === 'new') {
      lead.status = 'viewed';
    }
  }

  return NextResponse.json({ data: lead });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  const { id } = await params;

  const authResult = await authenticateRequest(request);
  if ('error' in authResult) return authResult.error;
  const { member, account } = authResult.ctx;

  // Only owner or admin can update leads
  const roleError = requireRole(member, ['owner', 'admin']);
  if (roleError) return roleError;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: 'Validation failed',
        details: parsed.error.flatten().fieldErrors,
      },
      { status: 400 },
    );
  }

  const admin = createAdminClient();

  // Verify lead belongs to this account
  const { data: existing, error: fetchError } = await admin
    .from('submissions')
    .select('id, status, contacted_at, viewed_at')
    .eq('id', id)
    .eq('account_id', account.id)
    .single();

  if (fetchError || !existing) {
    return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
  }

  const updates: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };

  if (parsed.data.status !== undefined) {
    updates['status'] = parsed.data.status;

    // Auto-set contacted_at when status changes to 'contacted'
    if (
      parsed.data.status === 'contacted' &&
      existing.contacted_at === null
    ) {
      updates['contacted_at'] = new Date().toISOString();
    }

    // Auto-set viewed_at when status changes to 'viewed'
    if (
      parsed.data.status === 'viewed' &&
      existing.viewed_at === null
    ) {
      updates['viewed_at'] = new Date().toISOString();
    }
  }

  if (parsed.data.notes !== undefined) {
    updates['notes'] = parsed.data.notes;
  }

  const { data: updated, error: updateError } = await admin
    .from('submissions')
    .update(updates)
    .eq('id', id)
    .select('*')
    .single();

  if (updateError || !updated) {
    return NextResponse.json(
      { error: 'Failed to update lead' },
      { status: 500 },
    );
  }

  return NextResponse.json({ data: updated });
}
