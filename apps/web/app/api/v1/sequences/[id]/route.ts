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

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  const { id } = await params;

  const authResult = await authenticateRequest(request);
  if ('error' in authResult) return authResult.error;
  const { account } = authResult.ctx;

  const admin = createAdminClient();

  const { data: sequence, error } = await admin
    .from('drip_sequences')
    .select('*')
    .eq('id', id)
    .eq('account_id', account.id)
    .single();

  if (error || !sequence) {
    return NextResponse.json({ error: 'Sequence not found' }, { status: 404 });
  }

  const { data: steps } = await admin
    .from('drip_steps')
    .select('*')
    .eq('sequence_id', id)
    .order('step_order', { ascending: true });

  const { count: activeEnrollments } = await admin
    .from('drip_enrollments')
    .select('id', { count: 'exact', head: true })
    .eq('sequence_id', id)
    .eq('status', 'active');

  return NextResponse.json({
    data: {
      ...sequence,
      steps: steps ?? [],
      activeEnrollments: activeEnrollments ?? 0,
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

  // Verify sequence belongs to this account
  const { data: existing, error: fetchError } = await admin
    .from('drip_sequences')
    .select('id, is_active')
    .eq('id', id)
    .eq('account_id', account.id)
    .single();

  if (fetchError || !existing) {
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

    // Activating: deactivate other sequences for same tier
    if (parsed.data.isActive) {
      const tier = parsed.data.targetTier;
      // We need the current tier if not being changed
      let targetTier = tier;
      if (!targetTier) {
        const { data: seqData } = await admin
          .from('drip_sequences')
          .select('target_tier')
          .eq('id', id)
          .single();
        targetTier = seqData?.target_tier as 'warm' | 'cold' | undefined;
      }

      if (targetTier) {
        await admin
          .from('drip_sequences')
          .update({ is_active: false })
          .eq('account_id', account.id)
          .eq('target_tier', targetTier)
          .eq('is_active', true)
          .neq('id', id);
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
    await admin.from('drip_steps').delete().eq('sequence_id', id);

    const stepsToInsert = parsed.data.steps.map((step) => ({
      sequence_id: id,
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
      .eq('sequence_id', id)
      .eq('status', 'active');
  }

  // Update sequence if there are field changes
  if (Object.keys(updates).length > 0) {
    const { data: updated, error: updateError } = await admin
      .from('drip_sequences')
      .update(updates)
      .eq('id', id)
      .select('*')
      .single();

    if (updateError || !updated) {
      return NextResponse.json({ error: 'Failed to update sequence' }, { status: 500 });
    }

    const { data: updatedSteps } = await admin
      .from('drip_steps')
      .select('*')
      .eq('sequence_id', id)
      .order('step_order', { ascending: true });

    return NextResponse.json({ data: { ...updated, steps: updatedSteps ?? [] } });
  }

  // No field updates but steps may have changed
  const { data: refreshed } = await admin
    .from('drip_sequences')
    .select('*')
    .eq('id', id)
    .single();

  const { data: refreshedSteps } = await admin
    .from('drip_steps')
    .select('*')
    .eq('sequence_id', id)
    .order('step_order', { ascending: true });

  return NextResponse.json({ data: { ...refreshed, steps: refreshedSteps ?? [] } });
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

  const admin = createAdminClient();

  // Verify sequence belongs to this account
  const { data: existing, error: fetchError } = await admin
    .from('drip_sequences')
    .select('id')
    .eq('id', id)
    .eq('account_id', account.id)
    .single();

  if (fetchError || !existing) {
    return NextResponse.json({ error: 'Sequence not found' }, { status: 404 });
  }

  // Cancel active enrollments before deleting
  await admin
    .from('drip_enrollments')
    .update({
      status: 'cancelled',
      next_send_at: null,
    })
    .eq('sequence_id', id)
    .eq('status', 'active');

  // Delete sequence (cascades to steps, enrollments via FK)
  const { error: deleteError } = await admin
    .from('drip_sequences')
    .delete()
    .eq('id', id);

  if (deleteError) {
    return NextResponse.json({ error: 'Failed to delete sequence' }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
