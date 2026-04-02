import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

import { createClient } from '@/lib/supabase/server';
import { apiLimit, checkRateLimit } from '@/lib/rate-limit';
import { getClientIp } from '@/lib/ip';

export const runtime = 'nodejs';

const MAX_BULK_IDS = 100;

const bulkSchema = z.object({
  ids: z.array(z.string().uuid()).min(1).max(MAX_BULK_IDS),
  action: z.enum(['status_change', 'assign', 'archive']),
  payload: z.object({
    status: z.enum([
      'new', 'viewed', 'contacted', 'qualified',
      'disqualified', 'converted', 'archived',
    ]).optional(),
    assignTo: z.string().uuid().optional(),
  }).optional(),
}).strict();

export async function POST(request: NextRequest): Promise<NextResponse> {
  const ip = getClientIp(request);
  const rl = await checkRateLimit(apiLimit(), `bulk:${ip}`);
  if (!rl.success) {
    return NextResponse.json(
      { error: 'Too many requests' },
      { status: 429 },
    );
  }

  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const parsed = bulkSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Validation failed', details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const { ids, action, payload } = parsed.data;

  // Get user's account
  const { data: memberData } = await supabase
    .from('members')
    .select('account_id, role')
    .eq('user_id', user.id)
    .limit(1)
    .single();

  if (!memberData) {
    return NextResponse.json({ error: 'Account not found' }, { status: 404 });
  }

  const accountId = memberData.account_id;

  // Verify all IDs belong to user's account
  const { count: ownedCount } = await supabase
    .from('submissions')
    .select('id', { count: 'exact', head: true })
    .eq('account_id', accountId)
    .in('id', ids);

  if ((ownedCount ?? 0) !== ids.length) {
    return NextResponse.json(
      { error: 'One or more leads do not belong to your account' },
      { status: 403 },
    );
  }

  let updatedCount = 0;

  switch (action) {
    case 'status_change': {
      const newStatus = payload?.status;
      if (!newStatus) {
        return NextResponse.json(
          { error: 'payload.status is required for status_change action' },
          { status: 400 },
        );
      }

      const updateData: Record<string, unknown> = { status: newStatus };
      if (newStatus === 'viewed') {
        updateData.viewed_at = new Date().toISOString();
      } else if (newStatus === 'contacted') {
        updateData.contacted_at = new Date().toISOString();
      }

      const { data: statusResult } = await supabase
        .from('submissions')
        .update(updateData)
        .eq('account_id', accountId)
        .in('id', ids)
        .select('id');

      updatedCount = statusResult?.length ?? 0;
      break;
    }

    case 'assign': {
      const assignTo = payload?.assignTo;
      if (!assignTo) {
        return NextResponse.json(
          { error: 'payload.assignTo is required for assign action' },
          { status: 400 },
        );
      }

      // Verify assignee belongs to account
      const { data: assignee } = await supabase
        .from('members')
        .select('id')
        .eq('account_id', accountId)
        .eq('id', assignTo)
        .single();

      if (!assignee) {
        return NextResponse.json(
          { error: 'Assignee not found in your account' },
          { status: 400 },
        );
      }

      const { data: assignResult } = await supabase
        .from('submissions')
        .update({
          assigned_to: assignTo,
          assigned_at: new Date().toISOString(),
        })
        .eq('account_id', accountId)
        .in('id', ids)
        .select('id');

      updatedCount = assignResult?.length ?? 0;
      break;
    }

    case 'archive': {
      const { data: archiveResult } = await supabase
        .from('submissions')
        .update({ status: 'archived' as const })
        .eq('account_id', accountId)
        .in('id', ids)
        .select('id');

      updatedCount = archiveResult?.length ?? 0;
      break;
    }
  }

  return NextResponse.json({
    updated: updatedCount,
    action,
  });
}
