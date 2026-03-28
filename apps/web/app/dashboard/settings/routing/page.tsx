'use client';

import Link from 'next/link';
import { useState, useEffect, useCallback } from 'react';

import { ROUTING_STRATEGIES } from '@/lib/constants';

import type { FormEvent } from 'react';
import type { RoutingStrategyValue } from '@/lib/constants';

interface RoutingRule {
  readonly id: string;
  readonly name: string;
  readonly priority: number;
  readonly is_active: boolean;
  readonly routing_strategy: RoutingStrategyValue;
  readonly match_tier: string | null;
  readonly match_step_id: string | null;
  readonly match_option_id: string | null;
  readonly assign_to_member_id: string | null;
  readonly match_country: string[] | null;
  readonly match_skill_tags: string[] | null;
  readonly match_score_min: number | null;
  readonly match_score_max: number | null;
  readonly round_robin_pool: string[] | null;
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
  { href: '/dashboard/settings/billing', label: 'Billing' },
  { href: '/dashboard/settings/notifications', label: 'Notifications' },
  { href: '/dashboard/settings/api', label: 'API' },
  { href: '/dashboard/settings/routing', label: 'Routing' },
  { href: '/dashboard/settings/scoring', label: 'Scoring' },
] as const;

interface StrategyOption {
  readonly value: string;
  readonly label: string;
  readonly description: string;
}

function getStrategyLabel(value: string): string {
  const match = (ROUTING_STRATEGIES as readonly StrategyOption[]).find((s: StrategyOption) => s.value === value);
  return match?.label ?? value;
}

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
  const [formStrategy, setFormStrategy] = useState<RoutingStrategyValue>('direct');
  const [formMatchType, setFormMatchType] = useState<'tier' | 'answer'>('tier');
  const [formTier, setFormTier] = useState<'hot' | 'warm' | 'cold'>('hot');
  const [formStepId, setFormStepId] = useState('');
  const [formOptionId, setFormOptionId] = useState('');
  const [formPriority, setFormPriority] = useState(0);
  const [formMemberId, setFormMemberId] = useState('');

  // Strategy-specific form state
  const [formSkillTags, setFormSkillTags] = useState<string[]>([]);
  const [formNewSkillTag, setFormNewSkillTag] = useState('');
  const [formCountries, setFormCountries] = useState<string[]>([]);
  const [formNewCountry, setFormNewCountry] = useState('');
  const [formScoreMin, setFormScoreMin] = useState(0);
  const [formScoreMax, setFormScoreMax] = useState(100);
  const [formRoundRobinPool, setFormRoundRobinPool] = useState<string[]>([]);

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
          setRules(result.data ?? []);
        }
      } catch {
        // Failed to load
      } finally {
        setLoading(false);
      }
    }
    void load();
  }, []);

  const handleAddSkillTag = useCallback((): void => {
    const trimmed = formNewSkillTag.trim().toLowerCase();
    if (trimmed.length === 0) return;
    if (formSkillTags.includes(trimmed)) return;
    setFormSkillTags((prev) => [...prev, trimmed]);
    setFormNewSkillTag('');
  }, [formNewSkillTag, formSkillTags]);

  const handleRemoveSkillTag = useCallback((tag: string): void => {
    setFormSkillTags((prev) => prev.filter((t) => t !== tag));
  }, []);

  const handleAddCountry = useCallback((): void => {
    const trimmed = formNewCountry.trim().toUpperCase();
    if (trimmed.length === 0) return;
    if (formCountries.includes(trimmed)) return;
    setFormCountries((prev) => [...prev, trimmed]);
    setFormNewCountry('');
  }, [formNewCountry, formCountries]);

  const handleRemoveCountry = useCallback((code: string): void => {
    setFormCountries((prev) => prev.filter((c) => c !== code));
  }, []);

  const handleToggleRoundRobin = useCallback((memberId: string): void => {
    setFormRoundRobinPool((prev) =>
      prev.includes(memberId)
        ? prev.filter((id) => id !== memberId)
        : [...prev, memberId]
    );
  }, []);

  function resetFormFields(): void {
    setFormName('');
    setFormStrategy('direct');
    setFormMatchType('tier');
    setFormTier('hot');
    setFormStepId('');
    setFormOptionId('');
    setFormPriority(0);
    setFormMemberId('');
    setFormSkillTags([]);
    setFormNewSkillTag('');
    setFormCountries([]);
    setFormNewCountry('');
    setFormScoreMin(0);
    setFormScoreMax(100);
    setFormRoundRobinPool([]);
  }

  async function handleCreate(e: FormEvent<HTMLFormElement>): Promise<void> {
    e.preventDefault();
    setError(null);
    setCreating(true);

    try {
      const body: Record<string, unknown> = {
        name: formName,
        priority: formPriority,
        routingStrategy: formStrategy,
      };

      // Strategy-specific fields
      switch (formStrategy) {
        case 'direct':
          body.assignToMemberId = formMemberId;
          if (formMatchType === 'tier') {
            body.matchTier = formTier;
          } else {
            body.matchStepId = formStepId;
            body.matchOptionId = formOptionId;
          }
          break;
        case 'skill':
          body.matchSkillTags = formSkillTags;
          if (formTier) {
            body.matchTier = formTier;
          }
          break;
        case 'geographic':
          body.matchCountry = formCountries;
          break;
        case 'value':
          body.matchScoreMin = formScoreMin;
          body.matchScoreMax = formScoreMax;
          body.assignToMemberId = formMemberId;
          break;
        case 'round_robin':
          body.roundRobinPool = formRoundRobinPool;
          break;
        case 'availability':
          // No extra config needed
          break;
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
      resetFormFields();
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

  function getRuleMatchDescription(rule: RoutingRule): string {
    switch (rule.routing_strategy) {
      case 'direct':
        if (rule.match_tier !== null) return `${rule.match_tier} tier`;
        if (rule.match_step_id !== null) return `${rule.match_step_id}:${rule.match_option_id ?? ''}`;
        return 'Direct';
      case 'skill':
        return rule.match_skill_tags?.join(', ') ?? 'Any skill';
      case 'geographic':
        return rule.match_country?.join(', ') ?? 'Any country';
      case 'value':
        return `Score ${String(rule.match_score_min ?? 0)}-${String(rule.match_score_max ?? 100)}`;
      case 'round_robin':
        return `${String(rule.round_robin_pool?.length ?? 0)} members`;
      case 'availability':
        return 'Online members';
      default:
        return 'Unknown';
    }
  }

  function getRuleAssignee(rule: RoutingRule): string {
    switch (rule.routing_strategy) {
      case 'direct':
      case 'value':
        return rule.assign_to_member_id ? getMemberLabel(rule.assign_to_member_id) : 'Unassigned';
      case 'skill':
        return 'Matching skill';
      case 'geographic':
        return 'Matching territory';
      case 'round_robin':
        return 'Pool rotation';
      case 'availability':
        return 'Auto-assign';
      default:
        return 'Unknown';
    }
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
        Auto-assign incoming leads to team members based on strategy, score tier, skills, or geography.
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
              onClick={() => {
                setShowForm(!showForm);
                if (showForm) resetFormFields();
              }}
              className="btn-primary text-sm"
            >
              {showForm ? 'Cancel' : 'Add Rule'}
            </button>
          </div>

          {showForm && (
            <form onSubmit={(e) => void handleCreate(e)} className="mt-4 card p-5 space-y-4">
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

              {/* Strategy Selector */}
              <div>
                <label htmlFor="strategy-select" className="block text-sm font-medium text-ink mb-1">Routing Strategy</label>
                <select
                  id="strategy-select"
                  value={formStrategy}
                  onChange={(e) => setFormStrategy(e.target.value as RoutingStrategyValue)}
                  className="input-field w-full"
                >
                  {(ROUTING_STRATEGIES as readonly StrategyOption[]).map((s: StrategyOption) => (
                    <option key={s.value} value={s.value}>{s.label}</option>
                  ))}
                </select>
                <p className="mt-1 text-xs text-stone">
                  {(ROUTING_STRATEGIES as readonly StrategyOption[]).find((s: StrategyOption) => s.value === formStrategy)?.description ?? ''}
                </p>
              </div>

              {/* Direct strategy fields */}
              {formStrategy === 'direct' && (
                <>
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
                  <div>
                    <label htmlFor="assignee-direct" className="block text-sm font-medium text-ink mb-1">Assign To</label>
                    <select
                      id="assignee-direct"
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
                </>
              )}

              {/* Skill strategy fields */}
              {formStrategy === 'skill' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-ink mb-1">Required Skill Tags</label>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {formSkillTags.map((tag) => (
                        <span
                          key={tag}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 text-sm bg-surface-alt border border-border rounded-md"
                        >
                          <span className="text-ink">{tag}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveSkillTag(tag)}
                            className="text-stone hover:text-danger transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-ink/30 rounded-sm"
                            aria-label={`Remove ${tag}`}
                          >
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </span>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={formNewSkillTag}
                        onChange={(e) => setFormNewSkillTag(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddSkillTag();
                          }
                        }}
                        placeholder="e.g. sales, spanish"
                        className="input-field flex-1"
                      />
                      <button type="button" onClick={handleAddSkillTag} className="btn-primary text-sm">Add</button>
                    </div>
                  </div>
                  <div>
                    <label htmlFor="skill-tier-filter" className="block text-sm font-medium text-ink mb-1">Tier Filter (optional)</label>
                    <select
                      id="skill-tier-filter"
                      value={formTier}
                      onChange={(e) => setFormTier(e.target.value as 'hot' | 'warm' | 'cold')}
                      className="input-field w-full"
                    >
                      <option value="">Any tier</option>
                      <option value="hot">Hot</option>
                      <option value="warm">Warm</option>
                      <option value="cold">Cold</option>
                    </select>
                  </div>
                </>
              )}

              {/* Geographic strategy fields */}
              {formStrategy === 'geographic' && (
                <div>
                  <label className="block text-sm font-medium text-ink mb-1">Countries</label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {formCountries.map((code) => (
                      <span
                        key={code}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 text-sm bg-surface-alt border border-border rounded-md"
                      >
                        <span className="font-mono text-ink">{code}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveCountry(code)}
                          className="text-stone hover:text-danger transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-ink/30 rounded-sm"
                          aria-label={`Remove ${code}`}
                        >
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={formNewCountry}
                      onChange={(e) => setFormNewCountry(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddCountry();
                        }
                      }}
                      placeholder="Country code (US, GB, DE)"
                      className="input-field flex-1"
                      maxLength={3}
                    />
                    <button type="button" onClick={handleAddCountry} className="btn-primary text-sm">Add</button>
                  </div>
                </div>
              )}

              {/* Value strategy fields */}
              {formStrategy === 'value' && (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label htmlFor="score-min" className="block text-sm font-medium text-ink mb-1">Min Score</label>
                      <input
                        id="score-min"
                        type="number"
                        min={0}
                        max={100}
                        value={formScoreMin}
                        onChange={(e) => setFormScoreMin(Math.max(0, Math.min(100, Number(e.target.value))))}
                        className="input-field w-full"
                      />
                    </div>
                    <div>
                      <label htmlFor="score-max" className="block text-sm font-medium text-ink mb-1">Max Score</label>
                      <input
                        id="score-max"
                        type="number"
                        min={0}
                        max={100}
                        value={formScoreMax}
                        onChange={(e) => setFormScoreMax(Math.max(0, Math.min(100, Number(e.target.value))))}
                        className="input-field w-full"
                      />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="assignee-value" className="block text-sm font-medium text-ink mb-1">Assign To</label>
                    <select
                      id="assignee-value"
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
                </>
              )}

              {/* Round robin strategy fields */}
              {formStrategy === 'round_robin' && (
                <div>
                  <label className="block text-sm font-medium text-ink mb-2">Member Pool</label>
                  <div className="space-y-2">
                    {members.map((m) => (
                      <label key={m.id} className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formRoundRobinPool.includes(m.id)}
                          onChange={() => handleToggleRoundRobin(m.id)}
                          className="w-4 h-4 rounded border-gray-300 text-ink focus:ring-ink/30 focus:ring-2 focus:outline-none"
                        />
                        <span className="text-sm text-ink">
                          {m.invited_email ?? m.id.slice(0, 8)}
                          <span className="text-stone ml-1">({m.role})</span>
                        </span>
                      </label>
                    ))}
                  </div>
                  {members.length === 0 && (
                    <p className="text-xs text-stone">No team members available.</p>
                  )}
                </div>
              )}

              {/* Availability strategy: no extra config */}
              {formStrategy === 'availability' && (
                <div className="p-3 bg-surface-alt border border-border rounded-md">
                  <p className="text-sm text-stone">
                    Leads will be automatically assigned to online team members with available capacity. No additional configuration needed.
                  </p>
                </div>
              )}

              {/* Priority (shared across all strategies) */}
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
                      <th className="text-left py-3 px-4 font-medium">Strategy</th>
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
                        <td className="py-3 px-4">
                          <span className="text-xs px-2 py-0.5 rounded-md bg-surface-alt text-stone font-medium">
                            {getStrategyLabel(rule.routing_strategy)}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-stone">
                          <span className="text-xs">{getRuleMatchDescription(rule)}</span>
                        </td>
                        <td className="py-3 px-4 text-stone">{getRuleAssignee(rule)}</td>
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
