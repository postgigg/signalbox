'use client';

import Link from 'next/link';
import { useState, useEffect, useCallback, use } from 'react';

import type { FormEvent } from 'react';

interface RoutingRule {
  readonly id: string;
  readonly name: string;
  readonly priority: number;
  readonly is_active: boolean;
  readonly match_tier: string | null;
  readonly match_step_id: string | null;
  readonly match_option_id: string | null;
  readonly assign_to_member_id: string;
  readonly widget_id: string | null;
  readonly created_at: string;
}

interface TeamMember {
  readonly id: string;
  readonly invited_email: string | null;
  readonly role: string;
}

interface ApiResponse<T> {
  data?: T;
  error?: string;
}

export default function WidgetRoutingPage({
  params,
}: {
  readonly params: Promise<{ id: string }>;
}): React.ReactElement {
  const resolvedParams = use(params instanceof Promise ? params : Promise.resolve(params));
  const { id: widgetId } = resolvedParams;

  const [rules, setRules] = useState<RoutingRule[]>([]);
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [creating, setCreating] = useState(false);
  const [accountPlan, setAccountPlan] = useState<string>('trial');
  const [widgetName, setWidgetName] = useState<string>('Widget');

  // Form state
  const [formName, setFormName] = useState('');
  const [formMatchType, setFormMatchType] = useState<'tier' | 'answer'>('tier');
  const [formTier, setFormTier] = useState<'hot' | 'warm' | 'cold'>('hot');
  const [formStepId, setFormStepId] = useState('');
  const [formOptionId, setFormOptionId] = useState('');
  const [formPriority, setFormPriority] = useState(0);
  const [formMemberId, setFormMemberId] = useState('');

  const loadRules = useCallback(async (): Promise<void> => {
    try {
      const res = await fetch(`/api/v1/widgets/${widgetId}/routing-rules`);
      if (res.ok) {
        const json: ApiResponse<RoutingRule[]> = await res.json() as ApiResponse<RoutingRule[]>;
        if (json.data) {
          setRules(json.data);
        }
      }
    } catch {
      setError('Failed to load routing rules.');
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

        // Load widget name for breadcrumb
        const { data: widgetData } = await supabase
          .from('widgets')
          .select('name')
          .eq('id', widgetId)
          .single();

        if (widgetData) {
          setWidgetName(widgetData.name);
        }

        // Load team members for assignee dropdown
        const { data: teamMembers } = await supabase
          .from('members')
          .select('id, invited_email, role')
          .eq('account_id', memberData.account_id)
          .order('created_at', { ascending: true });

        setMembers((teamMembers as TeamMember[]) ?? []);
      } catch {
        // Failed to load account data
      }
      await loadRules();
    }
    void init();
  }, [loadRules, widgetId]);

  function resetForm(): void {
    setFormName('');
    setFormMatchType('tier');
    setFormTier('hot');
    setFormStepId('');
    setFormOptionId('');
    setFormPriority(0);
    setFormMemberId('');
    setShowForm(false);
    setError(null);
  }

  async function handleCreate(e: FormEvent<HTMLFormElement>): Promise<void> {
    e.preventDefault();
    setError(null);
    setCreating(true);

    try {
      const body: Record<string, unknown> = {
        name: formName,
        priority: formPriority,
        assignToMemberId: formMemberId,
      };

      if (formMatchType === 'tier') {
        body.matchTier = formTier;
      } else {
        body.matchStepId = formStepId;
        body.matchOptionId = formOptionId;
      }

      const res = await fetch(`/api/v1/widgets/${widgetId}/routing-rules`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const json: ApiResponse<RoutingRule> = await res.json() as ApiResponse<RoutingRule>;

      if (!res.ok) {
        setError(json.error ?? 'Failed to create rule.');
        return;
      }

      resetForm();
      await loadRules();
    } catch {
      setError('Failed to create rule.');
    } finally {
      setCreating(false);
    }
  }

  async function handleToggle(ruleId: string, currentActive: boolean): Promise<void> {
    try {
      const res = await fetch(`/api/v1/routing-rules/${ruleId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !currentActive }),
      });
      if (res.ok) {
        setRules((prev) => prev.map((r) =>
          r.id === ruleId ? { ...r, is_active: !currentActive } : r
        ));
      }
    } catch {
      setError('Failed to toggle rule.');
    }
  }

  async function handleDelete(ruleId: string): Promise<void> {
    if (!confirm('Delete this routing rule?')) return;
    try {
      const res = await fetch(`/api/v1/routing-rules/${ruleId}`, { method: 'DELETE' });
      if (res.ok) {
        setRules((prev) => prev.filter((r) => r.id !== ruleId));
      }
    } catch {
      setError('Failed to delete rule.');
    }
  }

  function getMemberLabel(memberId: string): string {
    const m = members.find((mem) => mem.id === memberId);
    return m?.invited_email ?? memberId.slice(0, 8);
  }

  const isAgency = accountPlan === 'agency';

  return (
    <div>
      <div className="flex items-center gap-2 text-sm text-stone font-body mb-4">
        <Link href="/dashboard/widgets" className="hover:text-ink transition-colors duration-fast">Widgets</Link>
        <span>/</span>
        <Link href={`/dashboard/widgets/${widgetId}`} className="hover:text-ink transition-colors duration-fast">{widgetName}</Link>
        <span>/</span>
        <span className="text-ink">Routing</span>
      </div>

      <h1 className="page-heading">Widget Routing Rules</h1>
      <p className="mt-1 text-sm text-stone font-body">
        Auto-assign leads from this widget to team members based on score tier or flow answers.
      </p>

      {error !== null && (
        <div className="mt-4 p-3 rounded-sm bg-danger-light text-danger text-sm border border-danger/20">
          {error}
        </div>
      )}

      {!isAgency && !loading && (
        <div className="mt-4 card text-center py-10">
          <p className="text-sm text-stone">
            Per-widget routing rules are available on the Agency plan.
          </p>
          <Link
            href="/dashboard/settings/billing"
            className="btn-primary mt-4 inline-block h-9 text-sm"
          >
            Upgrade Plan
          </Link>
        </div>
      )}

      {isAgency && (
        <>
          <div className="mt-4 flex justify-end">
            {!showForm && (
              <button
                type="button"
                onClick={() => setShowForm(true)}
                className="btn-primary h-9 text-sm"
              >
                Add Rule
              </button>
            )}
          </div>

          {showForm && (
            <form onSubmit={handleCreate} className="mt-4 card p-5 space-y-4">
              <h3 className="font-display text-base font-semibold text-ink">New Routing Rule</h3>

              <div>
                <label htmlFor="rule-name" className="label-text">Rule Name</label>
                <input
                  id="rule-name"
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  required
                  maxLength={200}
                  className="input-field h-10 w-full mt-1"
                  placeholder="e.g. Hot leads to Jason"
                />
              </div>

              <div>
                <label htmlFor="match-type" className="label-text">Match Type</label>
                <select
                  id="match-type"
                  value={formMatchType}
                  onChange={(e) => setFormMatchType(e.target.value as 'tier' | 'answer')}
                  className="input-field h-10 w-full mt-1"
                >
                  <option value="tier">Score Tier</option>
                  <option value="answer">Flow Answer</option>
                </select>
              </div>

              {formMatchType === 'tier' ? (
                <div>
                  <label htmlFor="tier-select" className="label-text">Tier</label>
                  <select
                    id="tier-select"
                    value={formTier}
                    onChange={(e) => setFormTier(e.target.value as 'hot' | 'warm' | 'cold')}
                    className="input-field h-10 w-full mt-1"
                  >
                    <option value="hot">Hot</option>
                    <option value="warm">Warm</option>
                    <option value="cold">Cold</option>
                  </select>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="step-id" className="label-text">Step ID</label>
                    <input
                      id="step-id"
                      type="text"
                      value={formStepId}
                      onChange={(e) => setFormStepId(e.target.value)}
                      required
                      maxLength={50}
                      className="input-field h-10 w-full mt-1"
                      placeholder="e.g. step-1"
                    />
                  </div>
                  <div>
                    <label htmlFor="option-id" className="label-text">Option ID</label>
                    <input
                      id="option-id"
                      type="text"
                      value={formOptionId}
                      onChange={(e) => setFormOptionId(e.target.value)}
                      required
                      maxLength={50}
                      className="input-field h-10 w-full mt-1"
                      placeholder="e.g. option-a"
                    />
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="priority" className="label-text">Priority (higher wins)</label>
                  <input
                    id="priority"
                    type="number"
                    min={0}
                    max={100}
                    value={formPriority}
                    onChange={(e) => setFormPriority(Number(e.target.value))}
                    className="input-field h-10 w-full mt-1"
                  />
                </div>
                <div>
                  <label htmlFor="assignee" className="label-text">Assign To</label>
                  <select
                    id="assignee"
                    value={formMemberId}
                    onChange={(e) => setFormMemberId(e.target.value)}
                    required
                    className="input-field h-10 w-full mt-1"
                  >
                    <option value="">Select member</option>
                    {members.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.invited_email ?? m.id.slice(0, 8)} ({m.role})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex gap-2">
                <button type="submit" disabled={creating} className="btn-primary h-9 text-sm">
                  {creating ? (
                    <span className="inline-flex items-center gap-2">
                      <span className="spinner w-4 h-4" />
                      Creating...
                    </span>
                  ) : 'Create Rule'}
                </button>
                <button type="button" onClick={resetForm} className="btn-secondary h-9 text-sm">
                  Cancel
                </button>
              </div>
            </form>
          )}

          {/* Rules List */}
          <div className="mt-6">
            {loading ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="card p-4">
                    <div className="skeleton h-4 w-48" />
                    <div className="mt-2 skeleton h-3 w-32" />
                  </div>
                ))}
              </div>
            ) : rules.length === 0 ? (
              <div className="card text-center py-10">
                <p className="text-sm text-stone">
                  No routing rules for this widget yet. Rules you create here only apply to leads from this widget.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="table-header">
                      <th className="text-left py-3 px-4 font-medium">Name</th>
                      <th className="text-left py-3 px-4 font-medium">Match</th>
                      <th className="text-left py-3 px-4 font-medium">Assign To</th>
                      <th className="text-left py-3 px-4 font-medium">Priority</th>
                      <th className="text-left py-3 px-4 font-medium">Status</th>
                      <th className="text-right py-3 px-4 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rules.map((rule) => (
                      <tr key={rule.id} className="table-row">
                        <td className="py-3 px-4 font-medium text-ink">{rule.name}</td>
                        <td className="py-3 px-4 text-stone">
                          {rule.match_tier !== null ? (
                            <span className="text-xs px-2 py-0.5 rounded-pill bg-surface-alt">{rule.match_tier} tier</span>
                          ) : (
                            <span className="text-xs font-mono">{rule.match_step_id}:{rule.match_option_id}</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-stone">{getMemberLabel(rule.assign_to_member_id)}</td>
                        <td className="py-3 px-4 text-stone">{rule.priority}</td>
                        <td className="py-3 px-4">
                          <button
                            type="button"
                            onClick={() => void handleToggle(rule.id, rule.is_active)}
                            className={`text-xs px-2 py-0.5 rounded-pill ${
                              rule.is_active
                                ? 'bg-success-light text-success'
                                : 'bg-surface-alt text-stone'
                            }`}
                          >
                            {rule.is_active ? 'Active' : 'Paused'}
                          </button>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            type="button"
                            onClick={() => void handleDelete(rule.id)}
                            className="text-xs text-danger hover:text-danger/80 transition-colors duration-fast"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
