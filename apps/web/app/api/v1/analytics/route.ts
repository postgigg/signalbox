import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createAdminClient } from '@/lib/supabase/admin';
import { authenticateRequest } from '@/lib/auth';

export const runtime = 'nodejs';

const querySchema = z.object({
  widget_id: z.string().uuid().optional(),
  from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().default(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)),
  to: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().default(new Date().toISOString().slice(0, 10)),
  granularity: z.enum(['day', 'week', 'month']).default('day'),
}).strict();

interface TimeSeriesEntry {
  date: string;
  impressions: number;
  opens: number;
  completions: number;
  submissions: number;
  hotCount: number;
  warmCount: number;
  coldCount: number;
  avgScore: number | null;
}

function getWeekKey(dateStr: string): string {
  const d = new Date(dateStr);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Monday start
  const monday = new Date(d.setDate(diff));
  return monday.toISOString().split('T')[0]!;
}

function getMonthKey(dateStr: string): string {
  return dateStr.slice(0, 7);
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
    widget_id: widgetId,
    from: fromDate,
    to: toDate,
    granularity,
  } = parsed.data;

  const admin = createAdminClient();

  let query = admin
    .from('widget_analytics')
    .select('*')
    .eq('account_id', account.id)
    .gte('date', fromDate)
    .lte('date', toDate)
    .order('date', { ascending: true });

  if (widgetId) {
    query = query.eq('widget_id', widgetId);
  }

  const { data: rows, error } = await query;

  if (error) {
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 },
    );
  }

  const analytics = rows ?? [];

  // Aggregate totals
  let totalImpressions = 0;
  let totalOpens = 0;
  let totalCompletions = 0;
  let totalSubmissions = 0;
  let totalHot = 0;
  let totalWarm = 0;
  let totalCold = 0;
  let scoreSum = 0;
  let scoreCount = 0;

  for (const row of analytics) {
    totalImpressions += row.impressions;
    totalOpens += row.opens;
    totalCompletions += row.completions;
    totalSubmissions += row.submissions;
    totalHot += row.hot_count;
    totalWarm += row.warm_count;
    totalCold += row.cold_count;
    if (row.avg_score !== null && row.submissions > 0) {
      scoreSum += row.avg_score * row.submissions;
      scoreCount += row.submissions;
    }
  }

  const avgScore = scoreCount > 0 ? Math.round(scoreSum / scoreCount) : null;

  // Build time series with correct granularity
  const buckets = new Map<string, TimeSeriesEntry>();

  for (const row of analytics) {
    let key: string;
    switch (granularity) {
      case 'week':
        key = getWeekKey(row.date);
        break;
      case 'month':
        key = getMonthKey(row.date);
        break;
      default:
        key = row.date;
    }

    const existing = buckets.get(key);
    if (existing) {
      existing.impressions += row.impressions;
      existing.opens += row.opens;
      existing.completions += row.completions;
      existing.submissions += row.submissions;
      existing.hotCount += row.hot_count;
      existing.warmCount += row.warm_count;
      existing.coldCount += row.cold_count;
      if (row.avg_score !== null && row.submissions > 0) {
        const prevTotal =
          existing.avgScore !== null
            ? existing.avgScore * (existing.submissions - row.submissions)
            : 0;
        existing.avgScore = Math.round(
          (prevTotal + row.avg_score * row.submissions) / existing.submissions,
        );
      }
    } else {
      buckets.set(key, {
        date: key,
        impressions: row.impressions,
        opens: row.opens,
        completions: row.completions,
        submissions: row.submissions,
        hotCount: row.hot_count,
        warmCount: row.warm_count,
        coldCount: row.cold_count,
        avgScore: row.avg_score,
      });
    }
  }

  const timeSeries = Array.from(buckets.values());

  // Conversion funnel
  const funnel = {
    impressions: totalImpressions,
    opens: totalOpens,
    completions: totalCompletions,
    submissions: totalSubmissions,
    openRate:
      totalImpressions > 0
        ? Math.round((totalOpens / totalImpressions) * 10000) / 100
        : 0,
    completionRate:
      totalOpens > 0
        ? Math.round((totalCompletions / totalOpens) * 10000) / 100
        : 0,
    submissionRate:
      totalCompletions > 0
        ? Math.round((totalSubmissions / totalCompletions) * 10000) / 100
        : 0,
    overallConversion:
      totalImpressions > 0
        ? Math.round((totalSubmissions / totalImpressions) * 10000) / 100
        : 0,
  };

  return NextResponse.json({
    data: {
      summary: {
        impressions: totalImpressions,
        opens: totalOpens,
        completions: totalCompletions,
        submissions: totalSubmissions,
        submissionsByTier: {
          hot: totalHot,
          warm: totalWarm,
          cold: totalCold,
        },
        avgScore,
      },
      funnel,
      timeSeries,
    },
  });
}
