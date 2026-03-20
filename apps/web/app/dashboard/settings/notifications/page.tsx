'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';

const SETTINGS_NAV = [
  { href: '/dashboard/settings', label: 'Account' },
  { href: '/dashboard/settings/team', label: 'Team' },
  { href: '/dashboard/settings/billing', label: 'Billing' },
  { href: '/dashboard/settings/notifications', label: 'Notifications' },
  { href: '/dashboard/settings/api', label: 'API' },
] as const;

interface NotificationPrefs {
  email_on_hot_lead: boolean;
  email_on_warm_lead: boolean;
  email_on_cold_lead: boolean;
  email_hot_followup: boolean;
  email_weekly_digest: boolean;
  email_trial_alerts: boolean;
  email_billing_alerts: boolean;
  slack_on_hot_lead: boolean;
  slack_on_warm_lead: boolean;
  slack_on_cold_lead: boolean;
}

type EmailPrefKey = 'email_on_hot_lead' | 'email_on_warm_lead' | 'email_on_cold_lead' | 'email_hot_followup' | 'email_weekly_digest' | 'email_trial_alerts' | 'email_billing_alerts';
type SlackPrefKey = 'slack_on_hot_lead' | 'slack_on_warm_lead' | 'slack_on_cold_lead';

const EMAIL_OPTIONS: readonly { key: EmailPrefKey; label: string; description: string }[] = [
  { key: 'email_on_hot_lead', label: 'Hot lead email alerts', description: 'Instant email alert when a lead scores above your hot threshold.' },
  { key: 'email_on_warm_lead', label: 'Warm lead email alerts', description: 'Get an email when a warm lead submits through your widget.' },
  { key: 'email_on_cold_lead', label: 'Cold lead email alerts', description: 'Get an email when a cold lead submits through your widget.' },
  { key: 'email_hot_followup', label: 'Hot lead followup reminders', description: 'Reminder emails to follow up with hot leads you haven\'t contacted.' },
  { key: 'email_weekly_digest', label: 'Weekly digest', description: 'A summary email every Monday with your lead stats.' },
  { key: 'email_trial_alerts', label: 'Trial alerts', description: 'Notifications about your trial status and expiration.' },
  { key: 'email_billing_alerts', label: 'Billing alerts', description: 'Alerts about billing, payments, and subscription changes.' },
] as const;

const SLACK_OPTIONS: readonly { key: SlackPrefKey; label: string; description: string }[] = [
  { key: 'slack_on_hot_lead', label: 'Hot lead Slack alerts', description: 'Slack notification for hot leads.' },
  { key: 'slack_on_warm_lead', label: 'Warm lead Slack alerts', description: 'Slack notification for warm leads.' },
  { key: 'slack_on_cold_lead', label: 'Cold lead Slack alerts', description: 'Slack notification for cold leads.' },
] as const;

export default function NotificationSettingsPage(): React.ReactElement {
  const [prefs, setPrefs] = useState<NotificationPrefs>({
    email_on_hot_lead: true,
    email_on_warm_lead: true,
    email_on_cold_lead: false,
    email_hot_followup: true,
    email_weekly_digest: true,
    email_trial_alerts: true,
    email_billing_alerts: true,
    slack_on_hot_lead: false,
    slack_on_warm_lead: false,
    slack_on_cold_lead: false,
  });
  const [slackWebhookUrl, setSlackWebhookUrl] = useState('');
  const [accountPlan, setAccountPlan] = useState<string>('trial');
  const [memberId, setMemberId] = useState<string>('');
  const [accountId, setAccountId] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [testingSlack, setTestingSlack] = useState(false);
  const [slackTestResult, setSlackTestResult] = useState<string | null>(null);

  useEffect(() => {
    async function loadPrefs(): Promise<void> {
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
          .select('id, account_id')
          .eq('user_id', user.id)
          .limit(1)
          .single();

        if (!memberData) return;

        setMemberId(memberData.id);
        setAccountId(memberData.account_id);

        // Fetch account plan and slack webhook
        const { data: accountData } = await supabase
          .from('accounts')
          .select('plan, slack_webhook_url')
          .eq('id', memberData.account_id)
          .single();

        if (accountData) {
          setAccountPlan(accountData.plan);
          setSlackWebhookUrl(accountData.slack_webhook_url ?? '');
        }

        // FIX: Use member_id (not user_id) — matches the actual DB column
        const { data } = await supabase
          .from('notification_preferences')
          .select('email_on_hot_lead, email_on_warm_lead, email_on_cold_lead, email_hot_followup, email_weekly_digest, email_trial_alerts, email_billing_alerts, slack_on_hot_lead, slack_on_warm_lead, slack_on_cold_lead')
          .eq('account_id', memberData.account_id)
          .eq('member_id', memberData.id)
          .single();

        if (data) {
          setPrefs(data as NotificationPrefs);
        }
      } catch {
        // Failed to load prefs
      } finally {
        setLoading(false);
      }
    }
    void loadPrefs();
  }, []);

  async function handleSave(): Promise<void> {
    setSaving(true);
    try {
      const { createBrowserClient } = await import('@supabase/ssr');
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL ?? '',
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ''
      );

      // Save notification preferences — FIX: use member_id
      const { error } = await supabase
        .from('notification_preferences')
        .upsert({
          account_id: accountId,
          member_id: memberId,
          ...prefs,
        });

      // Save Slack webhook URL to account
      if (accountPlan === 'pro' || accountPlan === 'agency') {
        await supabase
          .from('accounts')
          .update({ slack_webhook_url: slackWebhookUrl.trim() || null })
          .eq('id', accountId);
      }

      if (!error) {
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      }
    } catch {
      // Save failed
    } finally {
      setSaving(false);
    }
  }

  async function handleTestSlack(): Promise<void> {
    if (!slackWebhookUrl.trim()) return;
    setTestingSlack(true);
    setSlackTestResult(null);

    try {
      const response = await fetch(slackWebhookUrl.trim(), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          blocks: [
            {
              type: 'section',
              text: {
                type: 'mrkdwn',
                text: ':white_check_mark: *HawkLeads Slack integration is working.* You will receive lead notifications in this channel.',
              },
            },
          ],
        }),
      });

      if (response.ok) {
        setSlackTestResult('Test message sent to Slack.');
      } else {
        setSlackTestResult('Failed to send test message. Check your webhook URL.');
      }
    } catch {
      setSlackTestResult('Failed to reach Slack. Check your webhook URL.');
    } finally {
      setTestingSlack(false);
      setTimeout(() => setSlackTestResult(null), 4000);
    }
  }

  function togglePref(key: keyof NotificationPrefs): void {
    setPrefs((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  const slackAvailable = accountPlan === 'pro' || accountPlan === 'agency';

  return (
    <div>
      <h1 className="page-heading">Settings</h1>

      <nav className="mt-4 flex gap-1 border-b border-border mb-6">
        {SETTINGS_NAV.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`px-4 py-2.5 text-sm font-body transition-colors duration-fast -mb-px ${
              item.href === '/dashboard/settings/notifications'
                ? 'text-ink font-medium border-b-2 border-ink'
                : 'text-stone hover:text-ink border-b-2 border-transparent'
            }`}
          >
            {item.label}
          </Link>
        ))}
      </nav>

      <h2 className="font-display text-lg font-semibold text-ink">Email Notifications</h2>
      <p className="mt-1 text-sm text-stone">Choose which emails you want to receive.</p>

      {loading ? (
        <div className="mt-6 space-y-0 divide-y divide-border max-w-prose">
          {Array.from({ length: 7 }).map((_, i) => (
            <div key={i} className="flex items-center justify-between py-4">
              <div>
                <div className="skeleton h-4 w-40 mb-1" />
                <div className="skeleton h-3 w-64" />
              </div>
              <div className="skeleton h-6 w-11 rounded-pill flex-shrink-0 ml-4" />
            </div>
          ))}
          <div className="pt-4">
            <div className="skeleton h-10 w-36 rounded-md" />
          </div>
        </div>
      ) : (
        <>
          <div className="mt-6 space-y-0 divide-y divide-border max-w-prose">
            {EMAIL_OPTIONS.map((option) => (
              <div key={option.key} className="flex items-center justify-between py-4">
                <div>
                  <p className="text-sm font-medium text-ink font-body">{option.label}</p>
                  <p className="text-xs text-stone mt-0.5">{option.description}</p>
                </div>
                <button
                  type="button"
                  onClick={() => togglePref(option.key)}
                  className={`relative w-11 h-6 rounded-pill transition-colors duration-fast flex-shrink-0 ml-4 ${
                    prefs[option.key] ? 'bg-signal' : 'bg-border-dark'
                  }`}
                  role="switch"
                  aria-checked={prefs[option.key]}
                  aria-label={option.label}
                >
                  <span
                    className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-pill bg-white transition-transform duration-fast ${
                      prefs[option.key] ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            ))}
          </div>

          {/* Slack Integration */}
          <div className="mt-10 max-w-prose">
            <h2 className="font-display text-lg font-semibold text-ink">Slack Integration</h2>
            <p className="mt-1 text-sm text-stone">Receive lead notifications directly in a Slack channel.</p>

            {!slackAvailable ? (
              <div className="mt-4 card text-center py-6">
                <p className="text-sm text-stone mb-3">Slack notifications are available on Pro and Agency plans.</p>
                <Link href="/dashboard/settings/billing" className="btn-primary text-sm">
                  Upgrade Plan
                </Link>
              </div>
            ) : (
              <>
                <div className="mt-4">
                  <label htmlFor="slackWebhookUrl" className="input-label">Slack Webhook URL</label>
                  <div className="flex gap-2">
                    <input
                      id="slackWebhookUrl"
                      type="url"
                      value={slackWebhookUrl}
                      onChange={(e) => setSlackWebhookUrl(e.target.value)}
                      placeholder="https://hooks.slack.com/services/..."
                      className="input-field h-10 flex-1"
                    />
                    <button
                      type="button"
                      onClick={() => void handleTestSlack()}
                      disabled={testingSlack || !slackWebhookUrl.trim()}
                      className="btn-ghost h-10 text-sm"
                    >
                      {testingSlack ? 'Testing...' : 'Test'}
                    </button>
                  </div>
                  {slackTestResult !== null && (
                    <p className="mt-1 text-xs text-success">{slackTestResult}</p>
                  )}
                </div>

                <div className="mt-4 space-y-0 divide-y divide-border">
                  {SLACK_OPTIONS.map((option) => (
                    <div key={option.key} className="flex items-center justify-between py-4">
                      <div>
                        <p className="text-sm font-medium text-ink font-body">{option.label}</p>
                        <p className="text-xs text-stone mt-0.5">{option.description}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => togglePref(option.key)}
                        className={`relative w-11 h-6 rounded-pill transition-colors duration-fast flex-shrink-0 ml-4 ${
                          prefs[option.key] ? 'bg-signal' : 'bg-border-dark'
                        }`}
                        role="switch"
                        aria-checked={prefs[option.key]}
                        aria-label={option.label}
                      >
                        <span
                          className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-pill bg-white transition-transform duration-fast ${
                            prefs[option.key] ? 'translate-x-5' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          <div className="mt-6 flex items-center gap-2 max-w-prose">
            <button type="button" onClick={() => void handleSave()} disabled={saving} className="btn-primary">
              {saving ? (
                <span className="inline-flex items-center gap-2">
                  <span className="spinner w-4 h-4" />
                  Saving...
                </span>
              ) : 'Save Preferences'}
            </button>
            {saved && <span className="text-xs text-success">Saved</span>}
          </div>
        </>
      )}
    </div>
  );
}
