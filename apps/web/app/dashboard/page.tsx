import Link from 'next/link';

import { createClient } from '@/lib/supabase/server';

interface StatCard {
  readonly label: string;
  readonly value: string;
  readonly trend: string;
  readonly trendUp: boolean;
}

function TierBadge({ tier }: { readonly tier: string }): React.ReactElement {
  const classes: Record<string, string> = {
    hot: 'badge-hot',
    warm: 'badge-warm',
    cold: 'badge-cold',
  };
  return (
    <span className={classes[tier] ?? 'badge-cold'}>
      {tier.charAt(0).toUpperCase() + tier.slice(1)}
    </span>
  );
}

function StatCardComponent({ stat }: { readonly stat: StatCard }): React.ReactElement {
  return (
    <div className="card">
      <p className="text-sm text-stone font-body">{stat.label}</p>
      <p className="mt-1 font-mono text-3xl font-semibold text-ink">{stat.value}</p>
      <p
        className={`mt-1 text-xs font-body ${
          stat.trendUp ? 'text-success' : 'text-danger'
        }`}
      >
        {stat.trendUp ? '\u2191' : '\u2193'} {stat.trend}
      </p>
    </div>
  );
}

export default async function DashboardOverviewPage(): Promise<React.ReactElement> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let totalLeads = 0;
  let hotLeads = 0;
  let avgScore = 0;
  let avgResponseTime = '-';
  let funnelData = { opens: 0, step1: 0, step2: 0, step3: 0, submitted: 0 };
  let recentHotLeads: Array<{
    id: string;
    visitor_name: string;
    visitor_email: string;
    lead_score: number;
    lead_tier: string;
    created_at: string;
  }> = [];

  if (user) {
    const { data: memberData } = await supabase
      .from('members')
      .select('account_id')
      .eq('user_id', user.id)
      .limit(1)
      .single();

    if (memberData) {
      const accountId = memberData.account_id;

      const { count: totalCount } = await supabase
        .from('submissions')
        .select('*', { count: 'exact', head: true })
        .eq('account_id', accountId);

      const { count: hotCount } = await supabase
        .from('submissions')
        .select('*', { count: 'exact', head: true })
        .eq('account_id', accountId)
        .eq('lead_tier', 'hot');

      const { data: scoreData } = await supabase
        .from('submissions')
        .select('lead_score')
        .eq('account_id', accountId);

      if (scoreData && scoreData.length > 0) {
        const sum = scoreData.reduce((acc, s) => acc + s.lead_score, 0);
        avgScore = Math.round(sum / scoreData.length);
      }

      totalLeads = totalCount ?? 0;
      hotLeads = hotCount ?? 0;

      // Calculate average response time
      const { data: responseData } = await supabase
        .from('submissions')
        .select('created_at, viewed_at')
        .eq('account_id', accountId)
        .not('viewed_at', 'is', null)
        .limit(100);

      if (responseData && responseData.length > 0) {
        const totalMs = responseData.reduce((acc, s) => {
          const created = new Date(s.created_at).getTime();
          const viewed = new Date(s.viewed_at as string).getTime();
          return acc + (viewed - created);
        }, 0);
        const avgMs = totalMs / responseData.length;
        const avgHours = avgMs / (1000 * 60 * 60);
        avgResponseTime = avgHours < 1
          ? `${Math.round(avgHours * 60)}m`
          : `${avgHours.toFixed(1)}h`;
      }

      // Get funnel data from widget_analytics
      const { data: analyticsData } = await supabase
        .from('widget_analytics')
        .select('opens, step_1_views, step_2_views, step_3_views, completions, submissions')
        .eq('account_id', accountId);

      if (analyticsData && analyticsData.length > 0) {
        const totals = analyticsData.reduce(
          (acc, row) => ({
            opens: acc.opens + row.opens,
            step1: acc.step1 + row.step_1_views,
            step2: acc.step2 + row.step_2_views,
            step3: acc.step3 + row.step_3_views,
            submitted: acc.submitted + row.submissions,
          }),
          { opens: 0, step1: 0, step2: 0, step3: 0, submitted: 0 }
        );
        funnelData = totals;
      }

      const { data: hotLeadsData } = await supabase
        .from('submissions')
        .select('id, visitor_name, visitor_email, lead_score, lead_tier, created_at')
        .eq('account_id', accountId)
        .eq('lead_tier', 'hot')
        .order('created_at', { ascending: false })
        .limit(5);

      recentHotLeads = hotLeadsData ?? [];
    }
  }

  const stats: readonly StatCard[] = [
    { label: 'Total Leads', value: String(totalLeads), trend: 'all time', trendUp: true },
    { label: 'Hot Leads', value: String(hotLeads), trend: 'all time', trendUp: true },
    { label: 'Avg Score', value: String(avgScore), trend: 'all leads', trendUp: avgScore > 50 },
    { label: 'Avg Response Time', value: avgResponseTime, trend: 'to first view', trendUp: avgResponseTime !== '-' },
  ] as const;

  return (
    <div>
      <h1 className="page-heading">Overview</h1>

      {/* Stat Cards */}
      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <StatCardComponent key={stat.label} stat={stat} />
        ))}
      </div>

      {/* Recent Hot Leads */}
      <div className="mt-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-lg font-semibold text-ink">Recent Hot Leads</h2>
          <Link href="/dashboard/leads?tier=hot" className="text-sm text-signal hover:text-signal-hover transition-colors duration-fast">
            View all
          </Link>
        </div>
        {recentHotLeads.length === 0 ? (
          <div className="card text-center py-10">
            <p className="text-sm text-stone">No hot leads yet. They will appear here when visitors complete your widget.</p>
          </div>
        ) : (
          <div className="bg-surface border border-border rounded-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-surface-alt">
                    <th className="text-left py-3 px-5 text-xs font-medium uppercase tracking-wide text-stone">Name</th>
                    <th className="text-left py-3 px-5 text-xs font-medium uppercase tracking-wide text-stone">Email</th>
                    <th className="text-right py-3 px-5 text-xs font-medium uppercase tracking-wide text-stone">Score</th>
                    <th className="text-center py-3 px-5 text-xs font-medium uppercase tracking-wide text-stone">Tier</th>
                    <th className="text-right py-3 px-5 text-xs font-medium uppercase tracking-wide text-stone">When</th>
                  </tr>
                </thead>
                <tbody>
                  {recentHotLeads.map((lead) => (
                    <tr key={lead.id} className="border-b border-border last:border-0 transition-colors duration-fast hover:bg-surface-alt">
                      <td className="py-3.5 px-5 font-medium text-ink whitespace-nowrap">
                        <Link href={`/dashboard/leads/${lead.id}`} className="hover:text-signal transition-colors duration-fast">
                          {lead.visitor_name}
                        </Link>
                      </td>
                      <td className="py-3.5 px-5 text-stone">{lead.visitor_email}</td>
                      <td className="py-3.5 px-5 text-right font-mono tabular-nums">{lead.lead_score}</td>
                      <td className="py-3.5 px-5 text-center">
                        <TierBadge tier={lead.lead_tier} />
                      </td>
                      <td className="py-3.5 px-5 text-right text-stone whitespace-nowrap">
                        {new Date(lead.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Conversion Funnel */}
      <div className="mt-8">
        <h2 className="font-display text-lg font-semibold text-ink mb-4">Conversion Funnel</h2>
        <div className="card">
          {funnelData.opens === 0 ? (
            <p className="text-sm text-stone text-center py-4">
              No funnel data yet. Data will appear once visitors interact with your widgets.
            </p>
          ) : (
            <div className="space-y-3">
              {[
                { label: 'Widget Opens', value: funnelData.opens },
                { label: 'Step 1 Completed', value: funnelData.step1 },
                { label: 'Step 2 Completed', value: funnelData.step2 },
                { label: 'Step 3 Completed', value: funnelData.step3 },
                { label: 'Submitted', value: funnelData.submitted },
              ].map((step) => {
                const pct = funnelData.opens > 0
                  ? Math.round((step.value / funnelData.opens) * 100)
                  : 0;
                return (
                  <div key={step.label} className="flex items-center gap-3">
                    <span className="text-xs text-stone font-body w-32 flex-shrink-0 text-right">
                      {step.label}
                    </span>
                    <div className="flex-1 h-6 bg-surface-alt rounded-sm overflow-hidden">
                      <div
                        className="h-full bg-signal rounded-sm transition-all duration-normal"
                        style={{ width: `${String(pct)}%` }}
                      />
                    </div>
                    <span className="text-xs font-mono text-stone w-12 text-right">
                      {step.value} ({pct}%)
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Submissions Over Time Chart Placeholder */}
      <div className="mt-8">
        <h2 className="font-display text-lg font-semibold text-ink mb-4">
          Submissions Over Time
        </h2>
        <div className="card min-h-[240px] flex items-center justify-center">
          <p className="text-sm text-stone">
            Chart renders here with Recharts when submission data is available.
          </p>
        </div>
      </div>
    </div>
  );
}
