'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

import type { FormEvent } from 'react';

const TEMPLATES = [
  { id: 'home_services', name: 'Home Services', steps: 4, description: 'Service type, timeline, property size, budget' },
  { id: 'legal', name: 'Legal', steps: 3, description: 'Case type, urgency, consultation preference' },
  { id: 'medical', name: 'Medical', steps: 4, description: 'Service, insurance, new patient, availability' },
  { id: 'agency', name: 'Agency', steps: 4, description: 'Service, budget, timeline, company size' },
  { id: 'real_estate', name: 'Real Estate', steps: 4, description: 'Buy/sell, property type, price range, timeline' },
  { id: 'consulting', name: 'Consulting', steps: 3, description: 'Service area, company size, engagement type' },
  { id: 'blank', name: 'Start from Scratch', steps: 0, description: 'Build a custom qualifying flow from the ground up' },
] as const;

const PLAN_WIDGET_LIMITS: Record<string, number> = {
  trial: 1,
  starter: 1,
  pro: 5,
  agency: 25,
};

const PLAN_NAMES: Record<string, string> = {
  trial: 'Trial',
  starter: 'Starter',
  pro: 'Pro',
  agency: 'Agency',
};

interface PlanCheckState {
  loading: boolean;
  plan: string;
  widgetCount: number;
  widgetLimit: number;
  atLimit: boolean;
}

export default function NewWidgetPage(): React.ReactElement {
  const router = useRouter();
  const [name, setName] = useState('');
  const [domain, setDomain] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [planCheck, setPlanCheck] = useState<PlanCheckState>({
    loading: true,
    plan: 'trial',
    widgetCount: 0,
    widgetLimit: 1,
    atLimit: false,
  });

  useEffect(() => {
    async function checkPlanLimits(): Promise<void> {
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

        const { data: account } = await supabase
          .from('accounts')
          .select('plan')
          .eq('id', memberData.account_id)
          .single();

        const currentPlan = account?.plan ?? 'trial';
        const limit = PLAN_WIDGET_LIMITS[currentPlan] ?? 1;

        const { count } = await supabase
          .from('widgets')
          .select('id', { count: 'exact', head: true })
          .eq('account_id', memberData.account_id)
          .eq('is_active', true);

        const currentCount = count ?? 0;

        setPlanCheck({
          loading: false,
          plan: currentPlan,
          widgetCount: currentCount,
          widgetLimit: limit,
          atLimit: currentCount >= limit,
        });
      } catch {
        setPlanCheck((prev) => ({ ...prev, loading: false }));
      }
    }
    void checkPlanLimits();
  }, []);

  async function handleSubmit(e: FormEvent<HTMLFormElement>): Promise<void> {
    e.preventDefault();
    if (!selectedTemplate) {
      setError('Please select a template.');
      return;
    }

    if (planCheck.atLimit) {
      setError(`Your ${PLAN_NAMES[planCheck.plan] ?? planCheck.plan} plan allows ${String(planCheck.widgetLimit)} widget(s). Upgrade to create more.`);
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const { createBrowserClient } = await import('@supabase/ssr');
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL ?? '',
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ''
      );

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setError('You must be logged in.');
        setLoading(false);
        return;
      }

      const { data: memberData } = await supabase
        .from('members')
        .select('account_id')
        .eq('user_id', user.id)
        .limit(1)
        .single();

      if (!memberData) {
        setError('No account found.');
        setLoading(false);
        return;
      }

      const { data: widget, error: createError } = await supabase
        .from('widgets')
        .insert({
          account_id: memberData.account_id,
          name: name.trim() || 'My Widget',
          domain: domain.trim() || null,
        })
        .select('id')
        .single();

      if (createError || !widget) {
        setError(createError?.message ?? 'Failed to create widget.');
        setLoading(false);
        return;
      }

      router.push(`/dashboard/widgets/${widget.id}/flow`);
    } catch {
      setError('Something went wrong. Please try again.');
      setLoading(false);
    }
  }

  if (planCheck.loading) {
    return (
      <div>
        <div className="flex items-center gap-2 mb-6">
          <Link href="/dashboard/widgets" className="text-sm text-stone hover:text-ink transition-colors duration-fast">
            Widgets
          </Link>
          <span className="text-stone-light">/</span>
          <span className="text-sm text-ink font-medium">New Widget</span>
        </div>
        <div className="skeleton h-8 w-56 mb-4" />
        <div className="skeleton h-4 w-80 mb-6" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="skeleton h-10 w-full rounded-md" />
          <div className="skeleton h-10 w-full rounded-md" />
        </div>
      </div>
    );
  }

  if (planCheck.atLimit) {
    return (
      <div>
        <div className="flex items-center gap-2 mb-6">
          <Link href="/dashboard/widgets" className="text-sm text-stone hover:text-ink transition-colors duration-fast">
            Widgets
          </Link>
          <span className="text-stone-light">/</span>
          <span className="text-sm text-ink font-medium">New Widget</span>
        </div>

        <div className="card text-center py-12 max-w-lg mx-auto">
          <svg className="w-10 h-10 text-border-dark mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
          </svg>
          <h1 className="mt-4 font-display text-xl font-semibold text-ink">Widget limit reached</h1>
          <p className="mt-2 text-sm text-stone max-w-sm mx-auto">
            Your {PLAN_NAMES[planCheck.plan] ?? planCheck.plan} plan allows {planCheck.widgetLimit} widget{planCheck.widgetLimit === 1 ? '' : 's'}.
            You currently have {planCheck.widgetCount}.
            Upgrade your plan to create more widgets.
          </p>
          <div className="mt-6 flex items-center justify-center gap-3">
            <Link href="/dashboard/settings/billing" className="btn-primary">
              Upgrade Plan
            </Link>
            <Link href="/dashboard/widgets" className="btn-ghost">
              Back to Widgets
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-2 mb-6">
        <Link href="/dashboard/widgets" className="text-sm text-stone hover:text-ink transition-colors duration-fast">
          Widgets
        </Link>
        <span className="text-stone-light">/</span>
        <span className="text-sm text-ink font-medium">New Widget</span>
      </div>

      <h1 className="page-heading">Create a new widget</h1>
      <p className="mt-2 text-sm text-stone">
        Name your widget, pick a template, and start customizing.
        <span className="ml-2 text-xs text-stone-light">
          ({planCheck.widgetCount}/{planCheck.widgetLimit} widgets used)
        </span>
      </p>

      {error !== null && (
        <div className="mt-4 p-3 rounded-sm bg-danger-light text-danger text-sm border border-danger/20">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-6 space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="widgetName" className="input-label">Widget Name</label>
            <input
              id="widgetName"
              type="text"
              placeholder="e.g. Main Website"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input-field"
            />
          </div>
          <div>
            <label htmlFor="widgetDomain" className="input-label">Domain (optional)</label>
            <input
              id="widgetDomain"
              type="text"
              placeholder="e.g. example.com"
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              className="input-field"
            />
          </div>
        </div>

        <div>
          <h2 className="font-display text-lg font-semibold text-ink mb-3">Choose a template</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {TEMPLATES.map((template) => (
              <button
                key={template.id}
                type="button"
                onClick={() => setSelectedTemplate(template.id)}
                className={`text-left p-4 rounded-md border transition-colors duration-fast ${
                  selectedTemplate === template.id
                    ? 'border-signal bg-signal-light'
                    : 'border-border hover:border-border-dark'
                }`}
              >
                <p className="font-body text-sm font-semibold text-ink">{template.name}</p>
                {template.steps > 0 && (
                  <p className="text-xs text-stone mt-0.5">{template.steps} steps</p>
                )}
                <p className="text-xs text-stone-light mt-1">{template.description}</p>
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? (
              <span className="inline-flex items-center gap-2">
                <span className="spinner w-4 h-4" />
                Creating...
              </span>
            ) : 'Create Widget'}
          </button>
          <Link href="/dashboard/widgets" className="btn-ghost">Cancel</Link>
        </div>
      </form>
    </div>
  );
}
