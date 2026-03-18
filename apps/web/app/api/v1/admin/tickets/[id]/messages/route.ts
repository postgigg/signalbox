import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

import { createAdminClient } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/server';
import { logAdminAction } from '@/lib/audit';
import { stripHtml } from '@/lib/sanitize';

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

const createMessageSchema = z.object({
  body: z.string().min(1).max(5000).transform(stripHtml),
  is_internal_note: z.boolean().default(false),
});

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

  const { data: ticket } = await db
    .from('support_tickets')
    .select('id')
    .eq('id', idParsed.data)
    .single();

  if (!ticket) {
    return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
  }

  const { data: messages, error } = await db
    .from('ticket_messages')
    .select('*')
    .eq('ticket_id', idParsed.data)
    .order('created_at', { ascending: true });

  if (error) {
    return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 });
  }

  return NextResponse.json({ data: messages });
}

export async function POST(
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
  const parsed = createMessageSchema.safeParse(rawBody);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Validation failed', details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const db = createAdminClient();

  const { data: ticket } = await db
    .from('support_tickets')
    .select('id')
    .eq('id', idParsed.data)
    .single();

  if (!ticket) {
    return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
  }

  const { data: message, error: insertError } = await db
    .from('ticket_messages')
    .insert({
      ticket_id: idParsed.data,
      sender_type: 'admin',
      sender_email: admin.email,
      body: parsed.data.body,
      is_internal_note: parsed.data.is_internal_note,
    })
    .select()
    .single();

  if (insertError || !message) {
    return NextResponse.json({ error: 'Failed to create message' }, { status: 500 });
  }

  if (!parsed.data.is_internal_note) {
    await db
      .from('support_tickets')
      .update({ status: 'pending' })
      .eq('id', idParsed.data)
      .eq('status', 'open');
  }

  logAdminAction({
    admin_email: admin.email,
    action: parsed.data.is_internal_note ? 'add_internal_note' : 'reply_to_ticket',
    target_type: 'support_ticket',
    target_id: idParsed.data,
  });

  return NextResponse.json({ data: message }, { status: 201 });
}
