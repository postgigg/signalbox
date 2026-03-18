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

const listQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  status: z.enum(['open', 'pending', 'resolved', 'closed']).optional(),
  priority: z.enum(['low', 'normal', 'high', 'urgent']).optional(),
  category: z.enum(['billing', 'technical', 'general', 'bug', 'feature_request']).optional(),
  search: z.string().max(200).optional(),
}).strict();

const createTicketSchema = z.object({
  requester_email: z.string().email().max(320).toLowerCase(),
  requester_name: z.string().min(1).max(200).transform(stripHtml),
  subject: z.string().min(1).max(300).transform(stripHtml),
  priority: z.enum(['low', 'normal', 'high', 'urgent']).default('normal'),
  category: z.enum(['billing', 'technical', 'general', 'bug', 'feature_request']).default('general'),
  account_id: z.string().uuid().optional(),
  body: z.string().min(1).max(5000).transform(stripHtml),
});

export async function GET(request: NextRequest): Promise<NextResponse> {
  const admin = await verifyAdmin();
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const searchParams = Object.fromEntries(request.nextUrl.searchParams);
  const parsed = listQuerySchema.safeParse(searchParams);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid query parameters', details: parsed.error.flatten().fieldErrors },
      { status: 400 },
    );
  }

  const { page, limit, status, priority, category, search } = parsed.data;
  const db = createAdminClient();
  const offset = (page - 1) * limit;

  let query = db
    .from('support_tickets')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (status) {
    query = query.eq('status', status);
  }
  if (priority) {
    query = query.eq('priority', priority);
  }
  if (category) {
    query = query.eq('category', category);
  }
  if (search) {
    query = query.or(`subject.ilike.%${search}%,requester_email.ilike.%${search}%`);
  }

  const { data: tickets, error: queryError, count } = await query;

  if (queryError) {
    return NextResponse.json({ error: 'Failed to fetch tickets' }, { status: 500 });
  }

  return NextResponse.json({
    data: tickets,
    pagination: {
      page,
      limit,
      total: count ?? 0,
      totalPages: count ? Math.ceil(count / limit) : 0,
    },
  });
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  const admin = await verifyAdmin();
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const rawBody: unknown = await request.json().catch(() => null);
  const parsed = createTicketSchema.safeParse(rawBody);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Validation failed', details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const { body, ...ticketData } = parsed.data;
  const db = createAdminClient();

  const { data: ticket, error: insertError } = await db
    .from('support_tickets')
    .insert({
      requester_email: ticketData.requester_email,
      requester_name: ticketData.requester_name,
      subject: ticketData.subject,
      priority: ticketData.priority,
      category: ticketData.category,
      account_id: ticketData.account_id ?? null,
      assigned_to: admin.email,
    })
    .select()
    .single();

  if (insertError || !ticket) {
    return NextResponse.json({ error: 'Failed to create ticket' }, { status: 500 });
  }

  const { error: messageError } = await db
    .from('ticket_messages')
    .insert({
      ticket_id: ticket.id,
      sender_type: 'customer',
      sender_email: ticketData.requester_email,
      body,
      is_internal_note: false,
    });

  if (messageError) {
    return NextResponse.json({ error: 'Ticket created but initial message failed' }, { status: 500 });
  }

  logAdminAction({
    admin_email: admin.email,
    action: 'create_ticket',
    target_type: 'support_ticket',
    target_id: ticket.id,
    details: { subject: ticketData.subject, priority: ticketData.priority, category: ticketData.category },
  });

  return NextResponse.json({ data: ticket }, { status: 201 });
}
