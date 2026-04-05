import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createAdminClient } from '@/lib/supabase/admin';
import { authenticateRequest, requireRole } from '@/lib/auth';

export const runtime = 'nodejs';

const patchSchema = z.object({
  status: z.enum(['completed', 'no_show', 'cancelled']),
}).strict();

interface RouteParams {
  params: Promise<{ id: string; bookingId: string }>;
}

export async function PATCH(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse> {
  const { id: widgetId, bookingId } = await params;

  const authResult = await authenticateRequest(request);
  if ('error' in authResult) return authResult.error;
  const { member, account } = authResult.ctx;

  // Require owner/admin
  const roleError = requireRole(member, ['owner', 'admin']);
  if (roleError) return roleError;

  // Parse body
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Validation failed', details: parsed.error.flatten().fieldErrors },
      { status: 400 }
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

  // Fetch booking
  const { data: booking, error: bookingError } = await admin
    .from('bookings')
    .select('id, status, widget_id')
    .eq('id', bookingId)
    .eq('widget_id', widgetId)
    .single();

  if (bookingError || !booking) {
    return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
  }

  // Validate status transition
  const validTransitions: Record<string, string[]> = {
    confirmed: ['completed', 'no_show', 'cancelled'],
    completed: [],
    no_show: [],
    cancelled: [],
  };

  const allowed = validTransitions[booking.status] ?? [];
  if (!allowed.includes(parsed.data.status)) {
    return NextResponse.json(
      { error: `Cannot change status from ${booking.status} to ${parsed.data.status}` },
      { status: 400 }
    );
  }

  // Build update
  const updateFields: Record<string, unknown> = {
    status: parsed.data.status,
  };

  if (parsed.data.status === 'cancelled') {
    updateFields.cancelled_at = new Date().toISOString();
  }

  const { data: updated, error: updateError } = await admin
    .from('bookings')
    .update(updateFields)
    .eq('id', bookingId)
    .select('*')
    .single();

  if (updateError || !updated) {
    return NextResponse.json({ error: 'Failed to update booking' }, { status: 500 });
  }

  // Update analytics
  const today = new Date().toISOString().split('T')[0]!;
  void Promise.resolve(
    (async () => {
      const analyticsField =
        parsed.data.status === 'completed' ? 'bookings_completed' :
        parsed.data.status === 'no_show' ? 'bookings_no_show' :
        parsed.data.status === 'cancelled' ? 'bookings_cancelled' : null;

      if (!analyticsField) return;

      const { data: existingAnalytics } = await admin
        .from('widget_analytics')
        .select('id, bookings_completed, bookings_no_show, bookings_cancelled')
        .eq('widget_id', widgetId)
        .eq('date', today)
        .maybeSingle();

      if (existingAnalytics) {
        const currentValue = existingAnalytics[analyticsField] ?? 0;
        await admin
          .from('widget_analytics')
          .update({ [analyticsField]: currentValue + 1 })
          .eq('id', existingAnalytics.id);
      } else {
        await admin.from('widget_analytics').insert({
          widget_id: widgetId,
          account_id: account.id,
          date: today,
          [analyticsField]: 1,
        });
      }
    })()
  ).catch((err: unknown) => {
    console.error('[bookings] Analytics update failed:', err instanceof Error ? err.message : String(err));
  });

  return NextResponse.json({ booking: updated });
}
