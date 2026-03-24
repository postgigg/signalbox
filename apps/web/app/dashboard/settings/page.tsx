'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';

import { HelpTip } from '@/components/shared/HelpTip';
import { SUPPORT_EMAIL, PRIORITY_SUPPORT_EMAIL } from '@/lib/constants';
import { HELP_TIPS } from '@/lib/help-content';

import type { FormEvent } from 'react';

const SETTINGS_NAV = [
  { href: '/dashboard/settings', label: 'Account' },
  { href: '/dashboard/settings/team', label: 'Team' },
  { href: '/dashboard/settings/billing', label: 'Billing' },
  { href: '/dashboard/settings/notifications', label: 'Notifications' },
  { href: '/dashboard/settings/api', label: 'API' },
  { href: '/dashboard/settings/routing', label: 'Routing' },
  { href: '/dashboard/settings/scoring', label: 'Scoring' },
] as const;

const TIMEZONES = [
  'America/New_York',
  'America/Chicago',
  'America/Denver',
  'America/Los_Angeles',
  'America/Phoenix',
  'America/Anchorage',
  'Pacific/Honolulu',
  'Europe/London',
  'Europe/Paris',
  'Europe/Berlin',
  'Asia/Tokyo',
  'Asia/Shanghai',
  'Australia/Sydney',
] as const;

export default function AccountSettingsPage(): React.ReactElement {
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [timezone, setTimezone] = useState('America/New_York');
  const [notificationEmail, setNotificationEmail] = useState('');
  const [hotThreshold, setHotThreshold] = useState(70);
  const [warmThreshold, setWarmThreshold] = useState(40);
  const [accountPlan, setAccountPlan] = useState<string>('trial');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadAccount(): Promise<void> {
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
          .select('name, slug, timezone, notification_email, hot_lead_threshold, warm_lead_threshold, plan')
          .eq('id', memberData.account_id)
          .single();

        if (account) {
          setName(account.name);
          setSlug(account.slug);
          setTimezone(account.timezone);
          setNotificationEmail(account.notification_email ?? '');
          setHotThreshold(account.hot_lead_threshold);
          setWarmThreshold(account.warm_lead_threshold);
          setAccountPlan(account.plan);
        }
      } catch {
        // Failed to load account
      } finally {
        setLoading(false);
      }
    }
    void loadAccount();
  }, []);

  async function handleSubmit(e: FormEvent<HTMLFormElement>): Promise<void> {
    e.preventDefault();
    setError(null);

    if (hotThreshold <= warmThreshold) {
      setError('Hot lead threshold must be higher than warm lead threshold.');
      return;
    }

    setSaving(true);
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

      const { error: updateError } = await supabase
        .from('accounts')
        .update({
          name: name.trim(),
          slug: slug.trim(),
          timezone,
          notification_email: notificationEmail.trim() || null,
          hot_lead_threshold: hotThreshold,
          warm_lead_threshold: warmThreshold,
        })
        .eq('id', memberData.account_id);

      if (updateError) {
        setError(updateError.message);
      } else {
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      }
    } catch {
      setError('Failed to save settings.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <h1 className="page-heading">Settings</h1>

      {/* Settings Nav */}
      <nav className="mt-4 flex gap-1 border-b border-border mb-6">
        {SETTINGS_NAV.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`px-4 py-2.5 text-sm font-body transition-colors duration-fast -mb-px ${
              item.href === '/dashboard/settings'
                ? 'text-ink font-medium border-b-2 border-ink'
                : 'text-stone hover:text-ink border-b-2 border-transparent'
            }`}
          >
            {item.label}
          </Link>
        ))}
      </nav>

      {loading ? (
        <div className="space-y-6 max-w-prose">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i}>
              <div className="skeleton h-4 w-28 mb-1.5" />
              <div className="skeleton h-12 w-full rounded-sm" />
            </div>
          ))}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="skeleton h-4 w-32 mb-1.5" />
              <div className="skeleton h-12 w-full rounded-sm" />
            </div>
            <div>
              <div className="skeleton h-4 w-36 mb-1.5" />
              <div className="skeleton h-12 w-full rounded-sm" />
            </div>
          </div>
          <div className="skeleton h-10 w-28 rounded-md" />
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6 max-w-prose">
          {error !== null && (
            <div className="p-3 rounded-sm bg-danger-light text-danger text-sm border border-danger/20">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="accountName" className="input-label">Account Name</label>
            <input
              id="accountName"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="input-field"
            />
          </div>

          <div>
            <label htmlFor="accountSlug" className="input-label">
              Slug
              <HelpTip text={HELP_TIPS.settings.slug} />
            </label>
            <input
              id="accountSlug"
              type="text"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              required
              pattern="^[a-z0-9-]+$"
              className="input-field"
            />
            <p className="mt-1 text-xs text-stone-light">
              Lowercase letters, numbers, and hyphens only.
            </p>
          </div>

          <div>
            <label htmlFor="timezone" className="input-label">Timezone</label>
            <select
              id="timezone"
              value={timezone}
              onChange={(e) => setTimezone(e.target.value)}
              className="input-field"
            >
              {TIMEZONES.map((tz) => (
                <option key={tz} value={tz}>{tz}</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="notifEmail" className="input-label">Notification Email</label>
            <input
              id="notifEmail"
              type="email"
              value={notificationEmail}
              onChange={(e) => setNotificationEmail(e.target.value)}
              placeholder="notifications@example.com"
              className="input-field"
            />
            <p className="mt-1 text-xs text-stone-light">
              Leave blank to use your account email.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="hotThreshold" className="input-label">
                Hot Lead Threshold
                <HelpTip text={HELP_TIPS.settings.hotThreshold} />
              </label>
              <input
                id="hotThreshold"
                type="number"
                min={1}
                max={100}
                value={hotThreshold}
                onChange={(e) => setHotThreshold(parseInt(e.target.value, 10) || 70)}
                className="input-field"
              />
            </div>
            <div>
              <label htmlFor="warmThreshold" className="input-label">
                Warm Lead Threshold
                <HelpTip text={HELP_TIPS.settings.warmThreshold} />
              </label>
              <input
                id="warmThreshold"
                type="number"
                min={1}
                max={99}
                value={warmThreshold}
                onChange={(e) => setWarmThreshold(parseInt(e.target.value, 10) || 40)}
                className="input-field"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button type="submit" disabled={saving} className="btn-primary">
              {saving ? (
                <span className="inline-flex items-center gap-2">
                  <span className="spinner w-4 h-4" />
                  Saving...
                </span>
              ) : 'Save Changes'}
            </button>
            {saved && <span className="text-xs text-success">Saved</span>}
          </div>
        </form>
      )}

      {/* Support */}
      {!loading && (
        <div className="mt-10 max-w-prose">
          <h2 className="font-display text-lg font-semibold text-ink">Support</h2>
          <div className="mt-3 card">
            {accountPlan === 'agency' ? (
              <div className="flex items-start gap-3">
                <span className="text-xs px-2 py-0.5 rounded-pill bg-signal-light text-signal font-medium flex-shrink-0">Priority</span>
                <div>
                  <p className="text-sm text-ink font-medium font-body">Priority support included with your Agency plan.</p>
                  <p className="text-sm text-stone mt-1">
                    Email <a href={`mailto:${PRIORITY_SUPPORT_EMAIL}`} className="text-signal hover:underline">{PRIORITY_SUPPORT_EMAIL}</a> for faster response times.
                  </p>
                </div>
              </div>
            ) : (
              <div>
                <p className="text-sm text-ink font-medium font-body">Need help?</p>
                <p className="text-sm text-stone mt-1">
                  Email <a href={`mailto:${SUPPORT_EMAIL}`} className="text-signal hover:underline">{SUPPORT_EMAIL}</a> for assistance.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
