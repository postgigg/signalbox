import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createAdminClient } from '@/lib/supabase/admin';
import { authenticateRequest, requireRole } from '@/lib/auth';
import { getPlanLimits } from '@/lib/plan-limits';

import type { Plan } from '@/lib/supabase/types';

export const runtime = 'nodejs';

const scheduleSchema = z.object({
  mon: z.object({ start: z.string(), end: z.string() }).nullable(),
  tue: z.object({ start: z.string(), end: z.string() }).nullable(),
  wed: z.object({ start: z.string(), end: z.string() }).nullable(),
  thu: z.object({ start: z.string(), end: z.string() }).nullable(),
  fri: z.object({ start: z.string(), end: z.string() }).nullable(),
  sat: z.object({ start: z.string(), end: z.string() }).nullable(),
  sun: z.object({ start: z.string(), end: z.string() }).nullable(),
});

const putSchema = z.object({
  enabled: z.boolean().optional(),
  tiers: z.array(z.enum(['hot', 'warm', 'cold'])).min(1).optional(),
  slotDurationMinutes: z.number().int().refine((v) => [15, 30, 45, 60].includes(v)).optional(),
  bufferMinutes: z.number().int().min(0).max(60).optional(),
  minNoticeHours: z.number().int().min(1).max(72).optional(),
  maxAdvanceDays: z.number().int().min(1).max(60).optional(),
  timezone: z.string().min(1).max(100).optional(),
  schedule: scheduleSchema.optional(),
  headingText: z.string().min(1).max(500).optional(),
  confirmText: z.string().min(1).max(500).optional(),
  bookingMode: z.enum(['widget', 'member']).optional(),
  rescheduleDeadlineHours: z.number().int().min(0).max(72).optional(),
  reminderHoursBefore: z.number().int().min(1).max(72).optional(),
}).strict();

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse> {
  const { id: widgetId } = await params;

  const authResult = await authenticateRequest(request);
  if ('error' in authResult) return authResult.error;
  const { account } = authResult.ctx;

  // Plan check
  const planLimits = getPlanLimits(account.plan as Plan);
  if (!planLimits.booking) {
    return NextResponse.json(
      { error: 'Booking not available on this plan' },
      { status: 403 }
    );
  }

  // Verify widget belongs to account
  const admin = createAdminClient();
  const { data: widget, error: widgetError } = await admin
    .from('widgets')
    .select('id')
    .eq('id', widgetId)
    .eq('account_id', account.id)
    .single();

  if (widgetError || !widget) {
    return NextResponse.json({ error: 'Widget not found' }, { status: 404 });
  }

  // Fetch or create default settings
  let { data: settings } = await admin
    .from('booking_settings')
    .select('*')
    .eq('widget_id', widgetId)
    .single();

  if (!settings) {
    const { data: created, error: createError } = await admin
      .from('booking_settings')
      .insert({
        widget_id: widgetId,
        account_id: account.id,
      })
      .select('*')
      .single();

    if (createError || !created) {
      return NextResponse.json({ error: 'Failed to create booking settings' }, { status: 500 });
    }
    settings = created;
  }

  return NextResponse.json({ settings });
}

export async function PUT(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse> {
  const { id: widgetId } = await params;

  const authResult = await authenticateRequest(request);
  if ('error' in authResult) return authResult.error;
  const { member, account } = authResult.ctx;

  // Require owner/admin role
  const roleError = requireRole(member, ['owner', 'admin']);
  if (roleError) return roleError;

  // Plan check
  const planLimits = getPlanLimits(account.plan as Plan);
  if (!planLimits.booking) {
    return NextResponse.json(
      { error: 'Booking not available on this plan' },
      { status: 403 }
    );
  }

  // Parse body
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const parsed = putSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Validation failed', details: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  const data = parsed.data;
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

  // Build update object
  const updateFields: Record<string, unknown> = {};
  if (data.enabled !== undefined) updateFields.enabled = data.enabled;
  if (data.tiers !== undefined) updateFields.tiers = data.tiers;
  if (data.slotDurationMinutes !== undefined) updateFields.slot_duration_minutes = data.slotDurationMinutes;
  if (data.bufferMinutes !== undefined) updateFields.buffer_minutes = data.bufferMinutes;
  if (data.minNoticeHours !== undefined) updateFields.min_notice_hours = data.minNoticeHours;
  if (data.maxAdvanceDays !== undefined) updateFields.max_advance_days = data.maxAdvanceDays;
  if (data.timezone !== undefined) updateFields.timezone = data.timezone;
  if (data.schedule !== undefined) updateFields.schedule = data.schedule;
  if (data.headingText !== undefined) updateFields.heading_text = data.headingText;
  if (data.confirmText !== undefined) updateFields.confirm_text = data.confirmText;
  if (data.bookingMode !== undefined) updateFields.booking_mode = data.bookingMode;
  if (data.rescheduleDeadlineHours !== undefined) updateFields.reschedule_deadline_hours = data.rescheduleDeadlineHours;
  if (data.reminderHoursBefore !== undefined) updateFields.reminder_hours_before = data.reminderHoursBefore;

  // Upsert
  const { data: existing } = await admin
    .from('booking_settings')
    .select('id')
    .eq('widget_id', widgetId)
    .single();

  let settings;
  if (existing) {
    const { data: updated, error: updateError } = await admin
      .from('booking_settings')
      .update(updateFields)
      .eq('widget_id', widgetId)
      .select('*')
      .single();

    if (updateError || !updated) {
      return NextResponse.json({ error: 'Failed to update booking settings' }, { status: 500 });
    }
    settings = updated;
  } else {
    const { data: created, error: createError } = await admin
      .from('booking_settings')
      .insert({
        widget_id: widgetId,
        account_id: account.id,
        ...updateFields,
      })
      .select('*')
      .single();

    if (createError || !created) {
      return NextResponse.json({ error: 'Failed to create booking settings' }, { status: 500 });
    }
    settings = created;
  }

  return NextResponse.json({ settings });
}
