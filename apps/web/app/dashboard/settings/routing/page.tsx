'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';

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

const SETTINGS_NAV = [
  { href: '/dashboard/settings', label: 'Account' },
  { href: '/dashboard/settings/team', label: 'Team' },
  { href: '/dashboard/settings/billing', label: 'Billing' },
  { href: '/dashboard/settings/notifications', label: 'Notifications' },
  { href: '/dashboard/settings/api', label: 'API' },
  { href: '/dashboard/settings/routing', label: 'Routing' },
  { href: '/dashboard/settings/sequences', label: 'Sequences' },
] as const;

export default function RoutingSettingsPage(): React.ReactElement {
  const [rules, setRules] = useState<RoutingRule[]>([]);
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [planAllowed, setPlanAllowed] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [creating, setCreating] = useState(false);

  // Form state
  const [formName, setFormName] = useState('');
  const [formMatchType, setFormMatchType] = useState<'tier' | 'answer'>('tier');
  const [formTier, setFormTier] = useState<'hot' | 'warm' | 'cold'>('hot');
  const [formStepId, setFormStepId] = useState('');
  const [formOptionId, setFormOptionId] = useState('');
  const [formPriority, setFormPriority] = useState(0);
  const [formMemberId, setFormMemberId] = useState('');

  useEffect(() => {
    async function load(): Promise<void> {
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

        const { data: accountData } = await supabase
          .from('accounts')
          .select('plan')
          .eq('id', memberData.account_id)
          .single();

        if (accountData && (accountData.plan === 'pro' || accountData.plan === 'agency')) {
          setPlanAllowed(true);
        }

        // Load members for assignee dropdown
        const { data: teamMembers } = await supabase
          .from('members')
          .select('id, invited_email, role')
          .eq('account_id', memberData.account_id)
          .order('created_at', { ascending: true });

        setMembers((teamMembers as TeamMember[]) ?? []);

        // Load rules
        const response = await fetch('/api/v1/routing-rules');
        if (response.ok) {
          const result = await response.json() as { data: RoutingRule[] };
          setRules(result.data);
        }
      } catch {
        // Failed to load
      } finally {
        setLoading(false);
      }
    }
    void load();
  }, []);

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

      const response = await fetch('/api/v1/routing-rules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const result = await response.json() as { error: string };
        setError(result.error);
        return;
      }

      const result = await response.json() as { data: RoutingRule };
      setRules((prev) => [result.data, ...prev]);
      setShowForm(false);
      setFormName('');
      setFormPriority(0);
    } catch {
      setError('Failed to create rule.');
    } finally {
      setCreating(false);
    }
  }

  async function handleToggle(ruleId: string, currentActive: boolean): Promise<void> {
    try {
      const response = await fetch(`/api/v1/routing-rules/${ruleId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !currentActive }),
      });
      if (response.ok) {
        setRules((prev) => prev.map((r) =>
          r.id === ruleId ? { ...r, is_active: !currentActive } : r
        ));
      }
    } catch {
      // Toggle failed
    }
  }

  async function handleDelete(ruleId: string): Promise<void> {
    if (!confirm('Delete this routing rule?')) return;
    try {
      const response = await fetch(`/api/v1/routing-rules/${ruleId}`, { method: 'DELETE' });
      if (response.ok) {
        setRules((prev) => prev.filter((r) => r.id !== ruleId));
      }
    } catch {
      // Delete failed
    }
  }

  function getMemberLabel(memberId: string): string {
    const m = members.find((mem) => mem.id === memberId);
    return m?.invited_email ?? memberId.slice(0, 8);
  }

  return (
    <div>
      <h1 className="page-heading">Settings</h1>

      <nav className="mt-4 flex gap-1 border-b border-border mb-6">
        {SETTINGS_NAV.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`px-4 py-2.5 text-sm font-body transition-colors duration-fast -mb-px ${
              item.href === '/dashboard/settings/routing'
                ? 'text-ink font-medium border-b-2 border-ink'
                : 'text-stone hover:text-ink border-b-2 border-transparent'
            }`}
          >
            {item.label}
          </Link>
        ))}
      </nav>

      <h2 className="font-display text-lg font-semibold text-ink">Lead Routing Rules</h2>
      <p className="mt-1 text-sm text-stone font-body">
        Auto-assign incoming leads to team members based on score tier or flow answers.
      </p>

      {!planAllowed && !loading && (
        <div className="mt-4 card p-6 text-center">
          <p className="text-sm text-stone">Lead routing is available on Pro and Agency plans.</p>
          <Link href="/dashboard/settings/billing" className="mt-2 inline-block text-sm text-signal hover:text-signal/80 transition-colors duration-fast">
            Upgrade your plan
          </Link>
        </div>
      )}

      {error !== null && (
        <div className="mt-4 p-3 rounded-sm bg-danger-light text-danger text-sm border border-danger/20">
          {error}
        </div>
      )}

      {planAllowed && (
        <>
          <div className="mt-4 flex justify-end">
            <button
              type="button"
              onClick={() => setShowForm(!showForm)}
              className="btn-primary text-sm"
            >
              {showForm ? 'Cancel' : 'Add Rule'}
            </button>
          </div>

          {showForm && (
            <form onSubmit={handleCreate} className="mt-4 card p-5 space-y-4">
              <div>
                <label htmlFor="rule-name" className="block text-sm font-medium text-ink mb-1">Rule Name</label>
                <input
                  id="rule-name"
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  required
                  className="input-field w-full"
                  placeholder="e.g. Hot leads to Sarah"
                />
              </div>
              <div>
                <label htmlFor="match-type" className="block text-sm font-medium text-ink mb-1">Match Type</label>
                <select
                  id="match-type"
                  value={formMatchType}
                  onChange={(e) => setFormMatchType(e.target.value as 'tier' | 'answer')}
                  className="input-field w-full"
                >
                  <option value="tier">Score Tier</option>
                  <option value="answer">Flow Answer</option>
                </select>
              </div>
              {formMatchType === 'tier' ? (
                <div>
                  <label htmlFor="tier-select" className="block text-sm font-medium text-ink mb-1">Tier</label>
                  <select
                    id="tier-select"
                    value={formTier}
                    onChange={(e) => setFormTier(e.target.value as 'hot' | 'warm' | 'cold')}
                    className="input-field w-full"
                  >
                    <option value="hot">Hot</option>
                    <option value="warm">Warm</option>
                    <option value="cold">Cold</option>
                  </select>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="step-id" className="block text-sm font-medium text-ink mb-1">Step ID</label>
                    <input
                      id="step-id"
                      type="text"
                      value={formStepId}
                      onChange={(e) => setFormStepId(e.target.value)}
                      required
                      className="input-field w-full"
                      placeholder="e.g. step-1"
                    />
                  </div>
                  <div>
                    <label htmlFor="option-id" className="block text-sm font-medium text-ink mb-1">Option ID</label>
                    <input
                      id="option-id"
                      type="text"
                      value={formOptionId}
                      onChange={(e) => setFormOptionId(e.target.value)}
                      required
                      className="input-field w-full"
                      placeholder="e.g. option-a"
                    />
                  </div>
                </div>
              )}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="priority" className="block text-sm font-medium text-ink mb-1">Priority (higher wins)</label>
                  <input
                    id="priority"
                    type="number"
                    min={0}
                    max={100}
                    value={formPriority}
                    onChange={(e) => setFormPriority(Number(e.target.value))}
                    className="input-field w-full"
                  />
                </div>
                <div>
                  <label htmlFor="assignee" className="block text-sm font-medium text-ink mb-1">Assign To</label>
                  <select
                    id="assignee"
                    value={formMemberId}
                    onChange={(e) => setFormMemberId(e.target.value)}
                    required
                    className="input-field w-full"
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
              <button type="submit" disabled={creating} className="btn-primary text-sm">
                {creating ? (
                  <span className="inline-flex items-center gap-2">
                    <span className="spinner w-4 h-4" />
                    Creating...
                  </span>
                ) : 'Create Rule'}
              </button>
            </form>
          )}

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
                <p className="text-sm text-stone">No routing rules configured yet.</p>
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
