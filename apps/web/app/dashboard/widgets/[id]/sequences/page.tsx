'use client';

import Link from 'next/link';
import { useState, useEffect, useCallback, use } from 'react';

import { HelpTip } from '@/components/shared/HelpTip';
import { PageGuide } from '@/components/shared/PageGuide';
import { DRIP_TEMPLATE_VARIABLES, DRIP_DEFAULT_STEPS } from '@/lib/constants';
import { HELP_TIPS } from '@/lib/help-content';

import type { FormEvent } from 'react';

interface DripStepData {
  stepOrder: number;
  delayHours: number;
  subject: string;
  bodyHtml: string;
  bodyText: string;
}

interface SequenceData {
  readonly id: string;
  readonly name: string;
  readonly target_tier: 'warm' | 'cold';
  readonly is_active: boolean;
  readonly created_at: string;
  readonly steps: ReadonlyArray<{
    readonly id: string;
    readonly step_order: number;
    readonly delay_hours: number;
    readonly subject: string;
    readonly body_html: string;
    readonly body_text: string;
  }>;
  readonly activeEnrollments: number;
}

interface ApiResponse<T> {
  data?: T;
  error?: string;
  details?: Record<string, string[]>;
}

const EMPTY_STEP: DripStepData = {
  stepOrder: 1,
  delayHours: 24,
  subject: '',
  bodyHtml: '',
  bodyText: '',
};

function getDefaultSteps(): DripStepData[] {
  return DRIP_DEFAULT_STEPS.map((s) => ({
    stepOrder: s.stepOrder,
    delayHours: s.delayHours,
    subject: s.subject,
    bodyHtml: s.bodyHtml,
    bodyText: s.bodyText,
  }));
}

export default function WidgetSequencesPage({
  params,
}: {
  readonly params: Promise<{ id: string }>;
}): React.ReactElement {
  const resolvedParams = use(params instanceof Promise ? params : Promise.resolve(params));
  const { id: widgetId } = resolvedParams;

  const [sequences, setSequences] = useState<SequenceData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [accountPlan, setAccountPlan] = useState<string>('trial');
  const [togglingId, setTogglingId] = useState<string | null>(null);

  // Form state
  const [formName, setFormName] = useState('');
  const [formTier, setFormTier] = useState<'warm' | 'cold'>('warm');
  const [formSteps, setFormSteps] = useState<DripStepData[]>(getDefaultSteps());

  const loadSequences = useCallback(async (): Promise<void> => {
    try {
      const res = await fetch(`/api/v1/widgets/${widgetId}/sequences`);
      const json: ApiResponse<SequenceData[]> = await res.json() as ApiResponse<SequenceData[]>;
      if (json.data) {
        setSequences(json.data);
      }
    } catch {
      setError('Failed to load sequences.');
    } finally {
      setLoading(false);
    }
  }, [widgetId]);

  useEffect(() => {
    async function init(): Promise<void> {
      try {
        const { createBrowserClient } = await import('@supabase/ssr');
        const supabase = createBrowserClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL ?? '',
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '',
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
      } catch {
        // Failed to load plan
      }
      await loadSequences();
    }
    void init();
  }, [loadSequences]);

  function resetForm(): void {
    setFormName('');
    setFormTier('warm');
    setFormSteps(getDefaultSteps());
    setEditingId(null);
    setShowForm(false);
    setError(null);
  }

  function startCreate(): void {
    resetForm();
    setShowForm(true);
  }

  function startEdit(seq: SequenceData): void {
    setEditingId(seq.id);
    setFormName(seq.name);
    setFormTier(seq.target_tier);
    setFormSteps(
      seq.steps.map((s) => ({
        stepOrder: s.step_order,
        delayHours: s.delay_hours,
        subject: s.subject,
        bodyHtml: s.body_html,
        bodyText: s.body_text,
      })),
    );
    setShowForm(true);
    setError(null);
  }

  function addStep(): void {
    if (formSteps.length >= 5) return;
    setFormSteps((prev) => [
      ...prev,
      { ...EMPTY_STEP, stepOrder: prev.length + 1, delayHours: 72 },
    ]);
  }

  function removeStep(index: number): void {
    if (formSteps.length <= 2) return;
    setFormSteps((prev) => {
      const next = prev.filter((_, i) => i !== index);
      return next.map((s, i) => ({ ...s, stepOrder: i + 1 }));
    });
  }

  function updateStep(index: number, field: keyof DripStepData, value: string | number): void {
    setFormSteps((prev) =>
      prev.map((s, i) => (i === index ? { ...s, [field]: value } : s)),
    );
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>): Promise<void> {
    e.preventDefault();
    setError(null);
    setSaving(true);

    try {
      const payload = {
        name: formName,
        targetTier: formTier,
        steps: formSteps,
      };

      const url = editingId
        ? `/api/v1/widgets/${widgetId}/sequences/${editingId}`
        : `/api/v1/widgets/${widgetId}/sequences`;
      const method = editingId ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const json: ApiResponse<SequenceData> = await res.json() as ApiResponse<SequenceData>;

      if (!res.ok) {
        setError(json.error ?? 'Failed to save sequence.');
        return;
      }

      resetForm();
      await loadSequences();
    } catch {
      setError('Failed to save sequence.');
    } finally {
      setSaving(false);
    }
  }

  async function handleToggle(seq: SequenceData): Promise<void> {
    setTogglingId(seq.id);
    try {
      const res = await fetch(`/api/v1/widgets/${widgetId}/sequences/${seq.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !seq.is_active }),
      });

      if (!res.ok) {
        const json: ApiResponse<never> = await res.json() as ApiResponse<never>;
        setError(json.error ?? 'Failed to toggle sequence.');
        return;
      }

      await loadSequences();
    } catch {
      setError('Failed to toggle sequence.');
    } finally {
      setTogglingId(null);
    }
  }

  async function handleDelete(id: string): Promise<void> {
    if (!confirm('Delete this sequence? Active enrollments will be cancelled.')) return;
    try {
      const res = await fetch(`/api/v1/widgets/${widgetId}/sequences/${id}`, { method: 'DELETE' });
      if (!res.ok) {
        const json: ApiResponse<never> = await res.json() as ApiResponse<never>;
        setError(json.error ?? 'Failed to delete sequence.');
        return;
      }
      await loadSequences();
    } catch {
      setError('Failed to delete sequence.');
    }
  }

  const isPlanGated = accountPlan === 'trial' || accountPlan === 'starter';

  return (
    <div>
      <div className="flex items-center gap-2 text-sm text-stone font-body mb-4">
        <Link href="/dashboard/widgets" className="hover:text-ink transition-colors duration-fast">Widgets</Link>
        <span>/</span>
        <Link href={`/dashboard/widgets/${widgetId}`} className="hover:text-ink transition-colors duration-fast">Widget</Link>
        <span>/</span>
        <span className="text-ink">Sequences</span>
      </div>

      <h1 className="page-heading">Drip Sequences</h1>
      <p className="mt-1 text-sm text-stone font-body">
        Auto-nurture warm and cold leads with timed email sequences for this widget.
      </p>

      <PageGuide storageKey="sequences" title="How drip sequences work">
        {HELP_TIPS.sequences.pageGuide}
      </PageGuide>

      <div className="mt-4 flex items-center justify-between">
        {!isPlanGated && !showForm && (
          <button type="button" onClick={startCreate} className="btn-primary h-9 text-sm ml-auto">
            New Sequence
          </button>
        )}
      </div>

      {error !== null && (
        <div className="mt-4 p-3 rounded-sm bg-danger-light text-danger text-sm border border-danger/20">
          {error}
        </div>
      )}

      {isPlanGated && (
        <div className="mt-4 card text-center py-10">
          <p className="text-sm text-stone">
            Drip sequences are available on Pro and Agency plans.
          </p>
          <Link
            href="/dashboard/settings/billing"
            className="btn-primary mt-4 inline-block h-9 text-sm"
          >
            Upgrade Plan
          </Link>
        </div>
      )}

      {!isPlanGated && showForm && (
        <form onSubmit={handleSubmit} className="mt-4 card space-y-4">
          <h3 className="font-display text-base font-semibold text-ink">
            {editingId ? 'Edit Sequence' : 'New Sequence'}
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="seq-name" className="label-text">Name</label>
              <input
                id="seq-name"
                type="text"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                required
                maxLength={100}
                className="input-field h-10 w-full mt-1"
                placeholder="Warm lead follow-up"
              />
            </div>
            <div>
              <label htmlFor="seq-tier" className="label-text">
                Target Tier
                <HelpTip text={HELP_TIPS.sequences.targetTier} />
              </label>
              <select
                id="seq-tier"
                value={formTier}
                onChange={(e) => setFormTier(e.target.value as 'warm' | 'cold')}
                className="input-field h-10 w-full mt-1"
              >
                <option value="warm">Warm</option>
                <option value="cold">Cold</option>
              </select>
            </div>
          </div>

          {/* Steps */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="label-text">Steps ({formSteps.length}/5)</span>
              {formSteps.length < 5 && (
                <button type="button" onClick={addStep} className="text-xs text-signal hover:text-signal/80 transition-colors duration-fast">
                  Add Step
                </button>
              )}
            </div>

            {formSteps.map((step, index) => (
              <div key={step.stepOrder} className="border border-border rounded-md p-4 mb-3">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-ink">Step {step.stepOrder}</span>
                  <div className="flex items-center gap-3">
                    <label htmlFor={`delay-${index}`} className="text-xs text-stone">
                      Delay (hours)
                      <HelpTip text={HELP_TIPS.sequences.delay} position="left" />
                    </label>
                    <input
                      id={`delay-${index}`}
                      type="number"
                      min={1}
                      max={720}
                      value={step.delayHours}
                      onChange={(e) => updateStep(index, 'delayHours', parseInt(e.target.value, 10) || 1)}
                      className="input-field h-8 w-20 text-sm"
                    />
                    {formSteps.length > 2 && (
                      <button
                        type="button"
                        onClick={() => removeStep(index)}
                        className="text-xs text-danger hover:text-danger/80 transition-colors duration-fast"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                </div>

                <div className="mb-2">
                  <label htmlFor={`subject-${index}`} className="text-xs text-stone">Subject</label>
                  <input
                    id={`subject-${index}`}
                    type="text"
                    value={step.subject}
                    onChange={(e) => updateStep(index, 'subject', e.target.value)}
                    required
                    maxLength={200}
                    className="input-field h-9 w-full mt-1 text-sm"
                  />
                </div>

                <div className="mb-2">
                  <label htmlFor={`body-html-${index}`} className="text-xs text-stone">Body (HTML)</label>
                  <textarea
                    id={`body-html-${index}`}
                    value={step.bodyHtml}
                    onChange={(e) => updateStep(index, 'bodyHtml', e.target.value)}
                    required
                    maxLength={10000}
                    rows={4}
                    className="input-field w-full mt-1 text-sm font-mono"
                  />
                </div>

                <div>
                  <label htmlFor={`body-text-${index}`} className="text-xs text-stone">Body (plain text)</label>
                  <textarea
                    id={`body-text-${index}`}
                    value={step.bodyText}
                    onChange={(e) => updateStep(index, 'bodyText', e.target.value)}
                    required
                    maxLength={10000}
                    rows={3}
                    className="input-field w-full mt-1 text-sm"
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Variable Reference */}
          <div className="p-3 bg-surface-alt rounded-md">
            <p className="text-xs font-medium text-ink mb-1">
              Available variables
              <HelpTip text={HELP_TIPS.sequences.variables} />
            </p>
            <div className="flex flex-wrap gap-2">
              {DRIP_TEMPLATE_VARIABLES.map((v) => (
                <code key={v} className="text-xs bg-white px-2 py-0.5 rounded border border-border text-stone">
                  {v}
                </code>
              ))}
            </div>
          </div>

          <div className="flex gap-2">
            <button type="submit" disabled={saving} className="btn-primary h-9 text-sm">
              {saving ? (
                <span className="inline-flex items-center gap-2">
                  <span className="spinner w-4 h-4" />
                  Saving...
                </span>
              ) : editingId ? 'Update Sequence' : 'Create Sequence'}
            </button>
            <button type="button" onClick={resetForm} className="btn-secondary h-9 text-sm">
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Sequence List */}
      {!isPlanGated && !showForm && (
        <div className="mt-4">
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 2 }).map((_, i) => (
                <div key={i} className="card p-4">
                  <div className="skeleton h-4 w-32 mb-2" />
                  <div className="skeleton h-3 w-48" />
                </div>
              ))}
            </div>
          ) : sequences.length === 0 ? (
            <div className="card text-center py-10">
              <p className="text-sm text-stone">
                No drip sequences yet. Create one to auto-nurture warm and cold leads.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {sequences.map((seq) => (
                <div key={seq.id} className="card p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <h3 className="text-sm font-medium text-ink">{seq.name}</h3>
                      <span
                        className={`text-xs px-2 py-0.5 rounded-pill font-medium ${
                          seq.target_tier === 'warm'
                            ? 'bg-warning-light text-warning'
                            : 'bg-signal-light text-signal'
                        }`}
                      >
                        {seq.target_tier.charAt(0).toUpperCase() + seq.target_tier.slice(1)}
                      </span>
                      {seq.is_active && (
                        <span className="text-xs px-2 py-0.5 rounded-pill font-medium bg-success-light text-success">
                          Active
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-stone">
                        {seq.steps.length} step{seq.steps.length === 1 ? '' : 's'}
                      </span>
                      {seq.activeEnrollments > 0 && (
                        <span className="text-xs text-stone">
                          {seq.activeEnrollments} enrolled
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={() => void handleToggle(seq)}
                        disabled={togglingId === seq.id}
                        className={`text-xs px-3 py-1 rounded-md border transition-colors duration-fast ${
                          seq.is_active
                            ? 'border-danger/30 text-danger hover:bg-danger-light'
                            : 'border-success/30 text-success hover:bg-success-light'
                        }`}
                      >
                        {togglingId === seq.id ? '...' : seq.is_active ? 'Deactivate' : 'Activate'}
                      </button>
                      <button
                        type="button"
                        onClick={() => startEdit(seq)}
                        className="text-xs text-signal hover:text-signal/80 transition-colors duration-fast"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => void handleDelete(seq.id)}
                        className="text-xs text-danger hover:text-danger/80 transition-colors duration-fast"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
