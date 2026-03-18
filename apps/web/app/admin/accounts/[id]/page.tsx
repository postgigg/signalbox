'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useState, useEffect } from 'react';

import type { Account } from '@/lib/supabase/types';

export default function AdminAccountDetailPage(): React.ReactElement {
  const params = useParams();
  const accountId = typeof params.id === 'string' ? params.id : '';

  const [account, setAccount] = useState<Account | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState('');
  const [extendDays, setExtendDays] = useState(7);
  const [giftPlan, setGiftPlan] = useState<'starter' | 'pro' | 'agency'>('starter');

  useEffect(() => {
    async function loadAccount(): Promise<void> {
      try {
        const { createBrowserClient } = await import('@supabase/ssr');
        const supabase = createBrowserClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL ?? '',
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ''
        );

        const { data } = await supabase
          .from('accounts')
          .select('*')
          .eq('id', accountId)
          .single();

        setAccount(data as Account | null);
      } catch {
        // Failed to load
      } finally {
        setLoading(false);
      }
    }
    void loadAccount();
  }, [accountId]);

  async function handleAction(action: string, payload?: Record<string, unknown>): Promise<void> {
    setActionLoading(action);
    try {
      const { createBrowserClient } = await import('@supabase/ssr');
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL ?? '',
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ''
      );

      switch (action) {
        case 'suspend': {
          await supabase.from('accounts').update({ is_suspended: true, suspended_at: new Date().toISOString() }).eq('id', accountId);
          setAccount((prev) => prev ? { ...prev, is_suspended: true } : prev);
          break;
        }
        case 'unsuspend': {
          await supabase.from('accounts').update({ is_suspended: false, suspended_at: null, suspended_reason: null }).eq('id', accountId);
          setAccount((prev) => prev ? { ...prev, is_suspended: false } : prev);
          break;
        }
        case 'change_plan': {
          if (payload?.['plan']) {
            await supabase.from('accounts').update({ plan: payload['plan'] as string }).eq('id', accountId);
            setAccount((prev) => prev ? { ...prev, plan: payload['plan'] as Account['plan'] } : prev);
          }
          break;
        }
        case 'extend_trial': {
          if (account?.trial_ends_at) {
            const currentEnd = new Date(account.trial_ends_at);
            currentEnd.setDate(currentEnd.getDate() + extendDays);
            await supabase.from('accounts').update({ trial_ends_at: currentEnd.toISOString() }).eq('id', accountId);
            setAccount((prev) => prev ? { ...prev, trial_ends_at: currentEnd.toISOString() } : prev);
          }
          break;
        }
        case 'gift_plan': {
          await supabase.from('accounts').update({ plan: giftPlan, subscription_status: 'active' }).eq('id', accountId);
          setAccount((prev) => prev ? { ...prev, plan: giftPlan, subscription_status: 'active' } : prev);
          break;
        }
        case 'delete': {
          if (deleteConfirm === account?.name) {
            await supabase.from('accounts').update({ deleted_at: new Date().toISOString() }).eq('id', accountId);
            // Redirect handled by caller
          }
          break;
        }
        default:
          break;
      }
    } catch {
      // Action failed
    } finally {
      setActionLoading(null);
    }
  }

  if (loading) {
    return (
      <div className="card text-center py-10">
        <p className="text-sm text-stone">Loading account...</p>
      </div>
    );
  }

  if (!account) {
    return (
      <div className="card text-center py-10">
        <p className="text-sm text-stone">Account not found.</p>
        <Link href="/admin/accounts" className="btn-ghost mt-2">Back to accounts</Link>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-2 mb-6">
        <Link href="/admin/accounts" className="text-sm text-stone hover:text-ink transition-colors duration-fast">Accounts</Link>
        <span className="text-stone-light">/</span>
        <span className="text-sm text-ink font-medium">{account.name}</span>
      </div>

      <div className="flex items-center gap-3 mb-6">
        <h1 className="page-heading">{account.name}</h1>
        {account.is_suspended && (
          <span className="text-xs px-2 py-0.5 rounded-pill font-medium bg-danger text-white">Suspended</span>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Account Info */}
        <div className="lg:col-span-2 space-y-6">
          <div className="card">
            <h2 className="font-display text-lg font-semibold text-ink mb-4">Account Details</h2>
            <dl className="grid grid-cols-2 gap-4 text-sm">
              <div><dt className="text-stone">Slug</dt><dd className="font-mono text-ink">{account.slug}</dd></div>
              <div><dt className="text-stone">Plan</dt><dd className="text-ink font-medium">{account.plan}</dd></div>
              <div><dt className="text-stone">Status</dt><dd className="text-ink font-medium">{account.subscription_status}</dd></div>
              <div><dt className="text-stone">Timezone</dt><dd className="text-ink">{account.timezone}</dd></div>
              <div><dt className="text-stone">Hot Threshold</dt><dd className="font-mono text-ink">{account.hot_lead_threshold}</dd></div>
              <div><dt className="text-stone">Warm Threshold</dt><dd className="font-mono text-ink">{account.warm_lead_threshold}</dd></div>
              <div><dt className="text-stone">Created</dt><dd className="text-ink">{new Date(account.created_at).toLocaleDateString()}</dd></div>
              {account.trial_ends_at && (
                <div><dt className="text-stone">Trial Ends</dt><dd className="text-ink">{new Date(account.trial_ends_at).toLocaleDateString()}</dd></div>
              )}
              {account.notification_email && (
                <div><dt className="text-stone">Notification Email</dt><dd className="text-ink">{account.notification_email}</dd></div>
              )}
              {account.stripe_customer_id && (
                <div><dt className="text-stone">Stripe Customer</dt><dd className="font-mono text-ink text-xs">{account.stripe_customer_id}</dd></div>
              )}
            </dl>
          </div>

          {/* Internal Notes */}
          <div className="card">
            <h2 className="font-display text-lg font-semibold text-ink mb-3">Internal Notes</h2>
            <textarea
              defaultValue={account.internal_notes ?? ''}
              rows={4}
              className="input-field h-auto py-2 resize-none"
              placeholder="Admin-only notes about this account..."
            />
            <button type="button" className="btn-ghost mt-2 text-xs h-8">Save Notes</button>
          </div>
        </div>

        {/* Admin Actions */}
        <div className="space-y-4">
          {/* Support Tickets */}
          <div className="card">
            <h3 className="text-xs font-medium text-stone uppercase tracking-wide mb-3">Support Tickets</h3>
            <p className="text-xs text-stone mb-2">View tickets from this account.</p>
            <Link href={`/admin/tickets?account=${accountId}`} className="btn-secondary w-full text-xs text-center block">
              View Tickets
            </Link>
          </div>

          {/* Impersonate */}
          <div className="card">
            <h3 className="text-xs font-medium text-stone uppercase tracking-wide mb-3">Impersonate</h3>
            <p className="text-xs text-stone mb-2">Read-only view of their dashboard.</p>
            <button type="button" className="btn-secondary w-full text-xs">View as Account</button>
          </div>

          {/* Change Plan */}
          <div className="card">
            <h3 className="text-xs font-medium text-stone uppercase tracking-wide mb-3">Change Plan</h3>
            <div className="space-y-2">
              {(['trial', 'starter', 'pro', 'agency'] as const).map((p) => (
                <button
                  key={p}
                  type="button"
                  disabled={account.plan === p || actionLoading === 'change_plan'}
                  onClick={() => void handleAction('change_plan', { plan: p })}
                  className={`w-full text-left px-3 py-2 text-xs rounded-sm border transition-colors duration-fast ${
                    account.plan === p ? 'border-signal bg-signal-light text-signal' : 'border-border text-stone hover:text-ink hover:border-border-dark'
                  } disabled:opacity-50`}
                >
                  {p.charAt(0).toUpperCase() + p.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Suspend/Unsuspend */}
          <div className="card">
            <h3 className="text-xs font-medium text-stone uppercase tracking-wide mb-3">
              {account.is_suspended ? 'Unsuspend' : 'Suspend'}
            </h3>
            <button
              type="button"
              onClick={() => void handleAction(account.is_suspended ? 'unsuspend' : 'suspend')}
              disabled={actionLoading !== null}
              className={account.is_suspended ? 'btn-secondary w-full text-xs' : 'btn-danger w-full text-xs'}
            >
              {account.is_suspended ? 'Unsuspend Account' : 'Suspend Account'}
            </button>
          </div>

          {/* Extend Trial */}
          <div className="card">
            <h3 className="text-xs font-medium text-stone uppercase tracking-wide mb-3">Extend Trial</h3>
            <div className="flex gap-2">
              <select value={extendDays} onChange={(e) => setExtendDays(parseInt(e.target.value, 10))} className="input-field h-8 text-xs flex-1">
                <option value={7}>+7 days</option>
                <option value={14}>+14 days</option>
                <option value={30}>+30 days</option>
              </select>
              <button type="button" onClick={() => void handleAction('extend_trial')} disabled={actionLoading !== null} className="btn-secondary text-xs h-8">
                Extend
              </button>
            </div>
          </div>

          {/* Gift Plan */}
          <div className="card">
            <h3 className="text-xs font-medium text-stone uppercase tracking-wide mb-3">Gift Plan</h3>
            <p className="text-xs text-stone mb-2">Assign a plan without Stripe billing.</p>
            <div className="flex gap-2">
              <select value={giftPlan} onChange={(e) => setGiftPlan(e.target.value as 'starter' | 'pro' | 'agency')} className="input-field h-8 text-xs flex-1">
                <option value="starter">Starter</option>
                <option value="pro">Pro</option>
                <option value="agency">Agency</option>
              </select>
              <button type="button" onClick={() => void handleAction('gift_plan')} disabled={actionLoading !== null} className="btn-secondary text-xs h-8">
                Gift
              </button>
            </div>
          </div>

          {/* Delete */}
          <div className="card border-danger/30">
            <h3 className="text-xs font-medium text-danger uppercase tracking-wide mb-3">Delete Account</h3>
            <p className="text-xs text-stone mb-2">
              Type &quot;{account.name}&quot; to confirm permanent deletion.
            </p>
            <input
              type="text"
              value={deleteConfirm}
              onChange={(e) => setDeleteConfirm(e.target.value)}
              placeholder={account.name}
              className="input-field h-8 text-xs mb-2"
            />
            <button
              type="button"
              onClick={() => void handleAction('delete')}
              disabled={deleteConfirm !== account.name || actionLoading !== null}
              className="btn-danger w-full text-xs"
            >
              Permanently Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
