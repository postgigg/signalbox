import { createClient } from '@/lib/supabase/server';

export default async function AdminAnalyticsPage(): Promise<React.ReactElement> {
  const supabase = await createClient();

  const { count: totalSubmissions } = await supabase
    .from('submissions')
    .select('*', { count: 'exact', head: true });

  const { count: totalWidgets } = await supabase
    .from('widgets')
    .select('*', { count: 'exact', head: true });

  const { count: hotSubmissions } = await supabase
    .from('submissions')
    .select('*', { count: 'exact', head: true })
    .eq('lead_tier', 'hot');

  const { count: warmSubmissions } = await supabase
    .from('submissions')
    .select('*', { count: 'exact', head: true })
    .eq('lead_tier', 'warm');

  const { count: coldSubmissions } = await supabase
    .from('submissions')
    .select('*', { count: 'exact', head: true })
    .eq('lead_tier', 'cold');

  const total = totalSubmissions ?? 0;

  return (
    <div>
      <div className="flex items-center gap-3">
        <h1 className="page-heading">Platform Analytics</h1>
        <span className="text-xs font-body font-medium px-1.5 py-0.5 bg-danger text-white rounded-sm">ADMIN</span>
      </div>

      <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card">
          <p className="text-sm text-stone">Total Submissions</p>
          <p className="mt-1 font-mono text-3xl font-semibold text-ink">{total.toLocaleString()}</p>
        </div>
        <div className="card">
          <p className="text-sm text-stone">Active Widgets</p>
          <p className="mt-1 font-mono text-3xl font-semibold text-ink">{(totalWidgets ?? 0).toLocaleString()}</p>
        </div>
        <div className="card">
          <p className="text-sm text-stone">Hot Lead Rate</p>
          <p className="mt-1 font-mono text-3xl font-semibold text-ink">
            {total > 0 ? (((hotSubmissions ?? 0) / total) * 100).toFixed(1) : '0'}%
          </p>
        </div>
      </div>

      {/* Tier Breakdown */}
      <div className="mt-8">
        <h2 className="font-display text-lg font-semibold text-ink mb-4">Submission Tier Breakdown</h2>
        <div className="card">
          <div className="space-y-3">
            {[
              { label: 'Hot', count: hotSubmissions ?? 0, color: 'bg-danger' },
              { label: 'Warm', count: warmSubmissions ?? 0, color: 'bg-warning' },
              { label: 'Cold', count: coldSubmissions ?? 0, color: 'bg-stone' },
            ].map((item) => {
              const pct = total > 0 ? (item.count / total) * 100 : 0;
              return (
                <div key={item.label} className="flex items-center gap-3">
                  <span className="text-sm text-stone font-body w-12 text-right">{item.label}</span>
                  <div className="flex-1 h-6 bg-surface-alt rounded-sm overflow-hidden">
                    <div className={`h-full ${item.color} rounded-sm`} style={{ width: `${String(pct)}%` }} />
                  </div>
                  <span className="text-sm font-mono text-ink w-16 text-right">
                    {item.count.toLocaleString()} ({pct.toFixed(1)}%)
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Platform Metrics Over Time */}
      <div className="mt-8">
        <h2 className="font-display text-lg font-semibold text-ink mb-4">Daily Metrics</h2>
        <div className="card min-h-[240px] flex items-center justify-center">
          <p className="text-sm text-stone">
            Chart renders with Recharts using platform_metrics data.
          </p>
        </div>
      </div>
    </div>
  );
}
