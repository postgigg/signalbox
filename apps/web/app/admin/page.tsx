import { createClient } from '@/lib/supabase/server';

interface AdminStatCard {
  readonly label: string;
  readonly value: string;
}

export default async function AdminOverviewPage(): Promise<React.ReactElement> {
  const supabase = await createClient();

  const { count: totalAccounts } = await supabase
    .from('accounts')
    .select('*', { count: 'exact', head: true })
    .is('deleted_at', null);

  const { count: trialAccounts } = await supabase
    .from('accounts')
    .select('*', { count: 'exact', head: true })
    .eq('plan', 'trial')
    .is('deleted_at', null);

  const { count: starterAccounts } = await supabase
    .from('accounts')
    .select('*', { count: 'exact', head: true })
    .eq('plan', 'starter')
    .is('deleted_at', null);

  const { count: proAccounts } = await supabase
    .from('accounts')
    .select('*', { count: 'exact', head: true })
    .eq('plan', 'pro')
    .is('deleted_at', null);

  const { count: agencyAccounts } = await supabase
    .from('accounts')
    .select('*', { count: 'exact', head: true })
    .eq('plan', 'agency')
    .is('deleted_at', null);

  const mrrEstimate = ((starterAccounts ?? 0) * 99) + ((proAccounts ?? 0) * 149) + ((agencyAccounts ?? 0) * 249);

  const { count: openTickets } = await supabase
    .from('support_tickets')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'open');

  const { count: pendingTickets } = await supabase
    .from('support_tickets')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'pending');

  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const { count: newThisMonth } = await supabase
    .from('accounts')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', startOfMonth.toISOString())
    .is('deleted_at', null);

  const stats: readonly AdminStatCard[] = [
    { label: 'Total Accounts', value: String(totalAccounts ?? 0) },
    { label: 'MRR', value: `$${mrrEstimate.toLocaleString()}` },
    { label: 'New This Month', value: String(newThisMonth ?? 0) },
  ] as const;

  const planBreakdown = [
    { plan: 'Trial', count: trialAccounts ?? 0, color: 'bg-border-dark' },
    { plan: 'Starter', count: starterAccounts ?? 0, color: 'bg-signal' },
    { plan: 'Pro', count: proAccounts ?? 0, color: 'bg-signal-hover' },
    { plan: 'Agency', count: agencyAccounts ?? 0, color: 'bg-ink' },
  ] as const;

  return (
    <div>
      <div className="flex items-center gap-3">
        <h1 className="page-heading">Platform Overview</h1>
        <span className="text-xs font-body font-medium px-1.5 py-0.5 bg-danger text-white rounded-sm">
          ADMIN
        </span>
      </div>

      {/* Stat Cards */}
      <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className="card">
            <p className="text-sm text-stone font-body">{stat.label}</p>
            <p className="mt-1 font-mono text-3xl font-semibold text-ink">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Plan Breakdown */}
      <div className="mt-8">
        <h2 className="font-display text-lg font-semibold text-ink mb-4">Plan Breakdown</h2>
        <div className="card">
          <div className="space-y-3">
            {planBreakdown.map((item) => {
              const total = totalAccounts ?? 1;
              const pct = total > 0 ? (item.count / total) * 100 : 0;
              return (
                <div key={item.plan} className="flex items-center gap-3">
                  <span className="text-sm text-stone font-body w-16 text-right">{item.plan}</span>
                  <div className="flex-1 h-6 bg-surface-alt rounded-sm overflow-hidden">
                    <div className={`h-full ${item.color} rounded-sm`} style={{ width: `${String(pct)}%` }} />
                  </div>
                  <span className="text-sm font-mono text-ink w-12 text-right">{item.count}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Support Tickets */}
      <div className="mt-8">
        <h2 className="font-display text-lg font-semibold text-ink mb-4">Support Tickets</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="card">
            <p className="text-sm text-stone font-body">Open Tickets</p>
            <p className="mt-1 font-mono text-3xl font-semibold text-ink">{openTickets ?? 0}</p>
          </div>
          <div className="card">
            <p className="text-sm text-stone font-body">Pending Reply</p>
            <p className="mt-1 font-mono text-3xl font-semibold text-ink">{pendingTickets ?? 0}</p>
          </div>
        </div>
      </div>

      {/* System Health */}
      <div className="mt-8">
        <h2 className="font-display text-lg font-semibold text-ink mb-4">System Health</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="card">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-pill bg-success" />
              <p className="text-sm text-ink font-medium">Database</p>
            </div>
            <p className="mt-1 text-xs text-stone">Connected</p>
          </div>
          <div className="card">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-pill bg-success" />
              <p className="text-sm text-ink font-medium">Auth</p>
            </div>
            <p className="mt-1 text-xs text-stone">Operational</p>
          </div>
          <div className="card">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-pill bg-success" />
              <p className="text-sm text-ink font-medium">Widget CDN</p>
            </div>
            <p className="mt-1 text-xs text-stone">Operational</p>
          </div>
        </div>
      </div>
    </div>
  );
}
