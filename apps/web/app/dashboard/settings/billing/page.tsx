'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';

const SETTINGS_NAV = [
  { href: '/dashboard/settings', label: 'Account' },
  { href: '/dashboard/settings/team', label: 'Team' },
  { href: '/dashboard/settings/billing', label: 'Billing' },
  { href: '/dashboard/settings/notifications', label: 'Notifications' },
  { href: '/dashboard/settings/api', label: 'API' },
] as const;

const PLAN_DETAILS: Record<string, { name: string; price: string; widgetLimit: number; submissionLimit: string }> = {
  trial: { name: 'Trial', price: 'Free', widgetLimit: 1, submissionLimit: '50/mo' },
  starter: { name: 'Starter', price: '$99/mo', widgetLimit: 1, submissionLimit: '500/mo' },
  pro: { name: 'Pro', price: '$149/mo', widgetLimit: 5, submissionLimit: '2,000/mo' },
  agency: { name: 'Agency', price: '$249/mo', widgetLimit: 25, submissionLimit: 'Unlimited' },
};

interface CheckoutResponse {
  url?: string;
  type?: string;
  error?: string;
}

const UPGRADE_OPTIONS: Record<string, readonly string[]> = {
  trial: ['starter', 'pro', 'agency'],
  starter: ['pro', 'agency'],
  pro: ['agency'],
  agency: [],
};

export default function BillingSettingsPage(): React.ReactElement {
  const searchParams = useSearchParams();
  const [plan, setPlan] = useState('trial');
  const [subscriptionStatus, setSubscriptionStatus] = useState('trialing');
  const [trialEndsAt, setTrialEndsAt] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [upgradeLoading, setUpgradeLoading] = useState<string | null>(null);
  const [upgradeError, setUpgradeError] = useState<string | null>(null);
  const [checkoutSuccess, setCheckoutSuccess] = useState(false);

  useEffect(() => {
    if (searchParams.get('checkout') === 'success') {
      setCheckoutSuccess(true);
      setTimeout(() => setCheckoutSuccess(false), 5000);
    }
  }, [searchParams]);

  useEffect(() => {
    async function loadBilling(): Promise<void> {
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
          .select('plan, subscription_status, trial_ends_at')
          .eq('id', memberData.account_id)
          .single();

        if (account) {
          setPlan(account.plan);
          setSubscriptionStatus(account.subscription_status);
          setTrialEndsAt(account.trial_ends_at);
        }
      } catch {
        // Failed to load billing
      } finally {
        setLoading(false);
      }
    }
    void loadBilling();
  }, []);

  const planInfo = PLAN_DETAILS[plan] ?? PLAN_DETAILS['trial'];

  return (
    <div>
      <h1 className="page-heading">Settings</h1>

      <nav className="mt-4 flex gap-1 border-b border-border mb-6">
        {SETTINGS_NAV.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`px-4 py-2.5 text-sm font-body transition-colors duration-fast -mb-px ${
              item.href === '/dashboard/settings/billing'
                ? 'text-ink font-medium border-b-2 border-ink'
                : 'text-stone hover:text-ink border-b-2 border-transparent'
            }`}
          >
            {item.label}
          </Link>
        ))}
      </nav>

      {checkoutSuccess && (
        <div className="mb-6 p-3 rounded-sm bg-success-light text-success text-sm border border-success/20">
          Your plan has been updated. It may take a moment for changes to reflect.
        </div>
      )}

      {loading ? (
        <div className="space-y-6 max-w-prose">
          <div className="card">
            <div className="skeleton h-6 w-28 mb-4" />
            <div className="flex items-start justify-between">
              <div>
                <div className="skeleton h-5 w-20 mb-1" />
                <div className="skeleton h-4 w-16" />
              </div>
              <div className="skeleton h-5 w-14 rounded-pill" />
            </div>
            <div className="skeleton h-4 w-48 mt-3" />
          </div>
          <div className="card">
            <div className="skeleton h-6 w-24 mb-4" />
            <div className="space-y-3">
              <div className="flex justify-between">
                <div className="skeleton h-4 w-16" />
                <div className="skeleton h-4 w-6" />
              </div>
              <div className="flex justify-between">
                <div className="skeleton h-4 w-24" />
                <div className="skeleton h-4 w-14" />
              </div>
            </div>
          </div>
          <div className="card">
            <div className="skeleton h-6 w-32 mb-4" />
            <div className="skeleton h-10 w-full rounded-md mb-3" />
            <div className="skeleton h-10 w-full rounded-md" />
          </div>
        </div>
      ) : (
        <div className="space-y-6 max-w-prose">
          {/* Current Plan */}
          <div className="card">
            <h2 className="font-display text-lg font-semibold text-ink mb-4">Current Plan</h2>
            <div className="flex items-start justify-between">
              <div>
                <p className="font-body text-base font-semibold text-ink">{planInfo?.name}</p>
                <p className="text-sm text-stone">{planInfo?.price}</p>
              </div>
              <span
                className={`text-xs px-2 py-0.5 rounded-pill font-medium ${
                  subscriptionStatus === 'active'
                    ? 'bg-success-light text-success'
                    : subscriptionStatus === 'trialing'
                      ? 'bg-signal-light text-signal'
                      : subscriptionStatus === 'past_due'
                        ? 'bg-warning-light text-warning'
                        : 'bg-danger-light text-danger'
                }`}
              >
                {subscriptionStatus === 'trialing'
                  ? 'Trial'
                  : subscriptionStatus.charAt(0).toUpperCase() + subscriptionStatus.slice(1).replace('_', ' ')}
              </span>
            </div>

            {trialEndsAt && subscriptionStatus === 'trialing' && (
              <p className="mt-3 text-sm text-stone">
                Trial ends on{' '}
                <span className="font-medium text-ink">
                  {new Date(trialEndsAt).toLocaleDateString()}
                </span>
              </p>
            )}
          </div>

          {/* Usage */}
          <div className="card">
            <h2 className="font-display text-lg font-semibold text-ink mb-4">Plan Limits</h2>
            <dl className="space-y-3 text-sm">
              <div className="flex justify-between">
                <dt className="text-stone">Widgets</dt>
                <dd className="text-ink font-medium">{planInfo?.widgetLimit}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-stone">Submissions</dt>
                <dd className="text-ink font-medium">{planInfo?.submissionLimit}</dd>
              </div>
            </dl>
          </div>

          {/* Upgrade Options */}
          {(UPGRADE_OPTIONS[plan] ?? []).length > 0 && (
            <div className="card">
              <h2 className="font-display text-lg font-semibold text-ink mb-4">Upgrade Plan</h2>
              {upgradeError !== null && (
                <div className="mb-4 p-3 rounded-sm bg-danger-light text-danger text-sm border border-danger/20">
                  {upgradeError}
                </div>
              )}
              <div className="space-y-3">
                {(UPGRADE_OPTIONS[plan] ?? []).map((targetPlan) => {
                  const info = PLAN_DETAILS[targetPlan];
                  if (!info) return null;
                  return (
                    <div key={targetPlan} className="flex items-center justify-between p-3 border border-border rounded-md">
                      <div>
                        <p className="font-body text-sm font-semibold text-ink">{info.name}</p>
                        <p className="text-xs text-stone">
                          {info.price} · {info.widgetLimit} widget{info.widgetLimit === 1 ? '' : 's'} · {info.submissionLimit} submissions
                        </p>
                      </div>
                      <button
                        type="button"
                        disabled={upgradeLoading !== null}
                        className="btn-primary text-sm"
                        onClick={() => {
                          void (async () => {
                            setUpgradeError(null);
                            setUpgradeLoading(targetPlan);
                            try {
                              const res = await fetch('/api/v1/billing/checkout', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ planId: targetPlan, interval: 'monthly' }),
                              });
                              const data: CheckoutResponse = await res.json() as CheckoutResponse;
                              if (data.error) {
                                setUpgradeError(data.error);
                                setUpgradeLoading(null);
                                return;
                              }
                              if (data.url) {
                                window.location.href = data.url;
                                return;
                              }
                              setUpgradeError('Failed to start checkout.');
                            } catch {
                              setUpgradeError('Something went wrong. Please try again.');
                            } finally {
                              setUpgradeLoading(null);
                            }
                          })();
                        }}
                      >
                        {upgradeLoading === targetPlan ? (
                          <span className="inline-flex items-center gap-2">
                            <span className="spinner w-3 h-3" />
                            Loading...
                          </span>
                        ) : 'Upgrade'}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="card">
            <h2 className="font-display text-lg font-semibold text-ink mb-4">Manage Billing</h2>
            <div className="space-y-3">
              <button
                type="button"
                className="btn-ghost w-full"
                onClick={() => {
                  void (async () => {
                    try {
                      const res = await fetch('/api/v1/billing/portal', { method: 'POST' });
                      const data: { url?: string; error?: string } = await res.json() as { url?: string; error?: string };
                      if (data.url) {
                        window.open(data.url, '_blank');
                      }
                    } catch {
                      // Portal request failed
                    }
                  })();
                }}
              >
                Open Billing Portal
              </button>
            </div>
            <p className="mt-3 text-xs text-stone-light">
              The billing portal is managed by Stripe. You can update payment methods, view invoices, and cancel your subscription there.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
