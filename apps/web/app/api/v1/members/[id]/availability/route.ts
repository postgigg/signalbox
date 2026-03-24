import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

import type { Json } from '@/lib/supabase/types';

const MAX_ACTIVE_LEADS = 1000;
const MAX_AUTO_OFFLINE_MINUTES = 1440;

const patchSchema = z.object({
  status: z.enum(['online', 'offline', 'busy']).optional(),
  schedule: z.record(z.unknown()).nullable().optional(),
  maxActiveLeads: z.number().int().min(0).max(MAX_ACTIVE_LEADS).nullable().optional(),
  timezone: z.string().min(1).max(100).optional(),
  autoOfflineMinutes: z.number().int().min(0).max(MAX_AUTO_OFFLINE_MINUTES).optional(),
});

interface RouteParams {
  params: Promise<{ id: string }>;
}

interface AvailabilityResponse {
  memberId: string;
  status: string;
  statusUpdatedAt: string;
  lastActiveAt: string;
  autoOfflineMinutes: number;
  maxActiveLeads: number | null;
  timezone: string;
  schedule: Json | null;
}

function formatAvailability(
  row: {
    member_id: string;
    status: string;
    status_updated_at: string;
    last_active_at: string;
    auto_offline_minutes: number;
    max_active_leads: number | null;
    timezone: string;
    schedule: Json | null;
  },
): AvailabilityResponse {
  return {
    memberId: row.member_id,
    status: row.status,
    statusUpdatedAt: row.status_updated_at,
    lastActiveAt: row.last_active_at,
    autoOfflineMinutes: row.auto_offline_minutes,
    maxActiveLeads: row.max_active_leads,
    timezone: row.timezone,
    schedule: row.schedule,
  };
}

const DEFAULT_AVAILABILITY: AvailabilityResponse = {
  memberId: '',
  status: 'offline',
  statusUpdatedAt: new Date().toISOString(),
  lastActiveAt: new Date().toISOString(),
  autoOfflineMinutes: 30,
  maxActiveLeads: null,
  timezone: 'UTC',
  schedule: null,
};

export async function GET(
  _request: NextRequest,
  { params }: RouteParams,
): Promise<NextResponse> {
  const { id } = await params;
  const supabase = await createClient();
  const admin = createAdminClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: requester } = await admin
    .from('members')
    .select('id, account_id, role')
    .eq('user_id', user.id)
    .limit(1)
    .single();

  if (!requester) {
    return NextResponse.json({ error: 'Not a member' }, { status: 403 });
  }

  // Verify target member belongs to same account
  const { data: target } = await admin
    .from('members')
    .select('id, account_id')
    .eq('id', id)
    .eq('account_id', requester.account_id)
    .single();

  if (!target) {
    return NextResponse.json({ error: 'Member not found' }, { status: 404 });
  }

  const { data: row } = await admin
    .from('member_availability')
    .select('*')
    .eq('member_id', id)
    .eq('account_id', requester.account_id)
    .maybeSingle();

  if (!row) {
    return NextResponse.json({
      availability: { ...DEFAULT_AVAILABILITY, memberId: id },
    });
  }

  return NextResponse.json({ availability: formatAvailability(row) });
}

export async function PATCH(
  request: NextRequest,
  { params }: RouteParams,
): Promise<NextResponse> {
  const { id } = await params;
  const supabase = await createClient();
  const admin = createAdminClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: requester } = await admin
    .from('members')
    .select('id, account_id, role')
    .eq('user_id', user.id)
    .limit(1)
    .single();

  if (!requester) {
    return NextResponse.json({ error: 'Not a member' }, { status: 403 });
  }

  // Members can update their own; admins/owners can update anyone in account
  const isSelf = requester.id === id;
  const isPrivileged = requester.role === 'owner' || requester.role === 'admin';

  if (!isSelf && !isPrivileged) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  // Verify target member belongs to same account
  const { data: target } = await admin
    .from('members')
    .select('id, account_id')
    .eq('id', id)
    .eq('account_id', requester.account_id)
    .single();

  if (!target) {
    return NextResponse.json({ error: 'Member not found' }, { status: 404 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Validation failed', details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const now = new Date().toISOString();
  const updates: Record<string, unknown> = { updated_at: now };

  if (parsed.data.status !== undefined) {
    updates.status = parsed.data.status;
    updates.status_updated_at = now;
  }
  if (parsed.data.schedule !== undefined) {
    updates.schedule = parsed.data.schedule;
  }
  if (parsed.data.maxActiveLeads !== undefined) {
    updates.max_active_leads = parsed.data.maxActiveLeads;
  }
  if (parsed.data.timezone !== undefined) {
    updates.timezone = parsed.data.timezone;
  }
  if (parsed.data.autoOfflineMinutes !== undefined) {
    updates.auto_offline_minutes = parsed.data.autoOfflineMinutes;
  }

  // Upsert: try update first, insert if not found
  const { data: existing } = await admin
    .from('member_availability')
    .select('member_id')
    .eq('member_id', id)
    .eq('account_id', requester.account_id)
    .maybeSingle();

  if (existing) {
    const { data: updated, error: updateError } = await admin
      .from('member_availability')
      .update(updates)
      .eq('member_id', id)
      .eq('account_id', requester.account_id)
      .select('*')
      .single();

    if (updateError || !updated) {
      return NextResponse.json({ error: 'Failed to update availability' }, { status: 500 });
    }

    return NextResponse.json({ availability: formatAvailability(updated) });
  }

  // Insert new row
  const insertData = {
    member_id: id,
    account_id: requester.account_id,
    status: parsed.data.status ?? ('offline' as const),
    status_updated_at: now,
    last_active_at: now,
    auto_offline_minutes: parsed.data.autoOfflineMinutes ?? 30,
    max_active_leads: parsed.data.maxActiveLeads ?? null,
    timezone: parsed.data.timezone ?? 'UTC',
    schedule: (parsed.data.schedule ?? null) as Json,
  };

  const { data: inserted, error: insertError } = await admin
    .from('member_availability')
    .insert(insertData)
    .select('*')
    .single();

  if (insertError || !inserted) {
    return NextResponse.json({ error: 'Failed to create availability' }, { status: 500 });
  }

  return NextResponse.json({ availability: formatAvailability(inserted) });
}
