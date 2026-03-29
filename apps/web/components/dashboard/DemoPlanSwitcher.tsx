'use client';

import { useState } from 'react';

import { useDashboard } from '@/lib/dashboard-context';

const PLANS = ['trial', 'starter', 'pro', 'agency'] as const;

const PLAN_LABELS: Record<string, string> = {
  trial: 'Trial',
  starter: 'Starter',
  pro: 'Pro',
  agency: 'Agency',
};

interface SwitchResponse {
  plan?: string;
  error?: string;
}

export function DemoPlanSwitcher(): React.ReactElement | null {
  const { isDemo, accountPlan, setAccountPlan } = useDashboard();
  const [switching, setSwitching] = useState<string | null>(null);

  if (!isDemo) return null;

  async function handleSwitch(plan: string): Promise<void> {
    if (plan === accountPlan) return;
    setSwitching(plan);
    try {
      const res = await fetch('/api/v1/demo/switch-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan }),
      });
      const data: SwitchResponse = await res.json() as SwitchResponse;
      if (data.plan) {
        setAccountPlan(data.plan);
      }
    } catch {
      // Switch failed
    } finally {
      setSwitching(null);
    }
  }

  return (
    <div className="card mb-6">
      <p className="text-xs font-medium text-stone uppercase tracking-wide mb-3">Demo Mode</p>
      <div className="flex gap-2">
        {PLANS.map((plan) => (
          <button
            key={plan}
            type="button"
            disabled={switching !== null}
            onClick={() => void handleSwitch(plan)}
            className={`px-4 py-2 rounded-md text-sm font-body transition-colors duration-fast ${
              accountPlan === plan
                ? 'bg-ink text-white'
                : 'border border-border text-stone hover:text-ink hover:bg-surface-alt'
            }`}
          >
            {switching === plan ? (
              <span className="inline-flex items-center gap-1.5">
                <span className="spinner w-3 h-3" />
                {PLAN_LABELS[plan]}
              </span>
            ) : (
              PLAN_LABELS[plan]
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
