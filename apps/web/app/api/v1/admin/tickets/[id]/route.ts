import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

import { createAdminClient } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/server';
import { logAdminAction } from '@/lib/audit';

const SUPER_ADMIN_EMAILS = (process.env.SUPER_ADMIN_EMAILS ?? '')
  .split(',')
  .map((email) => email.trim().toLowerCase())
  .filter(Boolean);

async function verifyAdmin(): Promise<{ email: string } | null> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user?.email) return null;
  if (!SUPER_ADMIN_EMAILS.includes(user.email.toLowerCase())) return null;
  return { email: user.email.toLowerCase() };
}

const updateTicketSchema = z.object({
  status: z.enum(['open', 'pending', 'resolved', 'closed']).optional(),
  priority: z.enum(['low', 'normal', 'high', 'urgent']).optional(),
  assigned_to: z.string().email().max(320).nullable().optional(),
  account_id: z.string().uuid().nullable().optional(),
  category: z.enum(['billing', 'technical', 'general', 'bug', 'feature_request']).optional(),
}).strict();

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(
  _request: NextRequest,
  context: RouteParams,
): Promise<NextResponse> {
  const admin = await verifyAdmin();
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await context.params;
  const idParsed = z.string().uuid().safeParse(id);
  if (!idParsed.success) {
    return NextResponse.json({ error: 'Invalid ticket ID' }, { status: 400 });
  }

  const db = createAdminClient();
  const { data: ticket, error } = await db
    .from('support_tickets')
    .select('*')
    .eq('id', idParsed.data)
    .single();

  if (error || !ticket) {
    return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
  }

  return NextResponse.json({ data: ticket });
}

export async function PATCH(
  request: NextRequest,
  context: RouteParams,
): Promise<NextResponse> {
  const admin = await verifyAdmin();
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await context.params;
  const idParsed = z.string().uuid().safeParse(id);
  if (!idParsed.success) {
    return NextResponse.json({ error: 'Invalid ticket ID' }, { status: 400 });
  }

  const rawBody: unknown = await request.json().catch(() => null);
  const parsed = updateTicketSchema.safeParse(rawBody);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Validation failed', details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const updates: Record<string, unknown> = { ...parsed.data };

  if (parsed.data.status === 'resolved') {
    updates.resolved_at = new Date().toISOString();
  } else if (parsed.data.status === 'open' || parsed.data.status === 'pending') {
    updates.resolved_at = null;
  }

  const db = createAdminClient();
  const { data: ticket, error } = await db
    .from('support_tickets')
    .update(updates)
    .eq('id', idParsed.data)
    .select()
    .single();

  if (error || !ticket) {
    return NextResponse.json({ error: 'Failed to update ticket' }, { status: 500 });
  }

  logAdminAction({
    admin_email: admin.email,
    action: 'update_ticket',
    target_type: 'support_ticket',
    target_id: idParsed.data,
    details: parsed.data as Record<string, unknown>,
  });

  return NextResponse.json({ data: ticket });
}
