'use client';

import { useState, useEffect } from 'react';

import { APP_URL } from '@/lib/constants';

import type { FormEvent } from 'react';

interface SharedLink {
  readonly id: string;
  readonly name: string;
  readonly token: string;
  readonly is_active: boolean;
  readonly expires_at: string | null;
  readonly client_account_id: string | null;
  readonly widget_id: string | null;
  readonly allowed_metrics: string[];
  readonly access_count: number;
  readonly last_accessed_at: string | null;
  readonly created_at: string;
}

export default function SharedAnalyticsManagePage(): React.ReactElement {
  const [links, setLinks] = useState<SharedLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  // Form
  const [formName, setFormName] = useState('');
  const [formPassword, setFormPassword] = useState('');

  useEffect(() => {
    async function load(): Promise<void> {
      try {
        const response = await fetch('/api/v1/shared-analytics');
        if (response.ok) {
          const result = await response.json() as { data: SharedLink[] };
          setLinks(result.data);
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
      const body: Record<string, unknown> = { name: formName };
      if (formPassword.length > 0) {
        body.password = formPassword;
      }

      const response = await fetch('/api/v1/shared-analytics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const result = await response.json() as { error: string };
        setError(result.error);
        return;
      }

      const result = await response.json() as { data: SharedLink };
      setLinks((prev) => [result.data, ...prev]);
      setShowForm(false);
      setFormName('');
      setFormPassword('');
    } catch {
      setError('Failed to create link.');
    } finally {
      setCreating(false);
    }
  }

  async function handleToggle(linkId: string, currentActive: boolean): Promise<void> {
    try {
      const response = await fetch(`/api/v1/shared-analytics/${linkId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !currentActive }),
      });
      if (response.ok) {
        setLinks((prev) => prev.map((l) =>
          l.id === linkId ? { ...l, is_active: !currentActive } : l
        ));
      }
    } catch {
      // Toggle failed
    }
  }

  async function handleDelete(linkId: string): Promise<void> {
    if (!confirm('Delete this shared link?')) return;
    try {
      const response = await fetch(`/api/v1/shared-analytics/${linkId}`, { method: 'DELETE' });
      if (response.ok) {
        setLinks((prev) => prev.filter((l) => l.id !== linkId));
      }
    } catch {
      // Delete failed
    }
  }

  function copyLink(token: string): void {
    const url = `${APP_URL}/analytics/${token}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(token);
      setTimeout(() => setCopied(null), 2000);
    }).catch(() => {
      // Copy failed
    });
  }

  return (
    <div>
      <h1 className="page-heading">Shared Analytics</h1>
      <p className="mt-1 text-sm text-stone font-body">
        Generate shareable links to read-only analytics dashboards for your clients.
      </p>

      {error !== null && (
        <div className="mt-4 p-3 rounded-sm bg-danger-light text-danger text-sm border border-danger/20">
          {error}
        </div>
      )}

      <div className="mt-4 flex justify-end">
        <button type="button" onClick={() => setShowForm(!showForm)} className="btn-primary text-sm">
          {showForm ? 'Cancel' : 'Create Link'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="mt-4 card p-5 space-y-4">
          <div>
            <label htmlFor="link-name" className="block text-sm font-medium text-ink mb-1">Link Name</label>
            <input
              id="link-name"
              type="text"
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              required
              className="input-field w-full"
              placeholder="e.g. Acme Corp Q1 Report"
            />
          </div>
          <div>
            <label htmlFor="link-password" className="block text-sm font-medium text-ink mb-1">Password (optional)</label>
            <input
              id="link-password"
              type="password"
              value={formPassword}
              onChange={(e) => setFormPassword(e.target.value)}
              className="input-field w-full"
              placeholder="Leave blank for no password"
              minLength={6}
            />
          </div>
          <button type="submit" disabled={creating} className="btn-primary text-sm">
            {creating ? (
              <span className="inline-flex items-center gap-2">
                <span className="spinner w-4 h-4" />
                Creating...
              </span>
            ) : 'Create Link'}
          </button>
        </form>
      )}

      <div className="mt-6">
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="card p-4">
                <div className="skeleton h-4 w-48" />
                <div className="mt-2 skeleton h-3 w-64" />
              </div>
            ))}
          </div>
        ) : links.length === 0 ? (
          <div className="card text-center py-10">
            <p className="text-sm text-stone">No shared analytics links yet.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {links.map((link) => (
              <div key={link.id} className="card p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${link.is_active ? 'bg-success' : 'bg-stone-light'}`} />
                      <span className="text-sm font-medium text-ink">{link.name}</span>
                    </div>
                    <div className="mt-1 flex items-center gap-3 text-xs text-stone">
                      <span>Views: {link.access_count}</span>
                      {link.last_accessed_at !== null && (
                        <span>Last viewed: {new Date(link.last_accessed_at).toLocaleDateString()}</span>
                      )}
                      {link.expires_at !== null && (
                        <span>Expires: {new Date(link.expires_at).toLocaleDateString()}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => copyLink(link.token)}
                      className="btn-secondary text-xs px-3 py-1.5"
                    >
                      {copied === link.token ? 'Copied' : 'Copy Link'}
                    </button>
                    <button
                      type="button"
                      onClick={() => void handleToggle(link.id, link.is_active)}
                      className="btn-secondary text-xs px-3 py-1.5"
                    >
                      {link.is_active ? 'Deactivate' : 'Activate'}
                    </button>
                    <button
                      type="button"
                      onClick={() => void handleDelete(link.id)}
                      className="text-xs text-danger hover:text-danger/80 transition-colors duration-fast px-2 py-1.5"
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
  );
}
