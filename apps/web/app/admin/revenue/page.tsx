import { createClient } from '@/lib/supabase/server';

export default async function AdminRevenuePage(): Promise<React.ReactElement> {
  const supabase = await createClient();

  const { count: starterCount } = await supabase
    .from('accounts')
    .select('*', { count: 'exact', head: true })
    .eq('plan', 'starter')
    .eq('subscription_status', 'active');

  const { count: proCount } = await supabase
    .from('accounts')
    .select('*', { count: 'exact', head: true })
    .eq('plan', 'pro')
    .eq('subscription_status', 'active');

  const { count: agencyCount } = await supabase
    .from('accounts')
    .select('*', { count: 'exact', head: true })
    .eq('plan', 'agency')
    .eq('subscription_status', 'active');

  const { count: pastDueCount } = await supabase
    .from('accounts')
    .select('*', { count: 'exact', head: true })
    .eq('subscription_status', 'past_due');

  const { count: canceledCount } = await supabase
    .from('accounts')
    .select('*', { count: 'exact', head: true })
    .eq('subscription_status', 'canceled');

  const { count: trialCount } = await supabase
    .from('accounts')
    .select('*', { count: 'exact', head: true })
    .eq('plan', 'trial')
    .is('deleted_at', null);

  const { count: convertedFromTrial } = await supabase
    .from('accounts')
    .select('*', { count: 'exact', head: true })
    .neq('plan', 'trial')
    .eq('subscription_status', 'active');

  const mrr = ((starterCount ?? 0) * 99) + ((proCount ?? 0) * 149) + ((agencyCount ?? 0) * 249);
  const totalPaying = (starterCount ?? 0) + (proCount ?? 0) + (agencyCount ?? 0);
  const trialConversionRate = (trialCount ?? 0) + totalPaying > 0
    ? (totalPaying / ((trialCount ?? 0) + totalPaying) * 100).toFixed(1)
    : '0';

  return (
    <div>
      <div className="flex items-center gap-3">
        <h1 className="page-heading">Revenue</h1>
        <span className="text-xs font-body font-medium px-1.5 py-0.5 bg-danger text-white rounded-sm">ADMIN</span>
      </div>

      {/* MRR */}
      <div className="mt-6 grid grid-cols-1 sm:grid-cols-5 gap-4">
        <div className="card">
          <p className="text-sm text-stone">Current MRR</p>
          <p className="mt-1 font-mono text-3xl font-semibold text-ink">${mrr.toLocaleString()}</p>
        </div>
        <div className="card">
          <p className="text-sm text-stone">Paying Accounts</p>
          <p className="mt-1 font-mono text-3xl font-semibold text-ink">{totalPaying}</p>
        </div>
        <div className="card">
          <p className="text-sm text-stone">Converted from Trial</p>
          <p className="mt-1 font-mono text-3xl font-semibold text-ink">{convertedFromTrial ?? 0}</p>
        </div>
        <div className="card">
          <p className="text-sm text-stone">Trial Conversion</p>
          <p className="mt-1 font-mono text-3xl font-semibold text-ink">{trialConversionRate}%</p>
        </div>
        <div className="card">
          <p className="text-sm text-stone">Past Due</p>
          <p className="mt-1 font-mono text-3xl font-semibold text-danger">{pastDueCount ?? 0}</p>
        </div>
      </div>

      {/* Plan Distribution */}
      <div className="mt-8">
        <h2 className="font-display text-lg font-semibold text-ink mb-4">Plan Distribution</h2>
        <div className="card">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-xs text-stone uppercase tracking-wide">Starter</p>
              <p className="mt-1 font-mono text-2xl font-semibold text-ink">{starterCount ?? 0}</p>
              <p className="text-xs text-stone">${((starterCount ?? 0) * 99).toLocaleString()}/mo</p>
            </div>
            <div>
              <p className="text-xs text-stone uppercase tracking-wide">Pro</p>
              <p className="mt-1 font-mono text-2xl font-semibold text-ink">{proCount ?? 0}</p>
              <p className="text-xs text-stone">${((proCount ?? 0) * 149).toLocaleString()}/mo</p>
            </div>
            <div>
              <p className="text-xs text-stone uppercase tracking-wide">Agency</p>
              <p className="mt-1 font-mono text-2xl font-semibold text-ink">{agencyCount ?? 0}</p>
              <p className="text-xs text-stone">${((agencyCount ?? 0) * 249).toLocaleString()}/mo</p>
            </div>
          </div>
        </div>
      </div>

      {/* Churn */}
      <div className="mt-8">
        <h2 className="font-display text-lg font-semibold text-ink mb-4">Churn Analysis</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="card">
            <p className="text-sm text-stone">Canceled Accounts</p>
            <p className="mt-1 font-mono text-2xl font-semibold text-ink">{canceledCount ?? 0}</p>
          </div>
          <div className="card">
            <p className="text-sm text-stone">Active Trials</p>
            <p className="mt-1 font-mono text-2xl font-semibold text-ink">{trialCount ?? 0}</p>
          </div>
        </div>
      </div>

      {/* MRR Over Time */}
      <div className="mt-8">
        <h2 className="font-display text-lg font-semibold text-ink mb-4">MRR Over Time</h2>
        <div className="card min-h-[240px] flex items-center justify-center">
          <p className="text-sm text-stone">
            Chart renders with Recharts using platform_metrics MRR data.
          </p>
        </div>
      </div>
    </div>
  );
}
