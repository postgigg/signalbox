'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';

import type { FormEvent } from 'react';

interface ApiKeyEntry {
  readonly id: string;
  readonly name: string;
  readonly key_prefix: string;
  readonly last_used_at: string | null;
  readonly is_active: boolean;
  readonly created_at: string;
}

interface WebhookEntry {
  readonly id: string;
  readonly url: string;
  readonly events: string[];
  readonly is_active: boolean;
  readonly last_triggered_at: string | null;
  readonly last_status_code: number | null;
  readonly failure_count: number;
}

interface KeyLimits {
  readonly apiAccess: boolean;
  readonly maxKeys: number;
  readonly activeKeys: number;
}

const SETTINGS_NAV = [
  { href: '/dashboard/settings', label: 'Account' },
  { href: '/dashboard/settings/billing', label: 'Billing' },
  { href: '/dashboard/settings/notifications', label: 'Notifications' },
  { href: '/dashboard/settings/api', label: 'API' },
  { href: '/dashboard/settings/routing', label: 'Routing' },
  { href: '/dashboard/settings/scoring', label: 'Scoring' },
] as const;

export default function ApiSettingsPage(): React.ReactElement {
  const [apiKeys, setApiKeys] = useState<ApiKeyEntry[]>([]);
  const [webhooks, setWebhooks] = useState<WebhookEntry[]>([]);
  const [keyLimits, setKeyLimits] = useState<KeyLimits>({ apiAccess: false, maxKeys: 0, activeKeys: 0 });
  const [loading, setLoading] = useState(true);
  const [newKeyName, setNewKeyName] = useState('');
  const [newKeyRevealed, setNewKeyRevealed] = useState<string | null>(null);
  const [creatingKey, setCreatingKey] = useState(false);
  const [newWebhookUrl, setNewWebhookUrl] = useState('');
  const [creatingWebhook, setCreatingWebhook] = useState(false);

  useEffect(() => {
    async function loadData(): Promise<void> {
      try {
        // Load API keys via server API
        const keysResponse = await fetch('/api/v1/api-keys');
        if (keysResponse.ok) {
          const keysJson = await keysResponse.json() as {
            data: ApiKeyEntry[];
            limits: KeyLimits;
          };
          setApiKeys(keysJson.data ?? []);
          setKeyLimits(keysJson.limits);
        }

        // Load webhooks via Supabase browser client
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

        const { data: webhooksData } = await supabase
          .from('webhook_endpoints')
          .select('id, url, events, is_active, last_triggered_at, last_status_code, failure_count')
          .eq('account_id', memberData.account_id)
          .order('created_at', { ascending: false });

        setWebhooks((webhooksData as WebhookEntry[]) ?? []);
      } catch {
        // Failed to load
      } finally {
        setLoading(false);
      }
    }
    void loadData();
  }, []);

  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  async function handleCreateKey(e: FormEvent<HTMLFormElement>): Promise<void> {
    e.preventDefault();
    setError(null);
    setCreatingKey(true);

    try {
      const response = await fetch('/api/v1/api-keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newKeyName.trim() }),
      });

      const json = await response.json() as {
        data?: ApiKeyEntry;
        rawKey?: string;
        error?: string;
      };

      if (!response.ok) {
        setError(json.error ?? 'Failed to create API key.');
        return;
      }

      if (json.rawKey) {
        setNewKeyRevealed(json.rawKey);
      }
      setNewKeyName('');

      // Reload keys list
      const keysResponse = await fetch('/api/v1/api-keys');
      if (keysResponse.ok) {
        const keysJson = await keysResponse.json() as {
          data: ApiKeyEntry[];
          limits: KeyLimits;
        };
        setApiKeys(keysJson.data ?? []);
        setKeyLimits(keysJson.limits);
      }
    } catch {
      setError('Failed to create API key.');
    } finally {
      setCreatingKey(false);
    }
  }

  async function handleRevokeKey(keyId: string): Promise<void> {
    setError(null);
    try {
      const response = await fetch(`/api/v1/api-keys/${keyId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const json = await response.json() as { error?: string };
        setError(json.error ?? 'Failed to revoke API key.');
        return;
      }

      setApiKeys((prev) =>
        prev.map((k) => (k.id === keyId ? { ...k, is_active: false } : k))
      );
      setKeyLimits((prev) => ({
        ...prev,
        activeKeys: Math.max(0, prev.activeKeys - 1),
      }));
    } catch {
      setError('Failed to revoke API key.');
    }
  }

  async function handleCreateWebhook(e: FormEvent<HTMLFormElement>): Promise<void> {
    e.preventDefault();
    setError(null);
    setCreatingWebhook(true);

    try {
      const { createBrowserClient } = await import('@supabase/ssr');
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL ?? '',
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ''
      );

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setError('You must be logged in.');
        return;
      }

      const { data: memberData } = await supabase
        .from('members')
        .select('account_id')
        .eq('user_id', user.id)
        .limit(1)
        .single();

      if (!memberData) {
        setError('Account not found.');
        return;
      }

      const trimmedUrl = newWebhookUrl.trim();

      // Validate webhook URL before creating
      if (!trimmedUrl.startsWith('https://')) {
        setError('Webhook URLs must use HTTPS.');
        return;
      }

      try {
        const parsedUrl = new URL(trimmedUrl);
        if (
          parsedUrl.hostname === 'localhost' ||
          parsedUrl.hostname.endsWith('.localhost') ||
          parsedUrl.hostname === '127.0.0.1' ||
          parsedUrl.hostname === '::1' ||
          parsedUrl.hostname.startsWith('10.') ||
          parsedUrl.hostname.startsWith('192.168.') ||
          /^172\.(1[6-9]|2\d|3[01])\./.test(parsedUrl.hostname) ||
          parsedUrl.hostname.startsWith('169.254.')
        ) {
          setError('Webhook URLs cannot target private or internal addresses.');
          return;
        }
      } catch {
        setError('Invalid URL format.');
        return;
      }

      const { error: insertError } = await supabase
        .from('webhook_endpoints')
        .insert({
          account_id: memberData.account_id,
          url: trimmedUrl,
          events: ['submission.created'],
          secret: crypto.randomUUID(),
        });

      if (insertError) {
        setError(insertError.message);
        return;
      }

      setNewWebhookUrl('');

      // Reload webhooks list
      const { data: webhooksData } = await supabase
        .from('webhook_endpoints')
        .select('id, url, events, is_active, last_triggered_at, last_status_code, failure_count')
        .eq('account_id', memberData.account_id)
        .order('created_at', { ascending: false });

      setWebhooks((webhooksData as WebhookEntry[]) ?? []);
      setSuccessMessage('Webhook endpoint added.');
      setTimeout(() => setSuccessMessage(null), 2000);
    } catch {
      setError('Failed to add webhook endpoint.');
    } finally {
      setCreatingWebhook(false);
    }
  }

  async function handleDeleteWebhook(webhookId: string): Promise<void> {
    setError(null);
    try {
      const { createBrowserClient } = await import('@supabase/ssr');
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL ?? '',
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ''
      );

      const { error: deleteError } = await supabase
        .from('webhook_endpoints')
        .delete()
        .eq('id', webhookId);

      if (deleteError) {
        setError(deleteError.message);
        return;
      }

      setWebhooks((prev) => prev.filter((w) => w.id !== webhookId));
    } catch {
      setError('Failed to delete webhook.');
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
              item.href === '/dashboard/settings/api'
                ? 'text-ink font-medium border-b-2 border-ink'
                : 'text-stone hover:text-ink border-b-2 border-transparent'
            }`}
          >
            {item.label}
          </Link>
        ))}
      </nav>

      {error !== null && (
        <div className="mb-4 p-3 rounded-sm bg-danger-light text-danger text-sm border border-danger/20">
          {error}
        </div>
      )}

      {successMessage !== null && (
        <div className="mb-4 p-3 rounded-sm bg-success-light text-success text-sm border border-success/20">
          {successMessage}
        </div>
      )}

      {loading ? (
        <div className="space-y-8">
          <div>
            <div className="skeleton h-6 w-20 mb-1" />
            <div className="skeleton h-4 w-72 mt-1 mb-4" />
            <div className="flex gap-2">
              <div className="skeleton h-10 flex-1 max-w-xs rounded-sm" />
              <div className="skeleton h-10 w-28 rounded-md" />
            </div>
            <div className="mt-4 card text-center py-8">
              <div className="skeleton h-4 w-44 mx-auto" />
            </div>
          </div>
          <div>
            <div className="skeleton h-6 w-40 mb-1" />
            <div className="skeleton h-4 w-80 mt-1 mb-4" />
            <div className="flex gap-2">
              <div className="skeleton h-10 flex-1 rounded-sm" />
              <div className="skeleton h-10 w-32 rounded-md" />
            </div>
            <div className="mt-4 card text-center py-8">
              <div className="skeleton h-4 w-56 mx-auto" />
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-8">
          {/* API Keys */}
          <div>
            <h2 className="font-display text-lg font-semibold text-ink">API Keys</h2>
            <p className="mt-1 text-sm text-stone">
              Use API keys to authenticate programmatic access. Keys are shown once on creation.
            </p>

            {!keyLimits.apiAccess ? (
              <div className="mt-4 card text-center py-8">
                <p className="text-sm text-stone mb-3">API access is not available on your current plan.</p>
                <Link href="/dashboard/settings/billing" className="btn-primary text-sm">
                  Upgrade Plan
                </Link>
              </div>
            ) : (
              <>
                <p className="mt-2 text-xs text-stone">
                  {String(keyLimits.activeKeys)} of {String(keyLimits.maxKeys)} API keys used
                </p>

                {newKeyRevealed !== null && (
                  <div className="mt-4 p-4 bg-warning-light border border-warning/20 rounded-sm">
                    <p className="text-sm font-medium text-ink">
                      Copy this key now. It will not be shown again.
                    </p>
                    <div className="mt-2 flex items-center gap-2">
                      <code className="flex-1 bg-surface p-2 rounded-sm text-sm font-mono text-ink border border-border">
                        {newKeyRevealed}
                      </code>
                      <button
                        type="button"
                        onClick={() => {
                          void navigator.clipboard.writeText(newKeyRevealed);
                        }}
                        className="btn-ghost text-xs h-8"
                      >
                        Copy
                      </button>
                      <button
                        type="button"
                        onClick={() => setNewKeyRevealed(null)}
                        className="btn-ghost text-xs h-8"
                      >
                        Dismiss
                      </button>
                    </div>
                  </div>
                )}

                <form onSubmit={handleCreateKey} className="mt-4 flex gap-2">
                  <input
                    type="text"
                    placeholder="Key name (e.g. Production)"
                    value={newKeyName}
                    onChange={(e) => setNewKeyName(e.target.value)}
                    required
                    className="input-field h-10 flex-1 max-w-xs"
                  />
                  <button type="submit" disabled={creatingKey} className="btn-primary h-10">
                    {creatingKey ? (
                      <span className="inline-flex items-center gap-2">
                        <span className="spinner w-4 h-4" />
                        Creating...
                      </span>
                    ) : 'Create Key'}
                  </button>
                </form>

                {apiKeys.length === 0 ? (
                  <div className="mt-4 card text-center py-8">
                    <p className="text-sm text-stone">No API keys created yet.</p>
                  </div>
                ) : (
                  <div className="mt-4 overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="table-header">
                          <th className="text-left py-3 px-4 font-medium">Name</th>
                          <th className="text-left py-3 px-4 font-medium">Prefix</th>
                          <th className="text-left py-3 px-4 font-medium">Last Used</th>
                          <th className="text-left py-3 px-4 font-medium">Status</th>
                          <th className="text-right py-3 px-4 font-medium">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {apiKeys.map((key) => (
                          <tr key={key.id} className="table-row">
                            <td className="py-3 px-4 font-medium text-ink">{key.name}</td>
                            <td className="py-3 px-4 font-mono text-stone">{key.key_prefix}...</td>
                            <td className="py-3 px-4 text-stone">
                              {key.last_used_at ? new Date(key.last_used_at).toLocaleDateString() : 'Never'}
                            </td>
                            <td className="py-3 px-4">
                              <span className={`text-xs px-2 py-0.5 rounded-pill font-medium ${key.is_active ? 'bg-success-light text-success' : 'bg-surface-alt text-stone'}`}>
                                {key.is_active ? 'Active' : 'Revoked'}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-right">
                              {key.is_active && (
                                <button
                                  type="button"
                                  onClick={() => void handleRevokeKey(key.id)}
                                  className="text-xs text-danger hover:text-danger/80 transition-colors duration-fast"
                                >
                                  Revoke
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Webhooks */}
          <div>
            <h2 className="font-display text-lg font-semibold text-ink">Webhook Endpoints</h2>
            <p className="mt-1 text-sm text-stone">
              Receive HTTP POST notifications when leads are submitted.
            </p>

            <form onSubmit={handleCreateWebhook} className="mt-4 flex gap-2">
              <input
                type="url"
                placeholder="https://your-app.com/webhook"
                value={newWebhookUrl}
                onChange={(e) => setNewWebhookUrl(e.target.value)}
                required
                className="input-field h-10 flex-1"
              />
              <button type="submit" disabled={creatingWebhook} className="btn-primary h-10">
                {creatingWebhook ? (
                  <span className="inline-flex items-center gap-2">
                    <span className="spinner w-4 h-4" />
                    Adding...
                  </span>
                ) : 'Add Endpoint'}
              </button>
            </form>

            {webhooks.length === 0 ? (
              <div className="mt-4 card text-center py-8">
                <p className="text-sm text-stone">No webhook endpoints configured.</p>
              </div>
            ) : (
              <div className="mt-4 space-y-3">
                {webhooks.map((webhook) => (
                  <div key={webhook.id} className="card">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm font-mono text-ink truncate max-w-md">{webhook.url}</p>
                        <div className="flex items-center gap-3 mt-1 text-xs text-stone">
                          <span>Events: {webhook.events.join(', ')}</span>
                          {webhook.last_triggered_at && (
                            <span>Last fired: {new Date(webhook.last_triggered_at).toLocaleDateString()}</span>
                          )}
                          {webhook.failure_count > 0 && (
                            <span className="text-danger">{webhook.failure_count} failures</span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs px-2 py-0.5 rounded-pill font-medium ${webhook.is_active ? 'bg-success-light text-success' : 'bg-surface-alt text-stone'}`}>
                          {webhook.is_active ? 'Active' : 'Disabled'}
                        </span>
                        <button
                          type="button"
                          onClick={() => void handleDeleteWebhook(webhook.id)}
                          className="text-xs text-danger hover:text-danger/80 transition-colors duration-fast"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
