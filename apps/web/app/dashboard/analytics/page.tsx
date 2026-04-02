'use client';

import { useState, useEffect, useCallback } from 'react';

import { ConversionFunnel } from '@/components/dashboard/ConversionFunnel';
import { ConversionRateChart, SubmissionsChart } from '@/components/dashboard/AnalyticsCharts';
import { TierBreakdown } from '@/components/dashboard/TierBreakdown';
import { AdvancedSection } from '@/components/dashboard/AdvancedAnalytics';
import { AnalyticsSkeleton } from '@/components/dashboard/AnalyticsSkeleton';
import { StepFunnel } from '@/components/dashboard/StepFunnel';

import type { AnalyticsData, AdvancedData } from './types';

const DATE_RANGES = [
  { label: '7 days', days: 7 },
  { label: '30 days', days: 30 },
  { label: '90 days', days: 90 },
] as const;

interface WidgetOption {
  id: string;
  name: string;
}

function aggregateData(data: AnalyticsData[]): {
  impressions: number;
  opens: number;
  completions: number;
  submissions: number;
  hot: number;
  warm: number;
  cold: number;
  avgScore: number | null;
} {
  const impressions = data.reduce((s, d) => s + d.impressions, 0);
  const opens = data.reduce((s, d) => s + d.opens, 0);
  const completions = data.reduce((s, d) => s + d.completions, 0);
  const submissions = data.reduce((s, d) => s + d.submissions, 0);
  const hot = data.reduce((s, d) => s + d.hot_count, 0);
  const warm = data.reduce((s, d) => s + d.warm_count, 0);
  const cold = data.reduce((s, d) => s + d.cold_count, 0);

  const scoresWithData = data.filter((d) => d.avg_score !== null);
  const avgScore = scoresWithData.length > 0
    ? scoresWithData.reduce((s, d) => s + (d.avg_score ?? 0), 0) / scoresWithData.length
    : null;

  return { impressions, opens, completions, submissions, hot, warm, cold, avgScore };
}

export default function AnalyticsPage(): React.ReactElement {
  const [dateRange, setDateRange] = useState(30);
  const [data, setData] = useState<AnalyticsData[]>([]);
  const [prevData, setPrevData] = useState<AnalyticsData[]>([]);
  const [loading, setLoading] = useState(true);
  const [accountPlan, setAccountPlan] = useState<string>('trial');
  const [advancedData, setAdvancedData] = useState<AdvancedData | null>(null);
  const [advancedLoading, setAdvancedLoading] = useState(false);
  const [accountId, setAccountId] = useState<string | null>(null);
  const [widgets, setWidgets] = useState<WidgetOption[]>([]);
  const [selectedWidgetId, setSelectedWidgetId] = useState<string>('');

  // Init effect: fetch user, account plan, and widgets list once
  useEffect(() => {
    const init = async (): Promise<void> => {
      try {
        const { createBrowserClient } = await import('@supabase/ssr');
        const supabase = createBrowserClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL ?? '',
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ''
        );

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data: memberData } = await supabase
          .from('members')
          .select('account_id')
          .eq('user_id', user.id)
          .limit(1)
          .single();

        if (!memberData) return;

        const acctId = memberData.account_id as string;

        const [accountResult, widgetsResult] = await Promise.all([
          supabase
            .from('accounts')
            .select('plan')
            .eq('id', acctId)
            .single(),
          supabase
            .from('widgets')
            .select('id, name')
            .eq('account_id', acctId)
            .order('name', { ascending: true }),
        ]);

        if (accountResult.data) {
          setAccountPlan(accountResult.data.plan as string);
        }

        setWidgets((widgetsResult.data as WidgetOption[]) ?? []);
        setAccountId(acctId);
      } catch {
        // Init failed silently
      }
    };
    void init();
  }, []);

  // Analytics effect: refetch when accountId, dateRange, or selectedWidgetId changes
  const fetchAnalytics = useCallback(async (): Promise<void> => {
    if (accountId === null) return;

    setLoading(true);
    try {
      const { createBrowserClient } = await import('@supabase/ssr');
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL ?? '',
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ''
      );

      const now = new Date();
      const fromDate = new Date();
      fromDate.setDate(now.getDate() - dateRange);
      const fromStr = fromDate.toISOString().split('T')[0] ?? '';
      const toStr = now.toISOString().split('T')[0] ?? '';

      const prevFromDate = new Date();
      prevFromDate.setDate(fromDate.getDate() - dateRange);
      const prevFromStr = prevFromDate.toISOString().split('T')[0] ?? '';

      const selectFields = 'date, impressions, opens, completions, submissions, hot_count, warm_count, cold_count, avg_score, step_1_views, step_2_views, step_3_views, step_4_views, step_5_views, step_1_abandons, step_2_abandons, step_3_abandons, step_4_abandons, step_5_abandons';

      let currentQuery = supabase
        .from('widget_analytics')
        .select(selectFields)
        .eq('account_id', accountId)
        .gte('date', fromStr)
        .order('date', { ascending: true });

      let prevQuery = supabase
        .from('widget_analytics')
        .select(selectFields)
        .eq('account_id', accountId)
        .gte('date', prevFromStr)
        .lt('date', fromStr)
        .order('date', { ascending: true });

      if (selectedWidgetId !== '') {
        currentQuery = currentQuery.eq('widget_id', selectedWidgetId);
        prevQuery = prevQuery.eq('widget_id', selectedWidgetId);
      }

      const [currentResult, prevResult] = await Promise.all([currentQuery, prevQuery]);

      setData((currentResult.data as AnalyticsData[]) ?? []);
      setPrevData((prevResult.data as AnalyticsData[]) ?? []);

      // Fetch advanced analytics for Pro/Agency
      if (accountPlan === 'pro' || accountPlan === 'agency') {
        setAdvancedLoading(true);
        try {
          const widgetParam = selectedWidgetId !== '' ? `&widget_id=${selectedWidgetId}` : '';
          const advResponse = await fetch(`/api/v1/analytics/advanced?from=${fromStr}&to=${toStr}${widgetParam}`);
          if (advResponse.ok) {
            const advJson = await advResponse.json() as { data: AdvancedData };
            setAdvancedData(advJson.data);
          }
        } catch {
          // Advanced analytics fetch failed silently
        } finally {
          setAdvancedLoading(false);
        }
      }
    } catch {
      // Error fetching analytics
    } finally {
      setLoading(false);
    }
  }, [accountId, dateRange, selectedWidgetId, accountPlan]);

  useEffect(() => {
    void fetchAnalytics();
  }, [fetchAnalytics]);

  const current = aggregateData(data);
  const previous = aggregateData(prevData);
  const hasAdvancedAccess = accountPlan === 'pro' || accountPlan === 'agency';

  const funnelSteps = [
    { label: 'Impressions', value: current.impressions, previousValue: previous.impressions },
    { label: 'Opens', value: current.opens, previousValue: previous.opens },
    { label: 'Completions', value: current.completions, previousValue: previous.completions },
    { label: 'Submissions', value: current.submissions, previousValue: previous.submissions },
  ] as const;

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="page-heading">Analytics</h1>
        <div className="flex items-center gap-3">
          {widgets.length > 0 && (
            <select
              value={selectedWidgetId}
              onChange={(e) => setSelectedWidgetId(e.target.value)}
              className="input-field h-8 w-auto min-w-[160px] text-sm"
              aria-label="Filter by widget"
            >
              <option value="">All Widgets</option>
              {widgets.map((w) => (
                <option key={w.id} value={w.id}>{w.name}</option>
              ))}
            </select>
          )}
          <div className="flex gap-1">
            {DATE_RANGES.map((range) => (
              <button
                key={range.days}
                type="button"
                onClick={() => setDateRange(range.days)}
                className={`px-3 py-1.5 rounded-sm text-xs font-body transition-colors duration-fast ${
                  dateRange === range.days
                    ? 'bg-ink text-white'
                    : 'bg-surface border border-border text-stone hover:text-ink'
                }`}
              >
                {range.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {loading ? (
        <AnalyticsSkeleton />
      ) : (
        <>
          <div className="mt-6">
            <h2 className="font-display text-lg font-semibold text-ink mb-4">Conversion Funnel</h2>
            {data.length === 0 ? (
              <div className="card text-center py-8">
                <p className="text-sm text-stone">No funnel data available for this period.</p>
              </div>
            ) : (
              <ConversionFunnel steps={funnelSteps} avgScore={current.avgScore} />
            )}
          </div>

          <div className="mt-8">
            <h2 className="font-display text-lg font-semibold text-ink mb-4">Question Funnel</h2>
            <StepFunnel
              steps={[1, 2, 3, 4, 5].map((n) => ({
                label: `Step ${n}`,
                views: data.reduce((s, d) => s + (d[`step_${n}_views` as keyof AnalyticsData] as number), 0),
                abandons: data.reduce((s, d) => s + (d[`step_${n}_abandons` as keyof AnalyticsData] as number), 0),
              })).filter((s) => s.views > 0)}
            />
          </div>

          <div className="mt-8">
            <h2 className="font-display text-lg font-semibold text-ink mb-4">Conversion Rate Over Time</h2>
            <ConversionRateChart data={data} />
          </div>

          <div className="mt-8">
            <h2 className="font-display text-lg font-semibold text-ink mb-4">Submissions Over Time</h2>
            <SubmissionsChart data={data} />
          </div>

          <div className="mt-8">
            <h2 className="font-display text-lg font-semibold text-ink mb-4">Tier Breakdown</h2>
            <TierBreakdown
              hot={current.hot}
              warm={current.warm}
              cold={current.cold}
              total={current.submissions}
              prevHot={previous.hot}
              prevWarm={previous.warm}
              prevCold={previous.cold}
            />
          </div>

          <div className="mt-10">
            <h2 className="font-display text-lg font-semibold text-ink mb-4">Advanced Analytics</h2>
            <AdvancedSection
              hasAccess={hasAdvancedAccess}
              loading={advancedLoading}
              data={advancedData}
            />
          </div>
        </>
      )}
    </div>
  );
}
