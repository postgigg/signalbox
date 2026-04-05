import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createAdminClient } from '@/lib/supabase/admin';
import { corsJson, corsOptions } from '@/lib/cors';
import { getPlanLimits } from '@/lib/plan-limits';
import { generateAvailableSlots } from '@/lib/booking-slots';
import { sendEmail } from '@/lib/email';
import { renderBookingRescheduled } from '@/lib/email/templates';

import type { Plan } from '@/lib/supabase/types';
import type { BookingSchedule, SlotConfig, ExistingBooking } from '@/lib/booking-slots';

export const runtime = 'nodejs';

const rescheduleSchema = z.object({
  startsAt: z.string().datetime(),
}).strict();

interface RouteParams {
  params: Promise<{ token: string }>;
}

export async function OPTIONS(): Promise<NextResponse> {
  return corsOptions();
}

interface ResolvedBooking {
  booking: {
    id: string; widget_id: string; account_id: string; visitor_name: string;
    visitor_email: string; starts_at: string; ends_at: string; timezone: string;
    status: string; reschedule_token: string | null;
    reschedule_token_expires_at: string | null; reschedule_count: number;
  };
  settings: {
    slot_duration_minutes: number; buffer_minutes: number;
    min_notice_hours: number; max_advance_days: number;
    timezone: string; schedule: unknown;
    reschedule_deadline_hours: number; heading_text: string;
  };
  account: { id: string; plan: string; name: string; notification_email: string | null };
  widget: { id: string; name: string };
}

async function resolveBooking(token: string): Promise<ResolvedBooking | NextResponse> {
  const admin = createAdminClient();

  const { data: booking, error } = await admin
    .from('bookings')
    .select('*')
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

  const { data: settings } = await admin
    .from('booking_settings')
    .select('*')
    .eq('widget_id', booking.widget_id)
    .single();

  if (!settings) {
    return corsJson({ error: 'Booking settings not found' }, { status: 404 });
  }

  // Check reschedule deadline
  const deadlineMs = (settings.reschedule_deadline_hours ?? 2) * 60 * 60 * 1000;
  if (new Date(booking.starts_at).getTime() - deadlineMs < Date.now()) {
    return corsJson({ error: 'Too late to reschedule this booking' }, { status: 403 });
  }

  const { data: account } = await admin
    .from('accounts')
    .select('id, plan, name, notification_email')
    .eq('id', booking.account_id)
    .single();

  if (!account) {
    return corsJson({ error: 'Account not found' }, { status: 404 });
  }

  const planLimits = getPlanLimits(account.plan as Plan);
  if (!planLimits.booking) {
    return corsJson({ error: 'Booking not available' }, { status: 403 });
  }

  const { data: widget } = await admin
    .from('widgets')
    .select('id, name')
    .eq('id', booking.widget_id)
    .single();

  if (!widget) {
    return corsJson({ error: 'Widget not found' }, { status: 404 });
  }

  return {
    booking: booking as unknown as ResolvedBooking['booking'],
    settings: settings as unknown as ResolvedBooking['settings'],
    account: account as unknown as ResolvedBooking['account'],
    widget: widget as unknown as ResolvedBooking['widget'],
  };
}

export async function GET(
  _request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse> {
  const { token } = await params;
  const result = await resolveBooking(token);
  if (result instanceof NextResponse) return result;

  const { booking, settings } = result;

  return corsJson({
    booking: {
      id: booking.id,
      startsAt: booking.starts_at,
      endsAt: booking.ends_at,
      timezone: booking.timezone,
      visitorName: booking.visitor_name,
      visitorEmail: booking.visitor_email,
      status: booking.status,
    },
    settings: {
      slotDuration: settings.slot_duration_minutes,
      timezone: settings.timezone,
      headingText: settings.heading_text,
    },
  });
}

export async function POST(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse> {
  const { token } = await params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return corsJson({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const parsed = rescheduleSchema.safeParse(body);
  if (!parsed.success) {
    return corsJson(
      { error: 'Validation failed', details: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  const resolveResult = await resolveBooking(token);
  if (resolveResult instanceof NextResponse) return resolveResult;

  const { booking, settings, account } = resolveResult;
  const admin = createAdminClient();

  const newStartsAt = new Date(parsed.data.startsAt);
  const durationMinutes = settings.slot_duration_minutes as number;
  const newEndsAt = new Date(newStartsAt.getTime() + durationMinutes * 60 * 1000);
  const tz = settings.timezone as string;

  // Verify slot is available
  const dayStart = new Date(newStartsAt);
  dayStart.setUTCHours(0, 0, 0, 0);

  const { data: dayBookings } = await admin
    .from('bookings')
    .select('starts_at, ends_at')
    .eq('widget_id', booking.widget_id)
    .eq('status', 'confirmed')
    .neq('id', booking.id)
    .gte('starts_at', dayStart.toISOString())
    .lte('starts_at', new Date(dayStart.getTime() + 24 * 60 * 60 * 1000).toISOString());

  const slotConfig: SlotConfig = {
    slotDurationMinutes: durationMinutes,
    bufferMinutes: settings.buffer_minutes as number,
    minNoticeHours: settings.min_notice_hours as number,
    maxAdvanceDays: settings.max_advance_days as number,
    timezone: tz,
    schedule: settings.schedule as unknown as BookingSchedule,
  };

  const slots = generateAvailableSlots(
    slotConfig,
    (dayBookings ?? []) as ExistingBooking[],
    dayStart,
    1
  );

  const slotAvailable = slots.some((day) =>
    day.slots.some((s) => s.startsAt === parsed.data.startsAt)
  );

  if (!slotAvailable) {
    return corsJson({ error: 'This time is no longer available' }, { status: 409 });
  }

  // Update booking
  const { data: updated, error: updateError } = await admin
    .from('bookings')
    .update({
      starts_at: newStartsAt.toISOString(),
      ends_at: newEndsAt.toISOString(),
      rescheduled_from: booking.starts_at,
      reschedule_count: booking.reschedule_count + 1,
      reminder_sent: false,
      reminder_sent_at: null,
    })
    .eq('id', booking.id)
    .select('id, starts_at, ends_at, timezone')
    .single();

  if (updateError) {
    if (updateError.message.includes('overlap')) {
      return corsJson({ error: 'This time is no longer available' }, { status: 409 });
    }
    return corsJson({ error: 'Failed to reschedule' }, { status: 500 });
  }

  // Update analytics
  const today = new Date().toISOString().split('T')[0]!;
  void Promise.resolve(
    (async () => {
      const { data: existingAnalytics } = await admin
        .from('widget_analytics')
        .select('id, bookings_rescheduled')
        .eq('widget_id', booking.widget_id)
        .eq('date', today)
        .maybeSingle();

      if (existingAnalytics) {
        await admin
          .from('widget_analytics')
          .update({ bookings_rescheduled: existingAnalytics.bookings_rescheduled + 1 })
          .eq('id', existingAnalytics.id);
      }
    })()
  ).catch(() => { /* analytics non-blocking */ });

  // Send rescheduled email to visitor
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://hawkleads.io';
  const rescheduleUrl = `${appUrl}/reschedule/${token}`;

  void Promise.resolve(
    (async () => {
      const rendered = renderBookingRescheduled({
        visitorName: booking.visitor_name as string,
        accountName: account.name as string,
        startsAt: newStartsAt.toISOString(),
        timezone: tz,
        durationMinutes,
        rescheduleUrl,
      });
      await sendEmail({
        to: booking.visitor_email as string,
        subject: rendered.subject,
        html: rendered.html,
        text: rendered.text,
        tags: [{ name: 'type', value: 'booking_rescheduled' }],
      });
    })()
  ).catch((err: unknown) => {
    console.error('[reschedule] Email failed:', err instanceof Error ? err.message : String(err));
  });

  return corsJson({
    booking: {
      id: updated?.id,
      startsAt: updated?.starts_at,
      endsAt: updated?.ends_at,
      timezone: updated?.timezone,
    },
  });
}
