import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

const updateSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  status: z.enum(['draft', 'running', 'paused', 'completed']).optional(),
  trafficSplit: z.number().int().min(1).max(99).optional(),
  winner: z.enum(['a', 'b']).nullable().optional(),
});

export async function GET(
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
    .select('account_id')
    .eq('user_id', user.id)
    .limit(1)
    .single();

  if (!member) {
    return NextResponse.json({ error: 'Account not found' }, { status: 404 });
  }

  const admin = createAdminClient();
  const { data: test, error } = await admin
    .from('ab_tests')
    .select('*')
    .eq('id', id)
    .eq('account_id', member.account_id)
    .single();

  if (error || !test) {
    return NextResponse.json({ error: 'Test not found' }, { status: 404 });
  }

  return NextResponse.json({ data: test });
}

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

  // Fetch existing test
  const { data: existing } = await admin
    .from('ab_tests')
    .select('*')
    .eq('id', id)
    .eq('account_id', member.account_id)
    .single();

  if (!existing) {
    return NextResponse.json({ error: 'Test not found' }, { status: 404 });
  }

  const updates: Record<string, unknown> = {};

  if (parsed.data.name !== undefined) {
    updates.name = parsed.data.name;
  }

  if (parsed.data.trafficSplit !== undefined) {
    updates.traffic_split = parsed.data.trafficSplit;
  }

  if (parsed.data.status !== undefined) {
    const newStatus = parsed.data.status;

    // Validate state transitions
    if (newStatus === 'running' && existing.status !== 'draft' && existing.status !== 'paused') {
      return NextResponse.json({ error: 'Can only start a draft or paused test' }, { status: 400 });
    }
    if (newStatus === 'paused' && existing.status !== 'running') {
      return NextResponse.json({ error: 'Can only pause a running test' }, { status: 400 });
    }
    if (newStatus === 'completed' && existing.status !== 'running' && existing.status !== 'paused') {
      return NextResponse.json({ error: 'Can only complete a running or paused test' }, { status: 400 });
    }

    updates.status = newStatus;

    if (newStatus === 'running' && existing.started_at === null) {
      updates.started_at = new Date().toISOString();
    }
    if (newStatus === 'completed') {
      updates.completed_at = new Date().toISOString();
    }
  }

  if (parsed.data.winner !== undefined) {
    updates.winner = parsed.data.winner;
    if (parsed.data.winner !== null) {
      updates.status = 'completed';
      updates.completed_at = new Date().toISOString();
    }
  }

  const { data: test, error: updateError } = await admin
    .from('ab_tests')
    .update(updates)
    .eq('id', id)
    .select('*')
    .single();

  if (updateError || !test) {
    return NextResponse.json({ error: 'Failed to update test' }, { status: 500 });
  }

  return NextResponse.json({ data: test });
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
    .from('ab_tests')
    .delete()
    .eq('id', id)
    .eq('account_id', member.account_id);

  if (deleteError) {
    return NextResponse.json({ error: 'Failed to delete test' }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
