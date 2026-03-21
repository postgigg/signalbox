'use client';

import Link from 'next/link';
import { useState, useEffect, useCallback } from 'react';

import { ConversionFunnel } from '@/components/dashboard/ConversionFunnel';

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
  step_1_views: number;
  step_2_views: number;
  step_3_views: number;
  step_4_views: number;
  step_5_views: number;
}

interface AdvancedData {
  sourceBreakdown: Array<{ source: string; count: number }>;
  deviceBreakdown: Array<{ device: string; count: number }>;
  countryBreakdown: Array<{ country: string; count: number }>;
  stepDropoff: Array<{ step: number; views: number }>;
}

const DATE_RANGES = [
  { label: '7 days', days: 7 },
  { label: '30 days', days: 30 },
  { label: '90 days', days: 90 },
] as const;

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

      const { data: accountData } = await supabase
        .from('accounts')
        .select('plan')
        .eq('id', memberData.account_id)
        .single();

      if (accountData) {
        setAccountPlan(accountData.plan);
      }

      const now = new Date();
      const fromDate = new Date();
      fromDate.setDate(now.getDate() - dateRange);
      const fromStr = fromDate.toISOString().split('T')[0] ?? '';
      const toStr = now.toISOString().split('T')[0] ?? '';

      // Previous period for comparison
      const prevFromDate = new Date();
      prevFromDate.setDate(fromDate.getDate() - dateRange);
      const prevFromStr = prevFromDate.toISOString().split('T')[0] ?? '';

      const selectFields = 'date, impressions, opens, completions, submissions, hot_count, warm_count, cold_count, avg_score, step_1_views, step_2_views, step_3_views, step_4_views, step_5_views';

      // Fetch current + previous period in parallel
      const [currentResult, prevResult] = await Promise.all([
        supabase
          .from('widget_analytics')
          .select(selectFields)
          .eq('account_id', memberData.account_id)
          .gte('date', fromStr)
          .order('date', { ascending: true }),
        supabase
          .from('widget_analytics')
          .select(selectFields)
          .eq('account_id', memberData.account_id)
          .gte('date', prevFromStr)
          .lt('date', fromStr)
          .order('date', { ascending: true }),
      ]);

      setData((currentResult.data as AnalyticsData[]) ?? []);
      setPrevData((prevResult.data as AnalyticsData[]) ?? []);

      // Fetch advanced analytics for Pro/Agency
      const plan = accountData?.plan ?? 'trial';
      if (plan === 'pro' || plan === 'agency') {
        setAdvancedLoading(true);
        try {
          const advResponse = await fetch(`/api/v1/analytics/advanced?from=${fromStr}&to=${toStr}`);
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
  }, [dateRange]);

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
        <AnalyticsSkeleton />
      ) : (
        <>
          {/* Conversion Funnel */}
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

          {/* Conversion Rate Over Time */}
          <div className="mt-8">
            <h2 className="font-display text-lg font-semibold text-ink mb-4">Conversion Rate Over Time</h2>
            <ConversionRateChart data={data} />
          </div>

          {/* Submissions Over Time */}
          <div className="mt-8">
            <h2 className="font-display text-lg font-semibold text-ink mb-4">Submissions Over Time</h2>
            <SubmissionsChart data={data} />
          </div>

          {/* Tier Breakdown */}
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

          {/* Advanced Analytics */}
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

/* ── Sub-components ── */

function ConversionRateChart({ data }: { readonly data: AnalyticsData[] }): React.ReactElement {
  if (data.length === 0) {
    return (
      <div className="card min-h-[200px] flex items-center justify-center">
        <p className="text-sm text-stone">No data for this period.</p>
      </div>
    );
  }

  const rates = data.map((d) => ({
    date: d.date,
    rate: d.opens > 0 ? (d.submissions / d.opens) * 100 : 0,
  }));
  const maxRate = Math.max(...rates.map((r) => r.rate), 1);

  return (
    <div className="card">
      <div className="flex items-end gap-1 h-[160px]">
        {rates.map((r) => {
          const height = (r.rate / maxRate) * 100;
          return (
            <div key={r.date} className="flex-1 flex flex-col items-center justify-end h-full">
              <div
                className="w-full bg-success/70 rounded-t-sm transition-all duration-fast hover:bg-success"
                style={{ height: `${String(Math.max(height, 2))}%` }}
                title={`${r.date}: ${r.rate.toFixed(1)}% conversion`}
              />
            </div>
          );
        })}
      </div>
      <div className="flex justify-between mt-2 text-[10px] text-stone-light font-mono">
        <span>{rates[0]?.date ?? ''}</span>
        <span>{rates[rates.length - 1]?.date ?? ''}</span>
      </div>
      <p className="text-xs text-stone mt-1 text-center">Opens to submissions conversion rate by day</p>
    </div>
  );
}

function SubmissionsChart({ data }: { readonly data: AnalyticsData[] }): React.ReactElement {
  if (data.length === 0) {
    return (
      <div className="card min-h-[200px] flex items-center justify-center">
        <p className="text-sm text-stone">No data for this period.</p>
      </div>
    );
  }

  const maxSubs = Math.max(...data.map((d) => d.submissions), 1);

  return (
    <div className="card">
      <div className="flex items-end gap-1 h-[160px]">
        {data.map((d) => {
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
      <div className="flex justify-between mt-2 text-[10px] text-stone-light font-mono">
        <span>{data[0]?.date ?? ''}</span>
        <span>{data[data.length - 1]?.date ?? ''}</span>
      </div>
    </div>
  );
}

interface TierBreakdownProps {
  readonly hot: number;
  readonly warm: number;
  readonly cold: number;
  readonly total: number;
  readonly prevHot: number;
  readonly prevWarm: number;
  readonly prevCold: number;
}

function TierBreakdown({ hot, warm, cold, total, prevHot, prevWarm, prevCold }: TierBreakdownProps): React.ReactElement {
  const tierBarTotal = Math.max(hot + warm + cold, 1);
  const hotPct = (hot / tierBarTotal) * 100;
  const warmPct = (warm / tierBarTotal) * 100;

  return (
    <div>
      {/* Stacked bar */}
      {total > 0 && (
        <div className="h-8 flex rounded-sm overflow-hidden mb-4">
          <div className="bg-danger transition-all duration-normal" style={{ width: `${String(hotPct)}%` }} title={`Hot: ${String(hot)}`} />
          <div className="bg-warning transition-all duration-normal" style={{ width: `${String(warmPct)}%` }} title={`Warm: ${String(warm)}`} />
          <div className="bg-stone-light/40 transition-all duration-normal flex-1" title={`Cold: ${String(cold)}`} />
        </div>
      )}
      <div className="grid grid-cols-3 gap-4">
        <TierCard label="Hot" value={hot} total={total} previous={prevHot} color="danger" />
        <TierCard label="Warm" value={warm} total={total} previous={prevWarm} color="warning" />
        <TierCard label="Cold" value={cold} total={total} previous={prevCold} color="stone" />
      </div>
    </div>
  );
}

interface TierCardProps {
  readonly label: string;
  readonly value: number;
  readonly total: number;
  readonly previous: number;
  readonly color: string;
}

function TierCard({ label, value, total, previous, color }: TierCardProps): React.ReactElement {
  const pct = total > 0 ? ((value / total) * 100).toFixed(0) : '0';
  const change = previous > 0 ? ((value - previous) / previous) * 100 : 0;
  const hasChange = previous > 0 || value > 0;

  return (
    <div className="card text-center">
      <p className="text-xs text-stone uppercase tracking-wide">{label}</p>
      <p className={`mt-1 font-mono text-2xl font-semibold text-${color}`}>{value}</p>
      <p className="text-xs text-stone">{pct}% of total</p>
      {hasChange && (
        <p className={`text-[10px] font-mono tabular-nums mt-0.5 ${change >= 0 ? 'text-success' : 'text-danger'}`}>
          {change >= 0 ? '+' : ''}{change.toFixed(0)}% vs prev.
        </p>
      )}
    </div>
  );
}

interface AdvancedSectionProps {
  readonly hasAccess: boolean;
  readonly loading: boolean;
  readonly data: AdvancedData | null;
}

function AdvancedSection({ hasAccess, loading, data }: AdvancedSectionProps): React.ReactElement {
  if (!hasAccess) {
    return (
      <div className="card text-center py-8">
        <p className="text-sm text-stone mb-1">Source breakdown, device analytics, country data, and step drop-off analysis.</p>
        <p className="text-sm text-stone mb-4">Available on Pro and Agency plans.</p>
        <Link href="/dashboard/settings/billing" className="btn-primary text-sm">
          Upgrade Plan
        </Link>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="card">
            <div className="skeleton h-5 w-32 mb-4" />
            <div className="space-y-2">
              {Array.from({ length: 4 }).map((__, j) => (
                <div key={j} className="flex justify-between">
                  <div className="skeleton h-4 w-24" />
                  <div className="skeleton h-4 w-10" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (data === null) return <></>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Step Drop-off */}
      <div className="card">
        <h3 className="font-body text-sm font-semibold text-ink mb-4">Step Drop-off</h3>
        {data.stepDropoff.every((s) => s.views === 0) ? (
          <p className="text-sm text-stone">No step data for this period.</p>
        ) : (
          <div className="space-y-2">
            {data.stepDropoff.map((s, i) => {
              const maxViews = Math.max(...data.stepDropoff.map((x) => x.views), 1);
              const pct = (s.views / maxViews) * 100;
              const prevStep = i > 0 ? data.stepDropoff[i - 1] : undefined;
              const dropPct = prevStep !== undefined && prevStep.views > 0
                ? ((prevStep.views - s.views) / prevStep.views * 100).toFixed(0)
                : null;
              return (
                <div key={s.step}>
                  {dropPct !== null && Number(dropPct) > 0 && (
                    <p className="text-[10px] text-danger/70 font-mono text-center mb-0.5">
                      -{dropPct}% drop
                    </p>
                  )}
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-stone font-body w-12 flex-shrink-0">Step {s.step}</span>
                    <div className="flex-1 h-5 bg-surface-alt rounded-sm overflow-hidden">
                      <div className="h-full bg-signal rounded-sm" style={{ width: `${String(pct)}%` }} />
                    </div>
                    <span className="text-xs font-mono text-stone w-10 text-right">{s.views}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Traffic Sources */}
      <div className="card">
        <h3 className="font-body text-sm font-semibold text-ink mb-4">Traffic Sources</h3>
        {data.sourceBreakdown.length === 0 ? (
          <p className="text-sm text-stone">No source data for this period.</p>
        ) : (
          <div className="space-y-2">
            {data.sourceBreakdown.slice(0, 8).map((s) => {
              const maxCount = Math.max(...data.sourceBreakdown.map((x) => x.count), 1);
              const pct = (s.count / maxCount) * 100;
              return (
                <div key={s.source} className="flex items-center gap-3 text-sm">
                  <span className="text-ink truncate w-24 flex-shrink-0">{s.source}</span>
                  <div className="flex-1 h-4 bg-surface-alt rounded-sm overflow-hidden">
                    <div className="h-full bg-signal/50 rounded-sm" style={{ width: `${String(pct)}%` }} />
                  </div>
                  <span className="font-mono text-stone flex-shrink-0 w-8 text-right">{s.count}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Devices */}
      <div className="card">
        <h3 className="font-body text-sm font-semibold text-ink mb-4">Devices</h3>
        {data.deviceBreakdown.length === 0 ? (
          <p className="text-sm text-stone">No device data for this period.</p>
        ) : (
          <div className="space-y-2">
            {data.deviceBreakdown.map((d) => {
              const total = data.deviceBreakdown.reduce((sum, x) => sum + x.count, 0);
              const pct = total > 0 ? ((d.count / total) * 100).toFixed(0) : '0';
              return (
                <div key={d.device} className="flex items-center justify-between text-sm">
                  <span className="text-ink capitalize">{d.device}</span>
                  <span className="font-mono text-stone">{d.count} ({pct}%)</span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Countries */}
      <div className="card">
        <h3 className="font-body text-sm font-semibold text-ink mb-4">Top Countries</h3>
        {data.countryBreakdown.length === 0 ? (
          <p className="text-sm text-stone">No country data for this period.</p>
        ) : (
          <div className="space-y-2">
            {data.countryBreakdown.map((c) => (
              <div key={c.country} className="flex items-center justify-between text-sm">
                <span className="text-ink">{c.country}</span>
                <span className="font-mono text-stone">{c.count}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function AnalyticsSkeleton(): React.ReactElement {
  return (
    <div>
      <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="card">
            <div className="skeleton h-3 w-20 mb-2" />
            <div className="skeleton h-6 w-14" />
          </div>
        ))}
      </div>
      <div className="mt-6">
        <div className="skeleton h-6 w-36 mb-4" />
        <div className="card">
          <div className="space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="skeleton h-3 w-20 flex-shrink-0" />
                <div className="flex-1 skeleton h-7 rounded-sm" style={{ width: `${80 - i * 15}%` }} />
                <div className="skeleton h-3 w-12" />
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="mt-8">
        <div className="skeleton h-6 w-44 mb-4" />
        <div className="card min-h-[200px] flex items-end gap-1 p-5">
          {Array.from({ length: 14 }).map((_, i) => (
            <div key={i} className="flex-1 skeleton rounded-t-sm" style={{ height: `${30 + ((i * 17) % 50)}%` }} />
          ))}
        </div>
      </div>
    </div>
  );
}
