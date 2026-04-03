import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createAdminClient } from '@/lib/supabase/admin';
import { authenticateRequest } from '@/lib/auth';

export const runtime = 'nodejs';

const MAX_EXPORT_ROWS = 10000;

const querySchema = z.object({
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

function escapeCsvField(value: string): string {
  if (value.includes('"') || value.includes(',') || value.includes('\n') || value.includes('\r')) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  const authResult = await authenticateRequest(request);
  if ('error' in authResult) return authResult.error;
  const { account } = authResult.ctx;

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
    tier,
    status,
    widget_id: widgetId,
    search,
    from: fromDate,
    to: toDate,
  } = parsed.data;

  const admin = createAdminClient();

  // Fetch widget names for the account to map widget_id -> name
  const { data: widgets } = await admin
    .from('widgets')
    .select('id, name')
    .eq('account_id', account.id);

  const widgetNameMap = new Map<string, string>();
  if (widgets) {
    for (const w of widgets) {
      widgetNameMap.set(w.id, w.name);
    }
  }

  let query = admin
    .from('submissions')
    .select('visitor_name, visitor_email, visitor_phone, lead_score, lead_tier, status, widget_id, source_url, utm_source, utm_medium, utm_campaign, country, device_type, created_at')
    .eq('account_id', account.id)
    .order('created_at', { ascending: false })
    .limit(MAX_EXPORT_ROWS);

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
    const sanitized = search.replace(/[.,()\\;*{}[\]%_]/g, '');
    query = query.or(
      `visitor_name.ilike.%${sanitized}%,visitor_email.ilike.%${sanitized}%`,
    );
  }

  if (fromDate) {
    query = query.gte('created_at', fromDate);
  }

  if (toDate) {
    query = query.lte('created_at', toDate);
  }

  const { data: leads, error: queryError } = await query;

  if (queryError) {
    return NextResponse.json(
      { error: 'Failed to fetch leads' },
      { status: 500 },
    );
  }

  const CSV_HEADERS = [
    'Name',
    'Email',
    'Phone',
    'Score',
    'Tier',
    'Status',
    'Widget',
    'Source',
    'UTM Source',
    'UTM Medium',
    'UTM Campaign',
    'Country',
    'Device',
    'Submitted At',
  ] as const;

  const rows: string[] = [CSV_HEADERS.map(escapeCsvField).join(',')];

  for (const lead of leads ?? []) {
    const widgetName = widgetNameMap.get(lead.widget_id) ?? '';
    const row = [
      escapeCsvField(lead.visitor_name ?? ''),
      escapeCsvField(lead.visitor_email ?? ''),
      escapeCsvField(lead.visitor_phone ?? ''),
      String(lead.lead_score),
      escapeCsvField(lead.lead_tier),
      escapeCsvField(lead.status),
      escapeCsvField(widgetName),
      escapeCsvField(lead.source_url ?? ''),
      escapeCsvField(lead.utm_source ?? ''),
      escapeCsvField(lead.utm_medium ?? ''),
      escapeCsvField(lead.utm_campaign ?? ''),
      escapeCsvField(lead.country ?? ''),
      escapeCsvField(lead.device_type ?? ''),
      escapeCsvField(lead.created_at),
    ];
    rows.push(row.join(','));
  }

  const csv = rows.join('\r\n');
  const today = new Date().toISOString().split('T')[0];

  return new NextResponse(csv, {
    status: 200,
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename=hawkleads-export-${today}.csv`,
    },
  });
}
