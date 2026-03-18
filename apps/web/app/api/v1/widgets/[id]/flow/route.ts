import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createAdminClient } from '@/lib/supabase/admin';
import { authenticateRequest, requireRole } from '@/lib/auth';
import { validateFlowSteps } from '@/lib/scoring';
import type { Json } from '@/lib/supabase/types';

export const runtime = 'nodejs';

const flowOptionSchema = z.object({
  id: z.string().min(1).max(50),
  label: z.string().min(1).max(200),
  scoreWeight: z.number().min(-50).max(50),
}).strict();

const flowStepSchema = z.object({
  id: z.string().min(1).max(50),
  question: z.string().min(1).max(500),
  options: z.array(flowOptionSchema).min(2).max(6),
}).strict();

const putFlowSchema = z.object({
  steps: z.array(flowStepSchema).min(2).max(5),
}).strict();

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  const { id: widgetId } = await params;

  const authResult = await authenticateRequest(request);
  if ('error' in authResult) return authResult.error;
  const { account } = authResult.ctx;

  const admin = createAdminClient();

  // Verify widget belongs to account
  const { data: widget, error: widgetError } = await admin
    .from('widgets')
    .select('id')
    .eq('id', widgetId)
    .eq('account_id', account.id)
    .single();

  if (widgetError || !widget) {
    return NextResponse.json({ error: 'Widget not found' }, { status: 404 });
  }

  // Fetch active flow
  const { data: flow, error: flowError } = await admin
    .from('flows')
    .select('*')
    .eq('widget_id', widgetId)
    .eq('is_active', true)
    .single();

  if (flowError || !flow) {
    return NextResponse.json(
      { error: 'No active flow found for this widget' },
      { status: 404 },
    );
  }

  return NextResponse.json({ data: flow });
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  const { id: widgetId } = await params;

  const authResult = await authenticateRequest(request);
  if ('error' in authResult) return authResult.error;
  const { member, account } = authResult.ctx;

  // Only owner or admin can update flows
  const roleError = requireRole(member, ['owner', 'admin']);
  if (roleError) return roleError;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const parsed = putFlowSchema.safeParse(body);
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

  // Verify widget belongs to account
  const { data: widget, error: widgetError } = await admin
    .from('widgets')
    .select('id')
    .eq('id', widgetId)
    .eq('account_id', account.id)
    .single();

  if (widgetError || !widget) {
    return NextResponse.json({ error: 'Widget not found' }, { status: 404 });
  }

  // Deep validate the steps JSONB
  const validation = validateFlowSteps(parsed.data.steps as unknown as Json);
  if (!validation.valid) {
    return NextResponse.json(
      { error: 'Invalid flow steps', details: validation.error },
      { status: 400 },
    );
  }

  // Get current active flow version
  const { data: currentFlow } = await admin
    .from('flows')
    .select('id, version')
    .eq('widget_id', widgetId)
    .eq('is_active', true)
    .single();

  const nextVersion = currentFlow ? currentFlow.version + 1 : 1;

  // Deactivate old flow
  if (currentFlow) {
    const { error: deactivateError } = await admin
      .from('flows')
      .update({ is_active: false, updated_at: new Date().toISOString() })
      .eq('id', currentFlow.id);

    if (deactivateError) {
      return NextResponse.json(
        { error: 'Failed to deactivate current flow' },
        { status: 500 },
      );
    }
  }

  // Create new flow version
  const { data: newFlow, error: insertError } = await admin
    .from('flows')
    .insert({
      widget_id: widgetId,
      version: nextVersion,
      is_active: true,
      steps: parsed.data.steps as unknown as Json,
    })
    .select('*')
    .single();

  if (insertError || !newFlow) {
    // Re-activate old flow if creation failed
    if (currentFlow) {
      await admin
        .from('flows')
        .update({ is_active: true })
        .eq('id', currentFlow.id);
    }
    return NextResponse.json(
      { error: 'Failed to create new flow version' },
      { status: 500 },
    );
  }

  // Update widget's updated_at
  await admin
    .from('widgets')
    .update({ updated_at: new Date().toISOString() })
    .eq('id', widgetId);

  return NextResponse.json({ data: newFlow });
}
