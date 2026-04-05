import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { sendEmail } from '@/lib/email';
import { renderBookingReminder } from '@/lib/email/templates';

export const runtime = 'nodejs';

const BATCH_SIZE = 50;

export async function POST(request: NextRequest): Promise<NextResponse> {
  // Verify cron secret
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const admin = createAdminClient();
  const now = new Date();
  let sentCount = 0;
  let noShowCount = 0;

  // 1. Send reminder emails for upcoming bookings
  // Query: confirmed, reminder not sent, starts_at within reminder window, starts_at still in future
  const { data: bookingsToRemind } = await admin
    .from('bookings')
    .select(`
      id, widget_id, account_id, visitor_name, visitor_email,
      starts_at, ends_at, timezone, status, reschedule_token
    `)
    .eq('status', 'confirmed')
    .eq('reminder_sent', false)
    .gt('starts_at', now.toISOString())
    .order('starts_at', { ascending: true })
    .limit(BATCH_SIZE);

  if (bookingsToRemind && bookingsToRemind.length > 0) {
    for (const booking of bookingsToRemind) {
      // Fetch booking settings to get reminder_hours_before
      const { data: settings } = await admin
        .from('booking_settings')
        .select('reminder_hours_before, slot_duration_minutes')
        .eq('widget_id', booking.widget_id)
        .single();

      if (!settings) continue;

      const reminderHours = settings.reminder_hours_before ?? 24;
      const reminderThreshold = new Date(
        new Date(booking.starts_at).getTime() - reminderHours * 60 * 60 * 1000
      );

      // Only send if we're within the reminder window
      if (now < reminderThreshold) continue;

      // Re-check status (in case it was cancelled between query and here)
      const { data: fresh } = await admin
        .from('bookings')
        .select('status')
        .eq('id', booking.id)
        .single();

      if (!fresh || fresh.status !== 'confirmed') continue;

      // Fetch account name
      const { data: account } = await admin
        .from('accounts')
        .select('name')
        .eq('id', booking.account_id)
        .single();

      const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://hawkleads.io';
      const rescheduleUrl = booking.reschedule_token
        ? `${appUrl}/reschedule/${booking.reschedule_token}`
        : appUrl;

      const rendered = renderBookingReminder({
        visitorName: booking.visitor_name,
        accountName: account?.name ?? 'Our team',
        startsAt: booking.starts_at,
        timezone: booking.timezone,
        durationMinutes: settings.slot_duration_minutes,
        rescheduleUrl,
      });

      const result = await sendEmail({
        to: booking.visitor_email,
        subject: rendered.subject,
        html: rendered.html,
        text: rendered.text,
        tags: [{ name: 'type', value: 'booking_reminder' }],
      });

      if (result.success) {
        await admin
          .from('bookings')
          .update({
            reminder_sent: true,
            reminder_sent_at: now.toISOString(),
          })
          .eq('id', booking.id);
        sentCount++;
      }
      // On failure, don't update reminder_sent so it retries next cron run
    }
  }

  // 2. Auto-mark no-shows: confirmed bookings where ends_at < now - 1 hour
  const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000).toISOString();
  const { data: noShowBookings } = await admin
    .from('bookings')
    .select('id, widget_id, account_id')
    .eq('status', 'confirmed')
    .lt('ends_at', oneHourAgo)
    .limit(BATCH_SIZE);

  if (noShowBookings && noShowBookings.length > 0) {
    for (const booking of noShowBookings) {
      await admin
        .from('bookings')
        .update({ status: 'no_show' })
        .eq('id', booking.id);

      // Update analytics
      const today = new Date().toISOString().split('T')[0]!;
      const { data: existingAnalytics } = await admin
        .from('widget_analytics')
        .select('id, bookings_no_show')
        .eq('widget_id', booking.widget_id)
        .eq('date', today)
        .maybeSingle();

      if (existingAnalytics) {
        await admin
          .from('widget_analytics')
          .update({ bookings_no_show: existingAnalytics.bookings_no_show + 1 })
          .eq('id', existingAnalytics.id);
      } else {
        await admin.from('widget_analytics').insert({
          widget_id: booking.widget_id,
          account_id: booking.account_id,
          date: today,
          bookings_no_show: 1,
        });
      }
      noShowCount++;
    }
  }

  return NextResponse.json({
    remindersSent: sentCount,
    noShowsMarked: noShowCount,
  });
}
