import { NextRequest, NextResponse } from 'next/server';
import { randomBytes } from 'crypto';
import { z } from 'zod';
import { createAdminClient } from '@/lib/supabase/admin';
import { bookingCreateLimit, checkRateLimit } from '@/lib/rate-limit';
import { corsJson, corsOptions } from '@/lib/cors';
import { getClientIp } from '@/lib/ip';
import { getPlanLimits } from '@/lib/plan-limits';
import { generateAvailableSlots } from '@/lib/booking-slots';
import { stripHtml } from '@/lib/sanitize';
import { sendEmail } from '@/lib/email';
import { renderBookingConfirmation, renderBookingAlert } from '@/lib/email/templates';

import type { Plan } from '@/lib/supabase/types';
import type { BookingSchedule, SlotConfig, ExistingBooking } from '@/lib/booking-slots';

export const runtime = 'nodejs';

const bookSchema = z.object({
  submissionId: z.string().uuid(),
  startsAt: z.string().datetime(),
  visitorName: z.string().min(1).max(200).transform(stripHtml),
  visitorEmail: z.string().email().max(320),
  visitorPhone: z.string().max(50).optional(),
}).strict();

interface RouteParams {
  params: Promise<{ key: string }>;
}

export async function OPTIONS(): Promise<NextResponse> {
  return corsOptions();
}

export async function POST(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse> {
  const { key } = await params;
  const ip = getClientIp(request);

  // Rate limit
  const rl = await checkRateLimit(bookingCreateLimit(), ip);
  if (!rl.success) {
    return corsJson({ error: 'Rate limit exceeded' }, { status: 429 });
  }

  // Parse body
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return corsJson({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const parsed = bookSchema.safeParse(body);
  if (!parsed.success) {
    return corsJson(
      { error: 'Validation failed', details: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  const payload = parsed.data;
  const admin = createAdminClient();

  // Fetch widget
  const { data: widget, error: widgetError } = await admin
    .from('widgets')
    .select('id, account_id, is_active, name')
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
    .select('id, plan, name, is_suspended, subscription_status, trial_ends_at, notification_email, owner_id')
    .eq('id', widget.account_id)
    .single();

  if (accountError || !account) {
    return corsJson({ error: 'Account not found' }, { status: 404 });
  }

  if (account.is_suspended) {
    return corsJson({ error: 'Account suspended' }, { status: 402 });
  }

  const isCanceled = account.subscription_status === 'canceled';
  const isUnpaid = account.subscription_status === 'unpaid';
  const isTrialExpired =
    account.subscription_status === 'trialing' &&
    account.trial_ends_at !== null &&
    new Date(account.trial_ends_at) < new Date();

  if (isCanceled || isUnpaid || isTrialExpired) {
    return corsJson({ error: 'Subscription inactive' }, { status: 402 });
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

  // Verify submission exists and matches email
  const { data: submission, error: subError } = await admin
    .from('submissions')
    .select('id, visitor_email, lead_tier, lead_score, created_at')
    .eq('id', payload.submissionId)
    .eq('widget_id', widget.id)
    .single();

  if (subError || !submission) {
    return corsJson({ error: 'Submission not found' }, { status: 404 });
  }

  if (submission.visitor_email.toLowerCase() !== payload.visitorEmail.toLowerCase()) {
    return corsJson({ error: 'Email does not match submission' }, { status: 400 });
  }

  // Check for existing booking for this submission (idempotency)
  const { data: existingBooking } = await admin
    .from('bookings')
    .select('id, starts_at, ends_at, timezone')
    .eq('submission_id', payload.submissionId)
    .eq('status', 'confirmed')
    .limit(1)
    .maybeSingle();

  if (existingBooking) {
    return corsJson(
      {
        bookingId: existingBooking.id,
        startsAt: existingBooking.starts_at,
        endsAt: existingBooking.ends_at,
        timezone: existingBooking.timezone,
      },
      { status: 200 }
    );
  }

  // Verify slot is still available by re-generating
  const slotStart = new Date(payload.startsAt);
  const slotEnd = new Date(slotStart.getTime() + settings.slot_duration_minutes * 60 * 1000);

  // Determine schedule source
  let schedule: BookingSchedule = settings.schedule as unknown as BookingSchedule;
  let timezone: string = settings.timezone;

  if (settings.booking_mode === 'member' && submission) {
    const { data: subFull } = await admin
      .from('submissions')
      .select('assigned_to')
      .eq('id', payload.submissionId)
      .single();

    if (subFull?.assigned_to) {
      const { data: memberAvail } = await admin
        .from('member_availability')
        .select('schedule, timezone')
        .eq('member_id', subFull.assigned_to)
        .single();

      if (memberAvail?.schedule) {
        schedule = memberAvail.schedule as unknown as BookingSchedule;
        timezone = memberAvail.timezone ?? settings.timezone;
      }
    }
  }

  // Check existing bookings for overlap validation
  const dayStart = new Date(slotStart);
  dayStart.setUTCHours(0, 0, 0, 0);
  const dayEnd = new Date(slotStart);
  dayEnd.setUTCHours(23, 59, 59, 999);

  const { data: dayBookings } = await admin
    .from('bookings')
    .select('starts_at, ends_at')
    .eq('widget_id', widget.id)
    .eq('status', 'confirmed')
    .gte('starts_at', dayStart.toISOString())
    .lte('starts_at', dayEnd.toISOString());

  const slotConfig: SlotConfig = {
    slotDurationMinutes: settings.slot_duration_minutes,
    bufferMinutes: settings.buffer_minutes,
    minNoticeHours: settings.min_notice_hours,
    maxAdvanceDays: settings.max_advance_days,
    timezone,
    schedule,
  };

  const availableSlots = generateAvailableSlots(
    slotConfig,
    (dayBookings ?? []) as ExistingBooking[],
    dayStart,
    1
  );

  const slotStillAvailable = availableSlots.some((day) =>
    day.slots.some((s) => s.startsAt === payload.startsAt)
  );

  if (!slotStillAvailable) {
    return corsJson(
      { error: 'This time is no longer available' },
      { status: 409 }
    );
  }

  // Generate reschedule token
  const rescheduleToken = randomBytes(24).toString('hex');
  const rescheduleExpiry = new Date(slotEnd.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days after booking

  // Insert booking
  const { data: booking, error: insertError } = await admin
    .from('bookings')
    .insert({
      widget_id: widget.id,
      account_id: account.id,
      submission_id: payload.submissionId,
      visitor_name: payload.visitorName,
      visitor_email: payload.visitorEmail,
      visitor_phone: payload.visitorPhone ?? null,
      starts_at: slotStart.toISOString(),
      ends_at: slotEnd.toISOString(),
      timezone,
      status: 'confirmed',
      reschedule_token: rescheduleToken,
      reschedule_token_expires_at: rescheduleExpiry.toISOString(),
    })
    .select('id, starts_at, ends_at, timezone')
    .single();

  if (insertError) {
    // Overlap trigger raises exception
    if (insertError.message.includes('overlap')) {
      return corsJson(
        { error: 'This time is no longer available' },
        { status: 409 }
      );
    }
    console.error('[book] Insert failed:', insertError.message);
    return corsJson({ error: 'Failed to create booking' }, { status: 500 });
  }

  // Update booking analytics
  const today = new Date().toISOString().split('T')[0]!;
  const submissionCreatedAt = new Date(submission.created_at);
  const delaySeconds = Math.floor((Date.now() - submissionCreatedAt.getTime()) / 1000);

  void Promise.resolve(
    (async () => {
      const { data: existingAnalytics } = await admin
        .from('widget_analytics')
        .select('id, bookings_created, hot_leads_with_booking, total_booking_delay_seconds, booking_delay_count')
        .eq('widget_id', widget.id)
        .eq('date', today)
        .maybeSingle();

      if (existingAnalytics) {
        await admin
          .from('widget_analytics')
          .update({
            bookings_created: existingAnalytics.bookings_created + 1,
            hot_leads_with_booking: existingAnalytics.hot_leads_with_booking + (submission.lead_tier === 'hot' ? 1 : 0),
            total_booking_delay_seconds: existingAnalytics.total_booking_delay_seconds + delaySeconds,
            booking_delay_count: existingAnalytics.booking_delay_count + 1,
          })
          .eq('id', existingAnalytics.id);
      } else {
        await admin.from('widget_analytics').insert({
          widget_id: widget.id,
          account_id: account.id,
          date: today,
          bookings_created: 1,
          hot_leads_with_booking: submission.lead_tier === 'hot' ? 1 : 0,
          total_booking_delay_seconds: delaySeconds,
          booking_delay_count: 1,
        });
      }
    })()
  ).catch((err: unknown) => {
    console.error('[book] Analytics update failed:', err instanceof Error ? err.message : String(err));
  });

  // Fire async emails
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://hawkleads.io';
  const rescheduleUrl = `${appUrl}/reschedule/${rescheduleToken}`;

  // Visitor confirmation email
  void Promise.resolve(
    (async () => {
      const rendered = renderBookingConfirmation({
        visitorName: payload.visitorName,
        accountName: account.name,
        startsAt: slotStart.toISOString(),
        timezone,
        durationMinutes: settings.slot_duration_minutes,
        rescheduleUrl,
      });
      await sendEmail({
        to: payload.visitorEmail,
        subject: rendered.subject,
        html: rendered.html,
        text: rendered.text,
        tags: [{ name: 'type', value: 'booking_confirmation' }],
      });
      await admin
        .from('bookings')
        .update({ confirmation_sent: true })
        .eq('id', booking.id);
    })()
  ).catch((err: unknown) => {
    console.error('[book] Confirmation email failed:', err instanceof Error ? err.message : String(err));
  });

  // Owner alert email
  if (account.notification_email) {
    const ownerEmail = account.notification_email;
    void Promise.resolve(
      (async () => {
        const rendered = renderBookingAlert({
          accountName: account.name,
          widgetName: widget.name,
          visitorName: payload.visitorName,
          visitorEmail: payload.visitorEmail,
          leadTier: submission.lead_tier as 'hot' | 'warm' | 'cold',
          leadScore: submission.lead_score,
          startsAt: slotStart.toISOString(),
          timezone,
          durationMinutes: settings.slot_duration_minutes,
          submissionId: payload.submissionId,
        });
        await sendEmail({
          to: ownerEmail,
          subject: rendered.subject,
          html: rendered.html,
          text: rendered.text,
          tags: [{ name: 'type', value: 'booking_alert' }],
        });
        await admin
          .from('bookings')
          .update({ owner_notified: true })
          .eq('id', booking.id);
      })()
    ).catch((err: unknown) => {
      console.error('[book] Owner alert email failed:', err instanceof Error ? err.message : String(err));
    });
  }

  return corsJson(
    {
      bookingId: booking.id,
      startsAt: booking.starts_at,
      endsAt: booking.ends_at,
      timezone: booking.timezone,
    },
    { status: 201 }
  );
}
