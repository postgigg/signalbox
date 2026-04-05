import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createAdminClient } from '@/lib/supabase/admin';
import { authenticateRequest } from '@/lib/auth';
import { PAGINATION_DEFAULT_PAGE_SIZE, PAGINATION_MAX_PAGE_SIZE } from '@/lib/constants';

export const runtime = 'nodejs';

const querySchema = z.object({
  status: z.enum(['confirmed', 'cancelled', 'completed', 'no_show']).optional(),
  page: z.coerce.number().int().min(1).optional(),
  pageSize: z.coerce.number().int().min(1).max(PAGINATION_MAX_PAGE_SIZE).optional(),
  filter: z.enum(['upcoming', 'past', 'cancelled']).optional(),
});

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse> {
  const { id: widgetId } = await params;

  const authResult = await authenticateRequest(request);
  if ('error' in authResult) return authResult.error;
  const { account } = authResult.ctx;

  const url = new URL(request.url);
  const parsed = querySchema.safeParse({
    status: url.searchParams.get('status') ?? undefined,
    page: url.searchParams.get('page') ?? undefined,
    pageSize: url.searchParams.get('pageSize') ?? undefined,
    filter: url.searchParams.get('filter') ?? undefined,
  });

  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid query parameters', details: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  const page = parsed.data.page ?? 1;
  const pageSize = parsed.data.pageSize ?? PAGINATION_DEFAULT_PAGE_SIZE;
  const offset = (page - 1) * pageSize;
  const now = new Date().toISOString();

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

  let query = admin
    .from('bookings')
    .select('*', { count: 'exact' })
    .eq('widget_id', widgetId);

  // Apply filters
  if (parsed.data.status) {
    query = query.eq('status', parsed.data.status);
  }

  if (parsed.data.filter === 'upcoming') {
    query = query.eq('status', 'confirmed').gte('starts_at', now);
  } else if (parsed.data.filter === 'past') {
    query = query.in('status', ['completed', 'no_show']).lt('starts_at', now);
  } else if (parsed.data.filter === 'cancelled') {
    query = query.eq('status', 'cancelled');
  }

  query = query
    .order('starts_at', { ascending: true })
    .range(offset, offset + pageSize - 1);

  const { data: bookings, error, count } = await query;

  if (error) {
    return NextResponse.json({ error: 'Failed to fetch bookings' }, { status: 500 });
  }

  return NextResponse.json({
    bookings: bookings ?? [],
    total: count ?? 0,
    page,
    pageSize,
  });
}
