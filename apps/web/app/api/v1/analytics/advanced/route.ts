import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createAdminClient } from '@/lib/supabase/admin';
import { authenticateRequest } from '@/lib/auth';
import { getPlanLimits } from '@/lib/plan-limits';

export const runtime = 'nodejs';

const querySchema = z.object({
  from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  to: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  widget_id: z.string().uuid().optional(),
});

export async function GET(
  request: NextRequest,
): Promise<NextResponse> {
  const authResult = await authenticateRequest(request);
  if ('error' in authResult) return authResult.error;
  const { account } = authResult.ctx;

  const limits = getPlanLimits(account.plan);
  if (!limits.advancedAnalytics) {
    return NextResponse.json(
      { error: 'Advanced analytics is not available on your current plan' },
      { status: 403 },
    );
  }

  const searchParams = Object.fromEntries(request.nextUrl.searchParams.entries());
  const parsed = querySchema.safeParse(searchParams);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Validation failed', details: parsed.error.flatten().fieldErrors },
      { status: 400 },
    );
  }

  const defaultFrom = new Date();
  defaultFrom.setDate(defaultFrom.getDate() - 30);
  const fromDate = parsed.data.from ?? defaultFrom.toISOString().split('T')[0]!;
  const toDate = parsed.data.to ?? new Date().toISOString().split('T')[0]!;

  const admin = createAdminClient();

  // Source breakdown
  let sourceQuery = admin
    .from('submissions')
    .select('utm_source')
    .eq('account_id', account.id)
    .gte('created_at', `${fromDate}T00:00:00Z`)
    .lte('created_at', `${toDate}T23:59:59Z`);

  if (parsed.data.widget_id) {
    sourceQuery = sourceQuery.eq('widget_id', parsed.data.widget_id);
  }

  const { data: sourceData } = await sourceQuery;

  const sourceCounts: Record<string, number> = {};
  if (sourceData) {
    for (const row of sourceData) {
      const source = (row.utm_source as string | null) ?? 'direct';
      sourceCounts[source] = (sourceCounts[source] ?? 0) + 1;
    }
  }

  const sourceBreakdown = Object.entries(sourceCounts)
    .map(([source, count]) => ({ source, count }))
    .sort((a, b) => b.count - a.count);

  // Device breakdown
  let deviceQuery = admin
    .from('submissions')
    .select('device_type')
    .eq('account_id', account.id)
    .gte('created_at', `${fromDate}T00:00:00Z`)
    .lte('created_at', `${toDate}T23:59:59Z`);

  if (parsed.data.widget_id) {
    deviceQuery = deviceQuery.eq('widget_id', parsed.data.widget_id);
  }

  const { data: deviceData } = await deviceQuery;

  const deviceCounts: Record<string, number> = {};
  if (deviceData) {
    for (const row of deviceData) {
      const device = (row.device_type as string | null) ?? 'unknown';
      deviceCounts[device] = (deviceCounts[device] ?? 0) + 1;
    }
  }

  const deviceBreakdown = Object.entries(deviceCounts)
    .map(([device, count]) => ({ device, count }))
    .sort((a, b) => b.count - a.count);

  // Country breakdown
  let countryQuery = admin
    .from('submissions')
    .select('country')
    .eq('account_id', account.id)
    .gte('created_at', `${fromDate}T00:00:00Z`)
    .lte('created_at', `${toDate}T23:59:59Z`);

  if (parsed.data.widget_id) {
    countryQuery = countryQuery.eq('widget_id', parsed.data.widget_id);
  }

  const { data: countryData } = await countryQuery;

  const countryCounts: Record<string, number> = {};
  if (countryData) {
    for (const row of countryData) {
      const country = (row.country as string | null) ?? 'Unknown';
      countryCounts[country] = (countryCounts[country] ?? 0) + 1;
    }
  }

  const countryBreakdown = Object.entries(countryCounts)
    .map(([country, count]) => ({ country, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  // Step dropoff from widget_analytics
  let stepQuery = admin
    .from('widget_analytics')
    .select('step_1_views, step_2_views, step_3_views, step_4_views, step_5_views')
    .eq('account_id', account.id)
    .gte('date', fromDate)
    .lte('date', toDate);

  if (parsed.data.widget_id) {
    stepQuery = stepQuery.eq('widget_id', parsed.data.widget_id);
  }

  const { data: stepData } = await stepQuery;

  let step1 = 0, step2 = 0, step3 = 0, step4 = 0, step5 = 0;
  if (stepData) {
    for (const row of stepData) {
      step1 += row.step_1_views;
      step2 += row.step_2_views;
      step3 += row.step_3_views;
      step4 += row.step_4_views;
      step5 += row.step_5_views;
    }
  }
  const stepDropoff = [step1, step2, step3, step4, step5];

  return NextResponse.json({
    data: {
      sourceBreakdown,
      deviceBreakdown,
      countryBreakdown,
      stepDropoff: stepDropoff.map((views, i) => ({
        step: i + 1,
        views,
      })),
    },
  });
}
