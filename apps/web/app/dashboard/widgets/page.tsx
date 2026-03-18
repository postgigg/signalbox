import Link from 'next/link';

import { createClient } from '@/lib/supabase/server';

const PLAN_WIDGET_LIMITS: Record<string, number> = {
  trial: 1,
  starter: 1,
  pro: 5,
  agency: 25,
};

export default async function WidgetsPage(): Promise<React.ReactElement> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let widgets: Array<{
    id: string;
    name: string;
    widget_key: string;
    domain: string | null;
    is_active: boolean;
    submission_count: number;
    submission_limit: number;
    created_at: string;
  }> = [];

  let plan = 'trial';

  if (user) {
    const { data: memberData } = await supabase
      .from('members')
      .select('account_id')
      .eq('user_id', user.id)
      .limit(1)
      .single();

    if (memberData) {
      const { data } = await supabase
        .from('widgets')
        .select('id, name, widget_key, domain, is_active, submission_count, submission_limit, created_at')
        .eq('account_id', memberData.account_id)
        .order('created_at', { ascending: false });

      widgets = data ?? [];

      const { data: account } = await supabase
        .from('accounts')
        .select('plan')
        .eq('id', memberData.account_id)
        .single();

      plan = account?.plan ?? 'trial';
    }
  }

  const widgetLimit = PLAN_WIDGET_LIMITS[plan] ?? 1;
  const activeCount = widgets.filter((w) => w.is_active).length;
  const atLimit = activeCount >= widgetLimit;

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-heading">Widgets</h1>
          <p className="mt-1 text-xs text-stone">
            {activeCount} of {widgetLimit} widgets used
            {atLimit && (
              <span className="ml-2">
                <Link href="/dashboard/settings/billing" className="text-signal hover:text-signal-hover font-medium transition-colors duration-fast">
                  Upgrade for more
                </Link>
              </span>
            )}
          </p>
        </div>
        {atLimit ? (
          <Link href="/dashboard/settings/billing" className="btn-secondary">
            Upgrade Plan
          </Link>
        ) : (
          <Link href="/dashboard/widgets/new" className="btn-primary">
            Create Widget
          </Link>
        )}
      </div>

      {widgets.length === 0 ? (
        <div className="mt-8 card text-center py-16">
          <svg className="w-10 h-10 text-border-dark mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 01-.825-.242m9.345-8.334a2.126 2.126 0 00-.476-.095 48.64 48.64 0 00-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0011.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155" />
          </svg>
          <h2 className="mt-4 font-display text-lg font-semibold text-ink">No widgets yet</h2>
          <p className="mt-2 text-sm text-stone max-w-sm mx-auto">
            Create your first widget to start qualifying leads on your website.
          </p>
          <Link href="/dashboard/widgets/new" className="btn-primary mt-4">
            Create Your First Widget
          </Link>
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          {widgets.map((widget) => (
            <Link key={widget.id} href={`/dashboard/widgets/${widget.id}`} className="card-interactive block">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="font-body text-base font-semibold text-ink">{widget.name}</h2>
                  <p className="mt-0.5 text-xs text-stone font-mono">{widget.widget_key}</p>
                  {widget.domain && (
                    <p className="mt-0.5 text-xs text-stone">{widget.domain}</p>
                  )}
                </div>
                <span
                  className={`text-xs px-2 py-0.5 rounded-pill font-medium ${
                    widget.is_active
                      ? 'bg-success-light text-success'
                      : 'bg-surface-alt text-stone'
                  }`}
                >
                  {widget.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>
              <div className="mt-4 flex items-center gap-4 text-xs text-stone">
                <span>
                  {widget.submission_count} / {widget.submission_limit} submissions
                </span>
                <span>
                  Created {new Date(widget.created_at).toLocaleDateString()}
                </span>
              </div>
              <div className="mt-3 w-full bg-surface-alt rounded-sm h-1.5">
                <div
                  className="h-full bg-signal rounded-sm"
                  style={{
                    width: `${String(Math.min(100, (widget.submission_count / widget.submission_limit) * 100))}%`,
                  }}
                />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
