import Link from 'next/link';
import { notFound } from 'next/navigation';

import { HelpTip } from '@/components/shared/HelpTip';
import { HELP_TIPS } from '@/lib/help-content';
import { createClient } from '@/lib/supabase/server';

interface WidgetDetailPageProps {
  readonly params: Promise<{ id: string }>;
}

export default async function WidgetDetailPage({ params }: WidgetDetailPageProps): Promise<React.ReactElement> {
  const { id } = await params;
  const supabase = await createClient();

  const { data: widget, error } = await supabase
    .from('widgets')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !widget) {
    notFound();
  }

  const { count: submissionCount } = await supabase
    .from('submissions')
    .select('*', { count: 'exact', head: true })
    .eq('widget_id', id);

  const { count: hotCount } = await supabase
    .from('submissions')
    .select('*', { count: 'exact', head: true })
    .eq('widget_id', id)
    .eq('lead_tier', 'hot');

  // Load account plan to conditionally show Agency-only tabs
  const { data: { user } } = await supabase.auth.getUser();
  let accountPlan = 'trial';
  if (user) {
    const { data: memberData } = await supabase
      .from('members')
      .select('account_id')
      .eq('user_id', user.id)
      .limit(1)
      .single();
    if (memberData) {
      const { data: accountData } = await supabase
        .from('accounts')
        .select('plan')
        .eq('id', memberData.account_id)
        .single();
      if (accountData) {
        accountPlan = accountData.plan;
      }
    }
  }

  const baseNavItems = [
    { href: `/dashboard/widgets/${id}`, label: 'Overview' },
    { href: `/dashboard/widgets/${id}/flow`, label: 'Flow Builder' },
    { href: `/dashboard/widgets/${id}/design`, label: 'Design' },
    { href: `/dashboard/widgets/${id}/embed`, label: 'Embed Code' },
    { href: `/dashboard/widgets/${id}/ab-tests`, label: 'A/B Tests' },
    { href: `/dashboard/widgets/${id}/sequences`, label: 'Sequences' },
  ];

  if (accountPlan === 'agency') {
    baseNavItems.push({ href: `/dashboard/widgets/${id}/routing`, label: 'Routing' });
  }

  const subNavItems = baseNavItems;

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <Link href="/dashboard/widgets" className="text-sm text-stone hover:text-ink transition-colors duration-fast">
          Widgets
        </Link>
        <span className="text-stone-light">/</span>
        <span className="text-sm text-ink font-medium">{widget.name}</span>
      </div>

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="page-heading">{widget.name}</h1>
          <div className="flex items-center gap-3 mt-1">
            <span className="text-xs text-stone font-mono">{widget.widget_key}</span>
            <span
              className={`text-xs px-2 py-0.5 rounded-pill font-medium ${
                widget.is_active ? 'bg-success-light text-success' : 'bg-surface-alt text-stone'
              }`}
            >
              {widget.is_active ? 'Active' : 'Inactive'}
            </span>
          </div>
        </div>
      </div>

      {/* Sub-nav */}
      <nav className="flex gap-1 border-b border-border mb-6">
        {subNavItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="px-4 py-2.5 text-sm font-body text-stone hover:text-ink border-b-2 border-transparent hover:border-border-dark transition-colors duration-fast -mb-px"
          >
            {item.label}
          </Link>
        ))}
      </nav>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="card">
          <p className="text-sm text-stone">Total Submissions</p>
          <p className="mt-1 font-mono text-2xl font-semibold text-ink">{submissionCount ?? 0}</p>
        </div>
        <div className="card">
          <p className="text-sm text-stone">Hot Leads</p>
          <p className="mt-1 font-mono text-2xl font-semibold text-ink">{hotCount ?? 0}</p>
        </div>
        <div className="card">
          <p className="text-sm text-stone">
            Usage
            <HelpTip text={HELP_TIPS.widgetOverview.usage} />
          </p>
          <p className="mt-1 font-mono text-2xl font-semibold text-ink">
            {widget.submission_count}/{widget.submission_limit}
          </p>
        </div>
        <div className="card">
          <p className="text-sm text-stone">Domain</p>
          <p className="mt-1 text-sm text-ink font-medium truncate">
            {widget.domain ?? 'Not set'}
          </p>
        </div>
      </div>

      {/* Recent Submissions */}
      <RecentSubmissions widgetId={id} />
    </div>
  );
}

async function RecentSubmissions({ widgetId }: { readonly widgetId: string }): Promise<React.ReactElement> {
  const supabase = await createClient();

  const { data: submissions } = await supabase
    .from('submissions')
    .select('id, visitor_name, visitor_email, lead_score, lead_tier, created_at')
    .eq('widget_id', widgetId)
    .order('created_at', { ascending: false })
    .limit(5);

  return (
    <div className="mt-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-display text-lg font-semibold text-ink">Recent Submissions</h2>
        <Link href={`/dashboard/leads?widget=${widgetId}`} className="text-sm text-signal hover:text-signal-hover transition-colors duration-fast">
          View all leads
        </Link>
      </div>
      {!submissions || submissions.length === 0 ? (
        <div className="card text-center py-8">
          <p className="text-sm text-stone">
            No submissions yet. They will appear here when visitors complete your widget.
          </p>
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
                  <th className="text-right py-3 px-5 text-xs font-medium uppercase tracking-wide text-stone">When</th>
                </tr>
              </thead>
              <tbody>
                {submissions.map((sub) => (
                  <tr key={sub.id} className="border-b border-border last:border-0 transition-colors duration-fast hover:bg-surface-alt">
                    <td className="py-3.5 px-5 font-medium text-ink whitespace-nowrap">
                      <Link href={`/dashboard/leads/${sub.id}`} className="hover:text-signal transition-colors duration-fast">
                        {sub.visitor_name}
                      </Link>
                    </td>
                    <td className="py-3.5 px-5 text-stone">{sub.visitor_email}</td>
                    <td className="py-3.5 px-5 text-right font-mono tabular-nums">{sub.lead_score}</td>
                    <td className="py-3.5 px-5 text-right text-stone whitespace-nowrap">
                      {new Date(sub.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
