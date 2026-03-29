'use client';

import Link from 'next/link';
import { useState, useEffect, useCallback } from 'react';

import { HelpTip } from '@/components/shared/HelpTip';
import { PageGuide } from '@/components/shared/PageGuide';
import {
  DEFAULT_SCORING_CONFIG,
  SCORING_DIMENSIONS,
} from '@/lib/constants';
import { HELP_TIPS } from '@/lib/help-content';

import type { ScoringConfig } from '@/lib/constants';

const SETTINGS_NAV = [
  { href: '/dashboard/settings', label: 'Account' },
  { href: '/dashboard/settings/billing', label: 'Billing' },
  { href: '/dashboard/settings/notifications', label: 'Notifications' },
  { href: '/dashboard/settings/api', label: 'API' },
  { href: '/dashboard/settings/routing', label: 'Routing' },
  { href: '/dashboard/settings/scoring', label: 'Scoring' },
] as const;

const DIMENSION_KEYS = ['form', 'engagement'] as const;

const DIMENSION_COLORS: Record<string, string> = {
  form: 'bg-blue-500',
  engagement: 'bg-green-500',
};

const DIMENSION_HELP: Record<string, string> = {
  form: HELP_TIPS.scoring.formWeight,
  engagement: HELP_TIPS.scoring.engagementWeight,
};

interface AccountData {
  readonly plan: string;
  readonly scoring_config: unknown;
}

function parseScoringConfig(raw: unknown): ScoringConfig {
  if (typeof raw === 'object' && raw !== null) {
    const obj = raw as Record<string, unknown>;
    // Support old format: sum behavioralWeight + intentWeight into engagementWeight
    let engagementWeight = DEFAULT_SCORING_CONFIG.engagementWeight;
    if (typeof obj.engagementWeight === 'number') {
      engagementWeight = obj.engagementWeight;
    } else if (typeof obj.behavioralWeight === 'number' && typeof obj.intentWeight === 'number') {
      engagementWeight = obj.behavioralWeight + obj.intentWeight;
    }
    return {
      formWeight: typeof obj.formWeight === 'number' ? obj.formWeight : DEFAULT_SCORING_CONFIG.formWeight,
      engagementWeight,
      decayRatePerWeek: typeof obj.decayRatePerWeek === 'number' ? obj.decayRatePerWeek : DEFAULT_SCORING_CONFIG.decayRatePerWeek,
      decayMax: typeof obj.decayMax === 'number' ? obj.decayMax : DEFAULT_SCORING_CONFIG.decayMax,
      decayEnabled: typeof obj.decayEnabled === 'boolean' ? obj.decayEnabled : DEFAULT_SCORING_CONFIG.decayEnabled,
      highIntentPages: Array.isArray(obj.highIntentPages) ? (obj.highIntentPages as string[]) : [...DEFAULT_SCORING_CONFIG.highIntentPages],
    };
  }
  return {
    formWeight: DEFAULT_SCORING_CONFIG.formWeight,
    engagementWeight: DEFAULT_SCORING_CONFIG.engagementWeight,
    decayRatePerWeek: DEFAULT_SCORING_CONFIG.decayRatePerWeek,
    decayMax: DEFAULT_SCORING_CONFIG.decayMax,
    decayEnabled: DEFAULT_SCORING_CONFIG.decayEnabled,
    highIntentPages: [...DEFAULT_SCORING_CONFIG.highIntentPages],
  };
}

function clampWeight(value: number): number {
  return Math.round(Math.max(0, Math.min(1, value)) * 100) / 100;
}

export default function ScoringSettingsPage(): React.ReactElement {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [planAllowed, setPlanAllowed] = useState(false);
  const [config, setConfig] = useState<ScoringConfig>(parseScoringConfig(null));
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [newPagePattern, setNewPagePattern] = useState('');
  const [accountId, setAccountId] = useState<string | null>(null);

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
        setAccountId(memberData.account_id);

        const { data: accountData } = await supabase
          .from('accounts')
          .select('plan, scoring_config')
          .eq('id', memberData.account_id)
          .single();

        if (!accountData) return;

        const account = accountData as AccountData;
        if (account.plan === 'pro' || account.plan === 'agency') {
          setPlanAllowed(true);
        }

        setConfig(parseScoringConfig(account.scoring_config));
      } catch {
        setError('Failed to load scoring configuration.');
      } finally {
        setLoading(false);
      }
    }
    void load();
  }, []);

  const handleWeightChange = useCallback((changedKey: typeof DIMENSION_KEYS[number], rawValue: number): void => {
    setConfig((prev: ScoringConfig) => {
      const newValue = clampWeight(rawValue);
      const remaining = clampWeight(1 - newValue);

      const weightKey = (k: typeof DIMENSION_KEYS[number]): keyof ScoringConfig => {
        const map: Record<string, keyof ScoringConfig> = {
          form: 'formWeight',
          engagement: 'engagementWeight',
        };
        return map[k] ?? 'formWeight';
      };

      const otherKey = DIMENSION_KEYS.find((k) => k !== changedKey);

      const updated: Record<string, number | boolean | readonly string[]> = { ...prev };
      updated[weightKey(changedKey)] = newValue;

      if (otherKey !== undefined) {
        updated[weightKey(otherKey)] = remaining;
      }

      return updated as unknown as ScoringConfig;
    });
  }, []);

  const handleAddPagePattern = useCallback((): void => {
    const trimmed = newPagePattern.trim();
    if (trimmed.length === 0) return;
    if (config.highIntentPages.includes(trimmed)) return;
    setConfig((prev: ScoringConfig) => ({
      ...prev,
      highIntentPages: [...prev.highIntentPages, trimmed],
    }));
    setNewPagePattern('');
  }, [newPagePattern, config.highIntentPages]);

  const handleRemovePagePattern = useCallback((pattern: string): void => {
    setConfig((prev: ScoringConfig) => ({
      ...prev,
      highIntentPages: prev.highIntentPages.filter((p: string) => p !== pattern),
    }));
  }, []);

  async function handleSave(): Promise<void> {
    if (!accountId) return;
    setError(null);
    setSuccess(false);
    setSaving(true);

    try {
      const { createBrowserClient } = await import('@supabase/ssr');
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL ?? '',
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ''
      );

      const { error: updateError } = await supabase
        .from('accounts')
        .update({ scoring_config: config as unknown as Record<string, unknown> })
        .eq('id', accountId);

      if (updateError) {
        setError(updateError.message);
        return;
      }

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch {
      setError('Failed to save scoring configuration.');
    } finally {
      setSaving(false);
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
              item.href === '/dashboard/settings/scoring'
                ? 'text-ink font-medium border-b-2 border-ink'
                : 'text-stone hover:text-ink border-b-2 border-transparent'
            }`}
          >
            {item.label}
          </Link>
        ))}
      </nav>

      <h2 className="font-display text-lg font-semibold text-ink">Scoring Configuration</h2>
      <p className="mt-1 text-sm text-stone font-body">
        Adjust how lead scores are calculated across form answers and on-site engagement signals.
      </p>

      <PageGuide storageKey="scoring-config" title="How scoring works">
        {HELP_TIPS.scoring.pageGuide}
      </PageGuide>

      {loading && (
        <div className="mt-6 space-y-4">
          <div className="border border-gray-200 rounded-lg p-6">
            <div className="skeleton h-4 w-48 mb-4" />
            <div className="skeleton h-8 w-full mb-2" />
            <div className="skeleton h-8 w-full mb-2" />
            <div className="skeleton h-8 w-full" />
          </div>
        </div>
      )}

      {!planAllowed && !loading && (
        <div className="mt-4 border border-gray-200 rounded-lg p-6 text-center">
          <p className="text-sm text-stone">Scoring configuration is available on Pro and Agency plans.</p>
          <Link
            href="/dashboard/settings/billing"
            className="mt-2 inline-block text-sm text-signal hover:text-signal/80 transition-colors duration-150"
          >
            Upgrade your plan
          </Link>
        </div>
      )}

      {error !== null && (
        <div className="mt-4 p-3 rounded-md bg-danger-light text-danger text-sm border border-danger/20">
          {error}
        </div>
      )}

      {success && (
        <div className="mt-4 p-3 rounded-md bg-success-light text-success text-sm border border-success/20">
          Scoring configuration saved.
        </div>
      )}

      {planAllowed && !loading && (
        <div className="mt-6 space-y-6">
          {/* Dimension Weights */}
          <div className="border border-gray-200 rounded-lg p-6">
            <h3 className="font-display text-base font-semibold text-ink mb-1">
              Dimension Weights
              <HelpTip text={HELP_TIPS.scoring.dimensionWeights} />
            </h3>
            <p className="text-sm text-stone font-body mb-4">
              Control how much each scoring dimension contributes to the final score. Weights must sum to 1.0.
            </p>

            <div className="space-y-5">
              {SCORING_DIMENSIONS.map((dim: { key: string; label: string; description: string }) => {
                const key = dim.key as typeof DIMENSION_KEYS[number];
                const weightKey = `${key}Weight` as keyof ScoringConfig;
                const value = config[weightKey] as number;
                const colorClass = DIMENSION_COLORS[key] ?? 'bg-gray-500';

                return (
                  <div key={dim.key}>
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className={`w-3 h-3 rounded-sm ${colorClass}`} />
                        <span className="text-sm font-medium text-ink">
                          {dim.label}
                          {DIMENSION_HELP[key] !== undefined && <HelpTip text={DIMENSION_HELP[key]} />}
                        </span>
                      </div>
                      <span className="text-sm font-mono text-stone">{Math.round(value * 100)}%</span>
                    </div>
                    <p className="text-xs text-stone mb-2">{dim.description}</p>
                    <input
                      type="range"
                      min={0}
                      max={100}
                      step={5}
                      value={Math.round(value * 100)}
                      onChange={(e) => handleWeightChange(key, Number(e.target.value) / 100)}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-ink focus:outline-none focus:ring-2 focus:ring-ink/30"
                      aria-label={`${dim.label} weight`}
                    />
                  </div>
                );
              })}
            </div>

            {/* Visual weight bar */}
            <div className="mt-4 flex h-3 rounded-md overflow-hidden">
              <div
                className="bg-blue-500 transition-all duration-150"
                style={{ width: `${Math.round(config.formWeight * 100)}%` }}
              />
              <div
                className="bg-green-500 transition-all duration-150"
                style={{ width: `${Math.round(config.engagementWeight * 100)}%` }}
              />
            </div>
            <div className="mt-1 flex justify-between text-xs text-stone">
              <span>Form {Math.round(config.formWeight * 100)}%</span>
              <span>Engagement {Math.round(config.engagementWeight * 100)}%</span>
            </div>
          </div>

          {/* Decay Configuration */}
          <div className="border border-gray-200 rounded-lg p-6">
            <h3 className="font-display text-base font-semibold text-ink mb-1">
              Score Decay
              <HelpTip text={HELP_TIPS.scoring.decay} />
            </h3>
            <p className="text-sm text-stone font-body mb-4">
              Automatically reduce lead scores over time when there is no engagement.
            </p>

            <div className="space-y-4">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.decayEnabled}
                  onChange={(e) => setConfig((prev: ScoringConfig) => ({ ...prev, decayEnabled: e.target.checked }))}
                  className="w-4 h-4 rounded border-gray-300 text-ink focus:ring-ink/30 focus:ring-2 focus:outline-none"
                />
                <span className="text-sm font-medium text-ink">Enable score decay</span>
              </label>

              {config.decayEnabled && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="decay-rate" className="block text-sm font-medium text-ink mb-1">
                      Points per week
                      <HelpTip text={HELP_TIPS.scoring.decayRate} />
                    </label>
                    <input
                      id="decay-rate"
                      type="number"
                      min={1}
                      max={20}
                      value={config.decayRatePerWeek}
                      onChange={(e) => {
                        const val = Math.max(1, Math.min(20, Number(e.target.value)));
                        setConfig((prev: ScoringConfig) => ({ ...prev, decayRatePerWeek: val }));
                      }}
                      className="input-field w-full"
                    />
                    <p className="mt-1 text-xs text-stone">1-20 points deducted each week without engagement.</p>
                  </div>
                  <div>
                    <label htmlFor="decay-max" className="block text-sm font-medium text-ink mb-1">
                      Maximum decay
                      <HelpTip text={HELP_TIPS.scoring.decayMax} />
                    </label>
                    <input
                      id="decay-max"
                      type="number"
                      min={1}
                      max={50}
                      value={config.decayMax}
                      onChange={(e) => {
                        const val = Math.max(1, Math.min(50, Number(e.target.value)));
                        setConfig((prev: ScoringConfig) => ({ ...prev, decayMax: val }));
                      }}
                      className="input-field w-full"
                    />
                    <p className="mt-1 text-xs text-stone">Maximum points that can be deducted (1-50).</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* High-Intent Pages */}
          <div className="border border-gray-200 rounded-lg p-6">
            <h3 className="font-display text-base font-semibold text-ink mb-1">
              High-Intent Page Patterns
              <HelpTip text={HELP_TIPS.scoring.highIntentPages} />
            </h3>
            <p className="text-sm text-stone font-body mb-4">
              URL patterns that indicate high purchase intent. Visitors who view these pages receive a higher intent score.
            </p>

            <div className="flex flex-wrap gap-2 mb-3">
              {config.highIntentPages.map((pattern: string) => (
                <span
                  key={pattern}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 text-sm bg-surface-alt border border-border rounded-md"
                >
                  <span className="font-mono text-xs text-ink">{pattern}</span>
                  <button
                    type="button"
                    onClick={() => handleRemovePagePattern(pattern)}
                    className="text-stone hover:text-danger transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-ink/30 rounded-sm"
                    aria-label={`Remove ${pattern}`}
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </span>
              ))}
              {config.highIntentPages.length === 0 && (
                <p className="text-xs text-stone">No patterns configured.</p>
              )}
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={newPagePattern}
                onChange={(e) => setNewPagePattern(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddPagePattern();
                  }
                }}
                placeholder="/pricing, /demo, /contact"
                className="input-field flex-1"
              />
              <button
                type="button"
                onClick={handleAddPagePattern}
                className="btn-primary text-sm"
              >
                Add
              </button>
            </div>
          </div>

          {/* Save */}
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => void handleSave()}
              disabled={saving}
              className="btn-primary"
            >
              {saving ? (
                <span className="inline-flex items-center gap-2">
                  <span className="spinner w-4 h-4" />
                  Saving...
                </span>
              ) : 'Save Configuration'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
