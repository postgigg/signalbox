'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

import type { FormEvent } from 'react';

const STEP_LABELS = ['Account', 'Template', 'Widget'] as const;

const ONBOARDING_TEMPLATES = [
  { id: 'home_services', name: 'Home Services', description: 'HVAC, plumbing, roofing, landscaping' },
  { id: 'legal', name: 'Legal', description: 'Law firms, attorneys, legal services' },
  { id: 'medical', name: 'Medical', description: 'Clinics, dental, dermatology, therapy' },
  { id: 'agency', name: 'Agency', description: 'Marketing, design, development agencies' },
  { id: 'real_estate', name: 'Real Estate', description: 'Agents, brokers, property managers' },
  { id: 'consulting', name: 'Consulting', description: 'Business, IT, management consulting' },
] as const;

type StepKey = 'account' | 'template' | 'widget';

const STEP_ORDER: readonly StepKey[] = ['account', 'template', 'widget'];

function stepIndex(step: StepKey): number {
  return STEP_ORDER.indexOf(step);
}

export default function OnboardingPage(): React.ReactElement {
  const router = useRouter();

  const [step, setStep] = useState<StepKey>('account');
  const [accountName, setAccountName] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [widgetName, setWidgetName] = useState('');
  const [domain, setDomain] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleAccountSubmit(e: FormEvent<HTMLFormElement>): void {
    e.preventDefault();
    if (accountName.trim().length === 0) {
      setError('Enter your business or team name.');
      return;
    }
    setError(null);
    setStep('template');
  }

  function handleTemplateSelect(id: string): void {
    setSelectedTemplate(id);
    setError(null);
    setStep('widget');
  }

  async function handleFinish(e: FormEvent<HTMLFormElement>): Promise<void> {
    e.preventDefault();
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

      const slug = accountName
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');

      const { data: account, error: accountError } = await supabase
        .from('accounts')
        .insert({
          name: accountName.trim(),
          slug,
          owner_id: user.id,
          notification_email: user.email,
        })
        .select('id')
        .single();

      if (accountError ?? !account) {
        setError(accountError?.message ?? 'Failed to create account.');
        setLoading(false);
        return;
      }

      const { error: memberError } = await supabase
        .from('members')
        .insert({
          account_id: account.id,
          user_id: user.id,
          role: 'owner',
          accepted_at: new Date().toISOString(),
        });

      if (memberError) {
        setError(memberError.message);
        setLoading(false);
        return;
      }

      const { data: widget, error: widgetError } = await supabase
        .from('widgets')
        .insert({
          account_id: account.id,
          name: widgetName.trim() || 'My Widget',
          domain: domain.trim() || null,
        })
        .select('id')
        .single();

      if (widgetError ?? !widget) {
        setError(widgetError?.message ?? 'Failed to create widget.');
        setLoading(false);
        return;
      }

      // Copy template flow if one was selected
      if (selectedTemplate) {
        const { data: template } = await supabase
          .from('flow_templates')
          .select('steps')
          .eq('industry', selectedTemplate)
          .limit(1)
          .maybeSingle();

        if (template) {
          await supabase.from('flows').insert({
            widget_id: widget.id,
            version: 1,
            is_active: true,
            steps: template.steps,
          });
        }
      }

      router.push(`/dashboard/widgets/${widget.id}/flow`);
      router.refresh();
    } catch {
      setError('Something went wrong. Please try again.');
      setLoading(false);
    }
  }

  const currentIndex = stepIndex(step);

  return (
    <div className="w-full max-w-lg mx-auto">
      {/* Progress bar */}
      <div className="flex items-center gap-2 mb-10">
        {STEP_LABELS.map((label, i) => (
          <div key={label} className="flex items-center gap-2">
            <div className="flex items-center gap-2">
              <div
                className={`w-7 h-7 rounded-pill flex items-center justify-center text-xs font-medium font-body transition-colors duration-fast ${
                  i <= currentIndex
                    ? 'bg-ink text-white'
                    : 'bg-surface-alt text-stone-light border border-border'
                }`}
              >
                {i < currentIndex ? (
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  i + 1
                )}
              </div>
              <span
                className={`text-xs font-body hidden sm:inline ${
                  i <= currentIndex ? 'text-ink font-medium' : 'text-stone-light'
                }`}
              >
                {label}
              </span>
            </div>
            {i < 2 && (
              <div
                className={`w-8 sm:w-12 h-px transition-colors duration-fast ${
                  i < currentIndex ? 'bg-ink' : 'bg-border'
                }`}
              />
            )}
          </div>
        ))}
      </div>

      {error !== null && (
        <div className="mb-6 p-3 rounded-sm bg-danger-light text-danger text-sm font-body border border-danger/20">
          {error}
        </div>
      )}

      {/* Step 1: Account */}
      {step === 'account' && (
        <div>
          <h1 className="font-display text-2xl font-semibold text-ink">
            Name your account
          </h1>
          <p className="mt-2 text-sm text-stone font-body">
            Your business or team name. You can change this later.
          </p>
          <form onSubmit={handleAccountSubmit} className="mt-8 space-y-4">
            <div>
              <label htmlFor="accountName" className="input-label">
                Account name
              </label>
              <input
                id="accountName"
                type="text"
                value={accountName}
                onChange={(e) => setAccountName(e.target.value)}
                placeholder="e.g. Acme Plumbing"
                required
                className="input-field"
                autoFocus
                maxLength={100}
              />
            </div>
            <button type="submit" className="btn-primary w-full h-12">
              Continue
            </button>
          </form>
        </div>
      )}

      {/* Step 2: Template */}
      {step === 'template' && (
        <div>
          <h1 className="font-display text-2xl font-semibold text-ink">
            Pick a starting template
          </h1>
          <p className="mt-2 text-sm text-stone font-body">
            Choose the industry closest to yours. Every question and score weight can be customized later.
          </p>
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-3">
            {ONBOARDING_TEMPLATES.map((template) => (
              <button
                key={template.id}
                type="button"
                onClick={() => handleTemplateSelect(template.id)}
                className="text-left p-4 rounded-md border border-border transition-all duration-fast hover:border-border-dark hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-signal focus:ring-offset-2"
              >
                <p className="font-body text-sm font-semibold text-ink">
                  {template.name}
                </p>
                <p className="text-xs text-stone mt-1">{template.description}</p>
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={() => { setStep('account'); setError(null); }}
            className="btn-ghost mt-4"
          >
            Back
          </button>
        </div>
      )}

      {/* Step 3: Widget */}
      {step === 'widget' && (
        <div>
          <h1 className="font-display text-2xl font-semibold text-ink">
            Set up your first widget
          </h1>
          <p className="mt-2 text-sm text-stone font-body">
            Give it a name and tell us where it will live.
          </p>
          <form onSubmit={handleFinish} className="mt-8 space-y-4">
            <div>
              <label htmlFor="widgetName" className="input-label">
                Widget name
              </label>
              <input
                id="widgetName"
                type="text"
                value={widgetName}
                onChange={(e) => setWidgetName(e.target.value)}
                placeholder="e.g. Main Website"
                className="input-field"
                maxLength={100}
              />
            </div>
            <div>
              <label htmlFor="domain" className="input-label">
                Website domain
                <span className="font-normal text-stone-light ml-1">(optional)</span>
              </label>
              <input
                id="domain"
                type="text"
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                placeholder="e.g. example.com"
                className="input-field"
                maxLength={253}
              />
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full h-12">
              {loading ? (
                <span className="inline-flex items-center gap-2">
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Creating...
                </span>
              ) : (
                'Create Widget'
              )}
            </button>
            <button
              type="button"
              onClick={() => { setStep('template'); setError(null); }}
              className="btn-ghost w-full"
            >
              Back
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
