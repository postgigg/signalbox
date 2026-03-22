import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createAdminClient } from '@/lib/supabase/admin';
import { authenticateRequest, requireRole } from '@/lib/auth';
import { stripHtml } from '@/lib/sanitize';

export const runtime = 'nodejs';

const stepSchema = z.object({
  stepOrder: z.number().int().min(1).max(5),
  delayHours: z.number().int().min(1).max(720),
  subject: z.string().min(1).max(200).transform(stripHtml),
  bodyHtml: z.string().min(1).max(10000),
  bodyText: z.string().min(1).max(10000).transform(stripHtml),
});

const patchSchema = z.object({
  name: z.string().min(1).max(100).transform(stripHtml).optional(),
  targetTier: z.enum(['warm', 'cold']).optional(),
  isActive: z.boolean().optional(),
  steps: z.array(stepSchema).min(2).max(5).optional(),
}).strict();

async function verifySequenceOwnership(
  admin: ReturnType<typeof createAdminClient>,
  widgetId: string,
  seqId: string,
  accountId: string,
): Promise<{ widget: { id: string } | null; sequence: { id: string; is_active: boolean; target_tier: 'warm' | 'cold' } | null }> {
  const { data: widget } = await admin
    .from('widgets')
    .select('id')
    .eq('id', widgetId)
    .eq('account_id', accountId)
    .single();

  if (!widget) {
    return { widget: null, sequence: null };
  }

  const { data: sequence } = await admin
    .from('drip_sequences')
    .select('id, is_active, target_tier')
    .eq('id', seqId)
    .eq('widget_id', widgetId)
    .single();

  return { widget, sequence };
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; seqId: string }> },
): Promise<NextResponse> {
  const { id: widgetId, seqId } = await params;

  const authResult = await authenticateRequest(request);
  if ('error' in authResult) return authResult.error;
  const { account } = authResult.ctx;

  const admin = createAdminClient();

  const { widget, sequence } = await verifySequenceOwnership(admin, widgetId, seqId, account.id);
  if (!widget || !sequence) {
    return NextResponse.json({ error: 'Sequence not found' }, { status: 404 });
  }

  const { data: fullSequence } = await admin
    .from('drip_sequences')
    .select('*')
    .eq('id', seqId)
    .single();

  const { data: steps } = await admin
    .from('drip_steps')
    .select('*')
    .eq('sequence_id', seqId)
    .order('step_order', { ascending: true });

  const { count: activeEnrollments } = await admin
    .from('drip_enrollments')
    .select('id', { count: 'exact', head: true })
    .eq('sequence_id', seqId)
    .eq('status', 'active');

  return NextResponse.json({
    data: {
      ...fullSequence,
      steps: steps ?? [],
      activeEnrollments: activeEnrollments ?? 0,
    },
  });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; seqId: string }> },
): Promise<NextResponse> {
  const { id: widgetId, seqId } = await params;

  const authResult = await authenticateRequest(request);
  if ('error' in authResult) return authResult.error;
  const { member, account } = authResult.ctx;

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
      { error: 'Validation failed', details: parsed.error.flatten().fieldErrors },
      { status: 400 },
    );
  }

  const admin = createAdminClient();

  const { widget, sequence: existing } = await verifySequenceOwnership(admin, widgetId, seqId, account.id);
  if (!widget || !existing) {
    return NextResponse.json({ error: 'Sequence not found' }, { status: 404 });
  }

  const updates: Record<string, unknown> = {};
  let shouldCancelEnrollments = false;

  if (parsed.data.name !== undefined) {
    updates['name'] = parsed.data.name;
  }

  if (parsed.data.targetTier !== undefined) {
    updates['target_tier'] = parsed.data.targetTier;
    shouldCancelEnrollments = true;
  }

  if (parsed.data.isActive !== undefined) {
    updates['is_active'] = parsed.data.isActive;

    // Deactivating cancels active enrollments
    if (!parsed.data.isActive && existing.is_active) {
      shouldCancelEnrollments = true;
    }

    // Activating: deactivate other sequences for same widget + tier
    if (parsed.data.isActive) {
      const targetTier = parsed.data.targetTier ?? existing.target_tier;

      if (targetTier) {
        await admin
          .from('drip_sequences')
          .update({ is_active: false })
          .eq('widget_id', widgetId)
          .eq('target_tier', targetTier)
          .eq('is_active', true)
          .neq('id', seqId);
      }
    }
  }

  // Update steps if provided
  if (parsed.data.steps !== undefined) {
    const stepOrders = parsed.data.steps.map((s) => s.stepOrder).sort((a, b) => a - b);
    for (let i = 0; i < stepOrders.length; i++) {
      if (stepOrders[i] !== i + 1) {
        return NextResponse.json(
          { error: 'Step orders must be sequential starting from 1' },
          { status: 400 },
        );
      }
    }

    // Delete old steps and insert new ones
    await admin.from('drip_steps').delete().eq('sequence_id', seqId);

    const stepsToInsert = parsed.data.steps.map((step) => ({
      sequence_id: seqId,
      step_order: step.stepOrder,
      delay_hours: step.delayHours,
      subject: step.subject,
      body_html: step.bodyHtml,
      body_text: step.bodyText,
    }));

    const { error: stepsError } = await admin
      .from('drip_steps')
      .insert(stepsToInsert);

    if (stepsError) {
      return NextResponse.json({ error: 'Failed to update steps' }, { status: 500 });
    }

    shouldCancelEnrollments = true;
  }

  // Cancel active enrollments if needed
  if (shouldCancelEnrollments) {
    await admin
      .from('drip_enrollments')
      .update({
        status: 'cancelled',
        next_send_at: null,
      })
      .eq('sequence_id', seqId)
      .eq('status', 'active');
  }

  // Update sequence if there are field changes
  if (Object.keys(updates).length > 0) {
    const { data: updated, error: updateError } = await admin
      .from('drip_sequences')
      .update(updates)
      .eq('id', seqId)
      .select('*')
      .single();

    if (updateError || !updated) {
      return NextResponse.json({ error: 'Failed to update sequence' }, { status: 500 });
    }

    const { data: updatedSteps } = await admin
      .from('drip_steps')
      .select('*')
      .eq('sequence_id', seqId)
      .order('step_order', { ascending: true });

    return NextResponse.json({ data: { ...updated, steps: updatedSteps ?? [] } });
  }

  // No field updates but steps may have changed
  const { data: refreshed } = await admin
    .from('drip_sequences')
    .select('*')
    .eq('id', seqId)
    .single();

  const { data: refreshedSteps } = await admin
    .from('drip_steps')
    .select('*')
    .eq('sequence_id', seqId)
    .order('step_order', { ascending: true });

  return NextResponse.json({ data: { ...refreshed, steps: refreshedSteps ?? [] } });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; seqId: string }> },
): Promise<NextResponse> {
  const { id: widgetId, seqId } = await params;

  const authResult = await authenticateRequest(request);
  if ('error' in authResult) return authResult.error;
  const { member, account } = authResult.ctx;

  const roleError = requireRole(member, ['owner', 'admin']);
  if (roleError) return roleError;

  const admin = createAdminClient();

  const { widget, sequence } = await verifySequenceOwnership(admin, widgetId, seqId, account.id);
  if (!widget || !sequence) {
    return NextResponse.json({ error: 'Sequence not found' }, { status: 404 });
  }

  // Cancel active enrollments before deleting
  await admin
    .from('drip_enrollments')
    .update({
      status: 'cancelled',
      next_send_at: null,
    })
    .eq('sequence_id', seqId)
    .eq('status', 'active');

  // Delete sequence (cascades to steps, enrollments via FK)
  const { error: deleteError } = await admin
    .from('drip_sequences')
    .delete()
    .eq('id', seqId);

  if (deleteError) {
    return NextResponse.json({ error: 'Failed to delete sequence' }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
