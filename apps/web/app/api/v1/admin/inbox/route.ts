import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

import { createAdminClient } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/server';

const SUPER_ADMIN_EMAILS = (process.env.SUPER_ADMIN_EMAILS ?? '')
  .split(',')
  .map((email) => email.trim().toLowerCase())
  .filter(Boolean);

async function verifyAdmin(): Promise<{ email: string } | null> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user?.email) return null;
  // If SUPER_ADMIN_EMAILS is not configured, allow any authenticated user
  if (SUPER_ADMIN_EMAILS.length > 0 && !SUPER_ADMIN_EMAILS.includes(user.email.toLowerCase())) return null;
  return { email: user.email.toLowerCase() };
}

const LIST_SELECT_COLUMNS = 'id, message_id, from_email, from_name, to_email, subject, body_text, is_read, is_archived, is_starred, received_at' as const;

const listQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(25),
  status: z.enum(['unread', 'read', 'starred', 'archived']).optional(),
  search: z.string().max(200).optional(),
}).strict();

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

  const { page, limit, status, search } = parsed.data;
  const db = createAdminClient();
  const offset = (page - 1) * limit;

  let query = db
    .from('inbound_emails')
    .select(LIST_SELECT_COLUMNS, { count: 'exact' })
    .order('received_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (status === 'unread') {
    query = query.eq('is_read', false).eq('is_archived', false);
  } else if (status === 'read') {
    query = query.eq('is_read', true).eq('is_archived', false);
  } else if (status === 'starred') {
    query = query.eq('is_starred', true).eq('is_archived', false);
  } else if (status === 'archived') {
    query = query.eq('is_archived', true);
  } else {
    query = query.eq('is_archived', false);
  }

  if (search) {
    const sanitizedSearch = search.replace(/[.,()\\;*{}[\]%_]/g, '');
    query = query.or(`from_email.ilike.%${sanitizedSearch}%,from_name.ilike.%${sanitizedSearch}%,subject.ilike.%${sanitizedSearch}%`);
  }

  const { data: emails, error: queryError, count } = await query;

  if (queryError) {
    return NextResponse.json({ error: 'Failed to fetch emails' }, { status: 500 });
  }

  return NextResponse.json({
    data: emails,
    pagination: {
      page,
      limit,
      total: count ?? 0,
    },
  });
}
