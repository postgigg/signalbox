import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createAdminClient } from '@/lib/supabase/admin';
import { authenticateRequest, requireRole } from '@/lib/auth';
import { getPlanLimits } from '@/lib/plan-limits';
import { stripHtml } from '@/lib/sanitize';

import type { Plan } from '@/lib/supabase/types';

export const runtime = 'nodejs';

const stepSchema = z.object({
  stepOrder: z.number().int().min(1).max(5),
  delayHours: z.number().int().min(1).max(720),
  subject: z.string().min(1).max(200).transform(stripHtml),
  bodyHtml: z.string().min(1).max(10000),
  bodyText: z.string().min(1).max(10000).transform(stripHtml),
});

const createSchema = z.object({
  name: z.string().min(1).max(100).transform(stripHtml),
  targetTier: z.enum(['warm', 'cold']),
  steps: z.array(stepSchema).min(2).max(5),
}).strict();

export async function GET(
  request: NextRequest,
): Promise<NextResponse> {
  const authResult = await authenticateRequest(request);
  if ('error' in authResult) return authResult.error;
  const { account } = authResult.ctx;

  const admin = createAdminClient();

  const { data: sequences, error } = await admin
    .from('drip_sequences')
    .select('*')
    .eq('account_id', account.id)
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: 'Failed to fetch sequences' }, { status: 500 });
  }

  // Fetch steps and enrollment counts for each sequence
  const sequenceIds = (sequences ?? []).map((s) => s.id);

  const { data: steps } = sequenceIds.length > 0
    ? await admin
        .from('drip_steps')
        .select('*')
        .in('sequence_id', sequenceIds)
        .order('step_order', { ascending: true })
    : { data: [] };

  const { data: enrollmentCounts } = sequenceIds.length > 0
    ? await admin
        .from('drip_enrollments')
        .select('sequence_id, status')
        .in('sequence_id', sequenceIds)
        .eq('status', 'active')
    : { data: [] };

  const stepsMap = new Map<string, typeof steps>();
  for (const step of steps ?? []) {
    const existing = stepsMap.get(step.sequence_id) ?? [];
    existing.push(step);
    stepsMap.set(step.sequence_id, existing);
  }

  const countMap = new Map<string, number>();
  for (const enrollment of enrollmentCounts ?? []) {
    const current = countMap.get(enrollment.sequence_id) ?? 0;
    countMap.set(enrollment.sequence_id, current + 1);
  }

  const result = (sequences ?? []).map((seq) => ({
    ...seq,
    steps: stepsMap.get(seq.id) ?? [],
    activeEnrollments: countMap.get(seq.id) ?? 0,
  }));

  return NextResponse.json({ data: result });
}

export async function POST(
  request: NextRequest,
): Promise<NextResponse> {
  const authResult = await authenticateRequest(request);
  if ('error' in authResult) return authResult.error;
  const { member, account } = authResult.ctx;

  const roleError = requireRole(member, ['owner', 'admin']);
  if (roleError) return roleError;

  const planLimits = getPlanLimits(account.plan as Plan);
  if (!planLimits.dripSequences) {
    return NextResponse.json(
      { error: 'Drip sequences require a Pro or Agency plan' },
      { status: 403 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Validation failed', details: parsed.error.flatten().fieldErrors },
      { status: 400 },
    );
  }

  const admin = createAdminClient();

  // Check count limit
  const { count, error: countError } = await admin
    .from('drip_sequences')
    .select('id', { count: 'exact', head: true })
    .eq('account_id', account.id);

  if (countError) {
    return NextResponse.json({ error: 'Failed to check sequence count' }, { status: 500 });
  }

  if ((count ?? 0) >= planLimits.maxDripSequences) {
    return NextResponse.json(
      { error: `Sequence limit reached (${planLimits.maxDripSequences})` },
      { status: 403 },
    );
  }

  // Validate step_order uniqueness and sequential order
  const stepOrders = parsed.data.steps.map((s) => s.stepOrder).sort((a, b) => a - b);
  for (let i = 0; i < stepOrders.length; i++) {
    if (stepOrders[i] !== i + 1) {
      return NextResponse.json(
        { error: 'Step orders must be sequential starting from 1' },
        { status: 400 },
      );
    }
  }

  // Create sequence
  const { data: sequence, error: insertError } = await admin
    .from('drip_sequences')
    .insert({
      account_id: account.id,
      name: parsed.data.name,
      target_tier: parsed.data.targetTier,
      is_active: false,
    })
    .select('*')
    .single();

  if (insertError || !sequence) {
    return NextResponse.json({ error: 'Failed to create sequence' }, { status: 500 });
  }

  // Insert steps
  const stepsToInsert = parsed.data.steps.map((step) => ({
    sequence_id: sequence.id,
    step_order: step.stepOrder,
    delay_hours: step.delayHours,
    subject: step.subject,
    body_html: step.bodyHtml,
    body_text: step.bodyText,
  }));

  const { data: insertedSteps, error: stepsError } = await admin
    .from('drip_steps')
    .insert(stepsToInsert)
    .select('*');

  if (stepsError) {
    // Cleanup sequence on step insert failure
    await admin.from('drip_sequences').delete().eq('id', sequence.id);
    return NextResponse.json({ error: 'Failed to create sequence steps' }, { status: 500 });
  }

  return NextResponse.json(
    { data: { ...sequence, steps: insertedSteps ?? [] } },
    { status: 201 },
  );
}
