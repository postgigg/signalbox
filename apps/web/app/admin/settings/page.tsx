'use client';

import { useState, useEffect } from 'react';

interface PlatformSettings {
  maintenance_mode: { enabled: boolean; message: string };
  signup_enabled: { enabled: boolean };
  trial_days: { days: number };
  max_accounts_per_email: { limit: number };
  widget_bundle_version: { version: string };
  global_rate_limits: { submit_per_min: number; config_per_min: number };
  blocked_ips: { ips: string[] };
  blocked_domains: { domains: string[] };
}

const DEFAULT_SETTINGS: PlatformSettings = {
  maintenance_mode: { enabled: false, message: '' },
  signup_enabled: { enabled: true },
  trial_days: { days: 14 },
  max_accounts_per_email: { limit: 3 },
  widget_bundle_version: { version: '1.0.0' },
  global_rate_limits: { submit_per_min: 10, config_per_min: 100 },
  blocked_ips: { ips: [] },
  blocked_domains: { domains: [] },
};

export default function AdminSettingsPage(): React.ReactElement {
  const [settings, setSettings] = useState<PlatformSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [blockedIpsText, setBlockedIpsText] = useState('');
  const [blockedDomainsText, setBlockedDomainsText] = useState('');

  useEffect(() => {
    async function loadSettings(): Promise<void> {
      try {
        const { createBrowserClient } = await import('@supabase/ssr');
        const supabase = createBrowserClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL ?? '',
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ''
        );

        const { data } = await supabase.from('platform_settings').select('key, value');

        if (data) {
          const mapped: Record<string, unknown> = {};
          for (const row of data) {
            mapped[row.key] = row.value;
          }
          const newSettings = { ...DEFAULT_SETTINGS, ...mapped } as PlatformSettings;
          setSettings(newSettings);
          setBlockedIpsText(newSettings.blocked_ips.ips.join('\n'));
          setBlockedDomainsText(newSettings.blocked_domains.domains.join('\n'));
        }
      } catch {
        // Error
      } finally {
        setLoading(false);
      }
    }
    void loadSettings();
  }, []);

  async function handleSave(): Promise<void> {
    setSaving(true);
    try {
      const { createBrowserClient } = await import('@supabase/ssr');
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL ?? '',
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ''
      );

      const updatedSettings = {
        ...settings,
        blocked_ips: { ips: blockedIpsText.split('\n').map((s) => s.trim()).filter(Boolean) },
        blocked_domains: { domains: blockedDomainsText.split('\n').map((s) => s.trim()).filter(Boolean) },
      };

      const entries = Object.entries(updatedSettings) as [string, unknown][];
      for (const [key, value] of entries) {
        await supabase.from('platform_settings').upsert({ key, value: value as Record<string, unknown> });
      }

      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch {
      // Error
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <div className="card text-center py-10"><p className="text-sm text-stone">Loading settings...</p></div>;
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <h1 className="page-heading">Platform Settings</h1>
        <span className="text-xs font-body font-medium px-1.5 py-0.5 bg-danger text-white rounded-sm">ADMIN</span>
      </div>

      <div className="space-y-6 max-w-prose">
        {/* Maintenance Mode */}
        <div className="card">
          <h2 className="font-body text-sm font-semibold text-ink mb-3">Maintenance Mode</h2>
          <label className="flex items-center justify-between cursor-pointer mb-3">
            <span className="text-sm text-ink">Enabled</span>
            <button
              type="button"
              onClick={() => setSettings((prev) => ({
                ...prev,
                maintenance_mode: { ...prev.maintenance_mode, enabled: !prev.maintenance_mode.enabled },
              }))}
              className={`relative w-11 h-6 rounded-pill transition-colors duration-fast ${settings.maintenance_mode.enabled ? 'bg-danger' : 'bg-border-dark'}`}
              role="switch"
              aria-checked={settings.maintenance_mode.enabled}
            >
              <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-pill bg-white transition-transform duration-fast ${settings.maintenance_mode.enabled ? 'translate-x-5' : ''}`} />
            </button>
          </label>
          <input
            type="text"
            value={settings.maintenance_mode.message}
            onChange={(e) => setSettings((prev) => ({
              ...prev,
              maintenance_mode: { ...prev.maintenance_mode, message: e.target.value },
            }))}
            placeholder="Maintenance message to display"
            className="input-field h-10"
          />
        </div>

        {/* Signup Toggle */}
        <div className="card">
          <h2 className="font-body text-sm font-semibold text-ink mb-3">Signups</h2>
          <label className="flex items-center justify-between cursor-pointer">
            <span className="text-sm text-ink">Allow new signups</span>
            <button
              type="button"
              onClick={() => setSettings((prev) => ({
                ...prev,
                signup_enabled: { enabled: !prev.signup_enabled.enabled },
              }))}
              className={`relative w-11 h-6 rounded-pill transition-colors duration-fast ${settings.signup_enabled.enabled ? 'bg-signal' : 'bg-border-dark'}`}
              role="switch"
              aria-checked={settings.signup_enabled.enabled}
            >
              <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-pill bg-white transition-transform duration-fast ${settings.signup_enabled.enabled ? 'translate-x-5' : ''}`} />
            </button>
          </label>
        </div>

        {/* Trial & Limits */}
        <div className="card">
          <h2 className="font-body text-sm font-semibold text-ink mb-3">Defaults</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="trialDays" className="input-label">Trial Days</label>
              <input id="trialDays" type="number" min={1} value={settings.trial_days.days} onChange={(e) => setSettings((prev) => ({ ...prev, trial_days: { days: parseInt(e.target.value, 10) || 14 } }))} className="input-field h-10" />
            </div>
            <div>
              <label htmlFor="maxAccounts" className="input-label">Max Accounts/Email</label>
              <input id="maxAccounts" type="number" min={1} value={settings.max_accounts_per_email.limit} onChange={(e) => setSettings((prev) => ({ ...prev, max_accounts_per_email: { limit: parseInt(e.target.value, 10) || 3 } }))} className="input-field h-10" />
            </div>
          </div>
        </div>

        {/* Rate Limits */}
        <div className="card">
          <h2 className="font-body text-sm font-semibold text-ink mb-3">Rate Limits</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="submitRate" className="input-label">Submit/min</label>
              <input id="submitRate" type="number" min={1} value={settings.global_rate_limits.submit_per_min} onChange={(e) => setSettings((prev) => ({ ...prev, global_rate_limits: { ...prev.global_rate_limits, submit_per_min: parseInt(e.target.value, 10) || 10 } }))} className="input-field h-10" />
            </div>
            <div>
              <label htmlFor="configRate" className="input-label">Config/min</label>
              <input id="configRate" type="number" min={1} value={settings.global_rate_limits.config_per_min} onChange={(e) => setSettings((prev) => ({ ...prev, global_rate_limits: { ...prev.global_rate_limits, config_per_min: parseInt(e.target.value, 10) || 100 } }))} className="input-field h-10" />
            </div>
          </div>
        </div>

        {/* Blocked IPs */}
        <div className="card">
          <h2 className="font-body text-sm font-semibold text-ink mb-3">Blocked IPs</h2>
          <textarea
            value={blockedIpsText}
            onChange={(e) => setBlockedIpsText(e.target.value)}
            rows={4}
            placeholder="One IP per line"
            className="input-field h-auto py-2 font-mono text-xs resize-y"
          />
        </div>

        {/* Blocked Domains */}
        <div className="card">
          <h2 className="font-body text-sm font-semibold text-ink mb-3">Blocked Domains</h2>
          <textarea
            value={blockedDomainsText}
            onChange={(e) => setBlockedDomainsText(e.target.value)}
            rows={4}
            placeholder="One domain per line"
            className="input-field h-auto py-2 font-mono text-xs resize-y"
          />
        </div>

        {/* Widget Version */}
        <div className="card">
          <h2 className="font-body text-sm font-semibold text-ink mb-3">Widget Bundle</h2>
          <div>
            <label htmlFor="bundleVersion" className="input-label">Version</label>
            <input id="bundleVersion" type="text" value={settings.widget_bundle_version.version} onChange={(e) => setSettings((prev) => ({ ...prev, widget_bundle_version: { version: e.target.value } }))} className="input-field h-10 font-mono" />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button type="button" onClick={() => void handleSave()} disabled={saving} className="btn-primary">
            {saving ? 'Saving...' : 'Save All Settings'}
          </button>
          {saved && <span className="text-xs text-success">Saved</span>}
        </div>
      </div>
    </div>
  );
}
