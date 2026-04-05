import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createAdminClient } from '@/lib/supabase/admin';
import { corsJson, corsOptions } from '@/lib/cors';
import { getPlanLimits } from '@/lib/plan-limits';
import { generateAvailableSlots } from '@/lib/booking-slots';

import type { Plan } from '@/lib/supabase/types';
import type { BookingSchedule, SlotConfig, ExistingBooking } from '@/lib/booking-slots';

export const runtime = 'nodejs';

const querySchema = z.object({
  from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  days: z.coerce.number().int().min(1).max(14).optional(),
});

interface RouteParams {
  params: Promise<{ token: string }>;
}

export async function OPTIONS(): Promise<NextResponse> {
  return corsOptions();
}

export async function GET(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse> {
  const { token } = await params;
  const admin = createAdminClient();

  // Resolve booking by token
  const { data: booking, error } = await admin
    .from('bookings')
    .select('id, widget_id, account_id, status, reschedule_token_expires_at, starts_at')
    .eq('reschedule_token', token)
    .single();

  if (error || !booking) {
    return corsJson({ error: 'Booking not found' }, { status: 404 });
  }

  if (booking.status === 'cancelled') {
    return corsJson({ error: 'This booking has been cancelled' }, { status: 410 });
  }

  if (
    booking.reschedule_token_expires_at &&
    new Date(booking.reschedule_token_expires_at) < new Date()
  ) {
    return corsJson({ error: 'Reschedule link has expired' }, { status: 410 });
  }

  // Check account plan
  const { data: account } = await admin
    .from('accounts')
    .select('plan')
    .eq('id', booking.account_id)
    .single();

  if (!account) {
    return corsJson({ error: 'Account not found' }, { status: 404 });
  }

  const planLimits = getPlanLimits(account.plan as Plan);
  if (!planLimits.booking) {
    return corsJson({ error: 'Booking not available' }, { status: 403 });
  }

  // Fetch settings
  const { data: settings } = await admin
    .from('booking_settings')
    .select('*')
    .eq('widget_id', booking.widget_id)
    .single();

  if (!settings) {
    return corsJson({ error: 'Booking settings not found' }, { status: 404 });
  }

  // Check deadline
  const deadlineMs = (settings.reschedule_deadline_hours ?? 2) * 60 * 60 * 1000;
  if (new Date(booking.starts_at).getTime() - deadlineMs < Date.now()) {
    return corsJson({ error: 'Too late to reschedule' }, { status: 403 });
  }

  // Parse query
  const url = new URL(request.url);
  const parsed = querySchema.safeParse({
    from: url.searchParams.get('from') ?? undefined,
    days: url.searchParams.get('days') ?? undefined,
  });

  if (!parsed.success) {
    return corsJson({ error: 'Invalid query parameters' }, { status: 400 });
  }

  const days = parsed.data.days ?? 7;
  const now = new Date();
  const fromDate = parsed.data.from ? new Date(parsed.data.from + 'T00:00:00Z') : now;
  const rangeEnd = new Date(fromDate.getTime() + days * 24 * 60 * 60 * 1000);

  // Fetch existing bookings (exclude this one)
  const { data: existingBookings } = await admin
    .from('bookings')
    .select('starts_at, ends_at')
    .eq('widget_id', booking.widget_id)
    .eq('status', 'confirmed')
    .neq('id', booking.id)
    .gte('starts_at', fromDate.toISOString())
    .lte('starts_at', rangeEnd.toISOString());

  const slotConfig: SlotConfig = {
    slotDurationMinutes: settings.slot_duration_minutes,
    bufferMinutes: settings.buffer_minutes,
    minNoticeHours: settings.min_notice_hours,
    maxAdvanceDays: settings.max_advance_days,
    timezone: settings.timezone,
    schedule: settings.schedule as unknown as BookingSchedule,
  };

  const slots = generateAvailableSlots(
    slotConfig,
    (existingBookings ?? []) as ExistingBooking[],
    fromDate,
    days
  );

  return corsJson({ timezone: settings.timezone, slots });
}
