import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createAdminClient } from '@/lib/supabase/admin';
import { bookingSlotsLimit, checkRateLimit } from '@/lib/rate-limit';
import { corsJson, corsOptions } from '@/lib/cors';
import { getClientIp } from '@/lib/ip';
import { getPlanLimits } from '@/lib/plan-limits';
import { generateAvailableSlots } from '@/lib/booking-slots';

import type { Plan } from '@/lib/supabase/types';
import type { BookingSchedule, SlotConfig, ExistingBooking } from '@/lib/booking-slots';

export const runtime = 'nodejs';

const querySchema = z.object({
  from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  days: z.coerce.number().int().min(1).max(14).optional(),
  submissionId: z.string().uuid().optional(),
});

interface RouteParams {
  params: Promise<{ key: string }>;
}

export async function OPTIONS(): Promise<NextResponse> {
  return corsOptions();
}

export async function GET(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse> {
  const { key } = await params;
  const ip = getClientIp(request);

  // Rate limit
  const rl = await checkRateLimit(bookingSlotsLimit(), `${ip}:${key}`);
  if (!rl.success) {
    return corsJson({ error: 'Rate limit exceeded' }, { status: 429 });
  }

  // Parse query params
  const url = new URL(request.url);
  const parsed = querySchema.safeParse({
    from: url.searchParams.get('from') ?? undefined,
    days: url.searchParams.get('days') ?? undefined,
    submissionId: url.searchParams.get('submissionId') ?? undefined,
  });

  if (!parsed.success) {
    return corsJson(
      { error: 'Invalid query parameters', details: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  const days = parsed.data.days ?? 7;
  const admin = createAdminClient();

  // Fetch widget
  const { data: widget, error: widgetError } = await admin
    .from('widgets')
    .select('id, account_id, is_active')
    .eq('widget_key', key)
    .single();

  if (widgetError || !widget) {
    return corsJson({ error: 'Widget not found' }, { status: 404 });
  }

  if (!widget.is_active) {
    return corsJson({ error: 'Widget is not active' }, { status: 410 });
  }

  // Check account
  const { data: account, error: accountError } = await admin
    .from('accounts')
    .select('id, plan, is_suspended, subscription_status, trial_ends_at')
    .eq('id', widget.account_id)
    .single();

  if (accountError || !account) {
    return corsJson({ error: 'Account not found' }, { status: 404 });
  }

  if (account.is_suspended) {
    return corsJson({ error: 'Account suspended' }, { status: 402 });
  }

  // Plan check
  const planLimits = getPlanLimits(account.plan as Plan);
  if (!planLimits.booking) {
    return corsJson({ error: 'Booking not available on this plan' }, { status: 403 });
  }

  // Fetch booking settings
  const { data: settings, error: settingsError } = await admin
    .from('booking_settings')
    .select('*')
    .eq('widget_id', widget.id)
    .single();

  if (settingsError || !settings) {
    return corsJson({ error: 'Booking is not configured' }, { status: 404 });
  }

  if (!settings.enabled) {
    return corsJson({ error: 'Booking is not enabled' }, { status: 404 });
  }

  // Determine schedule source based on booking_mode
  let schedule: BookingSchedule = settings.schedule as unknown as BookingSchedule;
  let timezone: string = settings.timezone;

  if (settings.booking_mode === 'member' && parsed.data.submissionId) {
    // Look up assigned member and their availability
    const { data: submission } = await admin
      .from('submissions')
      .select('assigned_to')
      .eq('id', parsed.data.submissionId)
      .single();

    if (submission?.assigned_to) {
      const { data: memberAvail } = await admin
        .from('member_availability')
        .select('schedule, timezone')
        .eq('member_id', submission.assigned_to)
        .single();

      if (memberAvail?.schedule) {
        schedule = memberAvail.schedule as unknown as BookingSchedule;
        timezone = memberAvail.timezone ?? settings.timezone;
      }
    }
  }

  // Determine date range
  const now = new Date();
  const fromDate = parsed.data.from ? new Date(parsed.data.from + 'T00:00:00Z') : now;

  // Fetch existing confirmed bookings in the date range
  const rangeEnd = new Date(fromDate.getTime() + days * 24 * 60 * 60 * 1000);
  const { data: existingBookings } = await admin
    .from('bookings')
    .select('starts_at, ends_at')
    .eq('widget_id', widget.id)
    .eq('status', 'confirmed')
    .gte('starts_at', fromDate.toISOString())
    .lte('starts_at', rangeEnd.toISOString());

  const slotConfig: SlotConfig = {
    slotDurationMinutes: settings.slot_duration_minutes,
    bufferMinutes: settings.buffer_minutes,
    minNoticeHours: settings.min_notice_hours,
    maxAdvanceDays: settings.max_advance_days,
    timezone,
    schedule,
  };

  const slots = generateAvailableSlots(
    slotConfig,
    (existingBookings ?? []) as ExistingBooking[],
    fromDate,
    days
  );

  const response = corsJson(
    { timezone, slots },
    { status: 200 }
  );
  response.headers.set('Cache-Control', 'public, max-age=10');
  return response;
}
