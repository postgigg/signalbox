'use client';

import { useState, useEffect, useCallback } from 'react';

interface AnalyticsData {
  date: string;
  impressions: number;
  opens: number;
  completions: number;
  submissions: number;
  hot_count: number;
  warm_count: number;
  cold_count: number;
  avg_score: number | null;
}

const DATE_RANGES = [
  { label: '7 days', days: 7 },
  { label: '30 days', days: 30 },
  { label: '90 days', days: 90 },
] as const;

export default function AnalyticsPage(): React.ReactElement {
  const [dateRange, setDateRange] = useState(30);
  const [data, setData] = useState<AnalyticsData[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = useCallback(async (): Promise<void> => {
    setLoading(true);
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

      const fromDate = new Date();
      fromDate.setDate(fromDate.getDate() - dateRange);

      const { data: analyticsData } = await supabase
        .from('widget_analytics')
        .select('date, impressions, opens, completions, submissions, hot_count, warm_count, cold_count, avg_score')
        .eq('account_id', memberData.account_id)
        .gte('date', fromDate.toISOString().split('T')[0] ?? '')
        .order('date', { ascending: true });

      setData((analyticsData as AnalyticsData[]) ?? []);
    } catch {
      // Error fetching analytics
    } finally {
      setLoading(false);
    }
  }, [dateRange]);

  useEffect(() => {
    void fetchAnalytics();
  }, [fetchAnalytics]);

  const totalSubmissions = data.reduce((sum, d) => sum + d.submissions, 0);
  const totalHot = data.reduce((sum, d) => sum + d.hot_count, 0);
  const totalWarm = data.reduce((sum, d) => sum + d.warm_count, 0);
  const totalCold = data.reduce((sum, d) => sum + d.cold_count, 0);
  const totalOpens = data.reduce((sum, d) => sum + d.opens, 0);
  const conversionRate = totalOpens > 0 ? ((totalSubmissions / totalOpens) * 100).toFixed(1) : '0';

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="page-heading">Analytics</h1>
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

      {loading ? (
        <div>
          {/* Stat cards skeleton */}
          <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="card">
                <div className="skeleton h-4 w-24 mb-2" />
                <div className="skeleton h-8 w-16" />
              </div>
            ))}
          </div>
          {/* Funnel skeleton */}
          <div className="mt-8">
            <div className="skeleton h-6 w-36 mb-4" />
            <div className="card">
              <div className="space-y-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="skeleton h-3 w-24 flex-shrink-0" />
                    <div className="flex-1 skeleton h-6 rounded-sm" style={{ width: `${80 - i * 15}%` }} />
                    <div className="skeleton h-3 w-10" />
                  </div>
                ))}
              </div>
            </div>
          </div>
          {/* Chart skeleton */}
          <div className="mt-8">
            <div className="skeleton h-6 w-44 mb-4" />
            <div className="card min-h-[240px] flex items-end gap-1 p-5">
              {Array.from({ length: 14 }).map((_, i) => (
                <div
                  key={i}
                  className="flex-1 skeleton rounded-t-sm"
                  style={{ height: `${30 + ((i * 17) % 50)}%` }}
                />
              ))}
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* Stat Cards */}
          <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="card">
              <p className="text-sm text-stone">Submissions</p>
              <p className="mt-1 font-mono text-2xl font-semibold text-ink">{totalSubmissions}</p>
            </div>
            <div className="card">
              <p className="text-sm text-stone">Conversion Rate</p>
              <p className="mt-1 font-mono text-2xl font-semibold text-ink">{conversionRate}%</p>
            </div>
            <div className="card">
              <p className="text-sm text-stone">Widget Opens</p>
              <p className="mt-1 font-mono text-2xl font-semibold text-ink">{totalOpens}</p>
            </div>
            <div className="card">
              <p className="text-sm text-stone">Hot Leads</p>
              <p className="mt-1 font-mono text-2xl font-semibold text-ink">{totalHot}</p>
            </div>
          </div>

          {/* Funnel */}
          <div className="mt-8">
            <h2 className="font-display text-lg font-semibold text-ink mb-4">Conversion Funnel</h2>
            <div className="card">
              {data.length === 0 ? (
                <p className="text-sm text-stone text-center py-6">
                  No funnel data available for this period.
                </p>
              ) : (
                <div className="space-y-3">
                  {[
                    { label: 'Impressions', value: data.reduce((s, d) => s + d.impressions, 0) },
                    { label: 'Opens', value: totalOpens },
                    { label: 'Completions', value: data.reduce((s, d) => s + d.completions, 0) },
                    { label: 'Submissions', value: totalSubmissions },
                  ].map((step) => {
                    const maxVal = data.reduce((s, d) => s + d.impressions, 0);
                    const pct = maxVal > 0 ? (step.value / maxVal) * 100 : 0;
                    return (
                      <div key={step.label} className="flex items-center gap-3">
                        <span className="text-xs text-stone font-body w-24 text-right flex-shrink-0">
                          {step.label}
                        </span>
                        <div className="flex-1 h-6 bg-surface-alt rounded-sm overflow-hidden">
                          <div
                            className="h-full bg-signal rounded-sm transition-all duration-normal"
                            style={{ width: `${String(pct)}%` }}
                          />
                        </div>
                        <span className="text-xs font-mono text-stone w-12 text-right">
                          {step.value}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Submissions Over Time */}
          <div className="mt-8">
            <h2 className="font-display text-lg font-semibold text-ink mb-4">Submissions Over Time</h2>
            <div className="card min-h-[240px]">
              {data.length === 0 ? (
                <div className="flex items-center justify-center h-[200px]">
                  <p className="text-sm text-stone">No data for this period.</p>
                </div>
              ) : (
                <div className="flex items-end gap-1 h-[200px]">
                  {data.map((d) => {
                    const maxSubs = Math.max(...data.map((r) => r.submissions), 1);
                    const height = (d.submissions / maxSubs) * 100;
                    return (
                      <div
                        key={d.date}
                        className="flex-1 bg-signal rounded-t-sm transition-all duration-fast hover:bg-signal-hover"
                        style={{ height: `${String(Math.max(height, 2))}%` }}
                        title={`${d.date}: ${String(d.submissions)} submissions`}
                      />
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Tier Breakdown */}
          <div className="mt-8">
            <h2 className="font-display text-lg font-semibold text-ink mb-4">Tier Breakdown</h2>
            <div className="grid grid-cols-3 gap-4">
              <div className="card text-center">
                <p className="text-xs text-stone uppercase tracking-wide">Hot</p>
                <p className="mt-1 font-mono text-2xl font-semibold text-danger">{totalHot}</p>
                <p className="text-xs text-stone">
                  {totalSubmissions > 0 ? ((totalHot / totalSubmissions) * 100).toFixed(0) : 0}%
                </p>
              </div>
              <div className="card text-center">
                <p className="text-xs text-stone uppercase tracking-wide">Warm</p>
                <p className="mt-1 font-mono text-2xl font-semibold text-warning">{totalWarm}</p>
                <p className="text-xs text-stone">
                  {totalSubmissions > 0 ? ((totalWarm / totalSubmissions) * 100).toFixed(0) : 0}%
                </p>
              </div>
              <div className="card text-center">
                <p className="text-xs text-stone uppercase tracking-wide">Cold</p>
                <p className="mt-1 font-mono text-2xl font-semibold text-stone">{totalCold}</p>
                <p className="text-xs text-stone">
                  {totalSubmissions > 0 ? ((totalCold / totalSubmissions) * 100).toFixed(0) : 0}%
                </p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
