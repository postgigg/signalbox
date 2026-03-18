import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createAdminClient } from '@/lib/supabase/admin';
import { authenticateRequest } from '@/lib/auth';

export const runtime = 'nodejs';

const querySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  sort: z
    .enum(['created_at', 'lead_score', 'status'])
    .default('created_at'),
  order: z.enum(['asc', 'desc']).default('desc'),
  tier: z.enum(['hot', 'warm', 'cold']).optional(),
  status: z
    .enum([
      'new',
      'viewed',
      'contacted',
      'qualified',
      'disqualified',
      'converted',
      'archived',
    ])
    .optional(),
  widget_id: z.string().uuid().optional(),
  search: z.string().max(200).optional(),
  from: z.string().datetime({ offset: true }).optional(),
  to: z.string().datetime({ offset: true }).optional(),
}).strict();

export async function GET(request: NextRequest): Promise<NextResponse> {
  const authResult = await authenticateRequest(request);
  if ('error' in authResult) return authResult.error;
  const { account } = authResult.ctx;

  // Parse query params
  const searchParams = Object.fromEntries(request.nextUrl.searchParams);
  const parsed = querySchema.safeParse(searchParams);

  if (!parsed.success) {
    return NextResponse.json(
      {
        error: 'Invalid query parameters',
        details: parsed.error.flatten().fieldErrors,
      },
      { status: 400 },
    );
  }

  const {
    page,
    limit,
    sort,
    order,
    tier,
    status,
    widget_id: widgetId,
    search,
    from: fromDate,
    to: toDate,
  } = parsed.data;

  const admin = createAdminClient();

  let query = admin
    .from('submissions')
    .select('*', { count: 'exact' })
    .eq('account_id', account.id);

  if (tier) {
    query = query.eq('lead_tier', tier);
  }

  if (status) {
    query = query.eq('status', status);
  }

  if (widgetId) {
    query = query.eq('widget_id', widgetId);
  }

  if (search) {
    query = query.or(
      `visitor_name.ilike.%${search}%,visitor_email.ilike.%${search}%`,
    );
  }

  if (fromDate) {
    query = query.gte('created_at', fromDate);
  }

  if (toDate) {
    query = query.lte('created_at', toDate);
  }

  const offset = (page - 1) * limit;

  query = query
    .order(sort, { ascending: order === 'asc' })
    .range(offset, offset + limit - 1);

  const { data: leads, error: queryError, count } = await query;

  if (queryError) {
    return NextResponse.json(
      { error: 'Failed to fetch leads' },
      { status: 500 },
    );
  }

  return NextResponse.json({
    data: leads,
    pagination: {
      page,
      limit,
      total: count ?? 0,
      totalPages: count ? Math.ceil(count / limit) : 0,
    },
  });
}
