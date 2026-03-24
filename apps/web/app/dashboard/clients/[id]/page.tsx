'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useState, useEffect, useCallback } from 'react';

import { APP_URL } from '@/lib/constants';

interface ClientWidget {
  readonly id: string;
  readonly name: string;
  readonly widget_key: string;
  readonly is_active: boolean;
  readonly submission_count: number;
  readonly created_at: string;
}

interface ClientLead {
  readonly id: string;
  readonly visitor_name: string;
  readonly visitor_email: string;
  readonly lead_tier: 'hot' | 'warm' | 'cold';
  readonly lead_score: number;
  readonly created_at: string;
}

interface SharedLink {
  readonly id: string;
  readonly name: string;
  readonly token: string;
  readonly is_active: boolean;
  readonly access_count: number;
  readonly last_accessed_at: string | null;
  readonly created_at: string;
}

interface ClientDetail {
  readonly id: string;
  readonly name: string;
  readonly slug: string;
  readonly contact_name: string | null;
  readonly contact_email: string | null;
  readonly notes: string | null;
  readonly is_active: boolean;
  readonly widgets: ClientWidget[];
  readonly leads: ClientLead[];
  readonly created_at: string;
}

const TIER_COLORS: Record<string, string> = {
  hot: 'text-danger',
  warm: 'text-warning',
  cold: 'text-stone',
};

export default function ClientDetailPage(): React.ReactElement {
  const params = useParams();
  const clientId = typeof params.id === 'string' ? params.id : '';

  const [client, setClient] = useState<ClientDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Shared analytics links for this client
  const [sharedLinks, setSharedLinks] = useState<SharedLink[]>([]);
  const [creatingLink, setCreatingLink] = useState(false);
  const [linkName, setLinkName] = useState('');
  const [linkPassword, setLinkPassword] = useState('');
  const [showLinkForm, setShowLinkForm] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [linkError, setLinkError] = useState<string | null>(null);

  useEffect(() => {
    async function loadClient(): Promise<void> {
      try {
        const response = await fetch(`/api/v1/clients/${clientId}`);
        if (response.ok) {
          const json = await response.json() as { data: ClientDetail };
          setClient(json.data);
        } else {
          setError('Client not found.');
        }

        // Load shared links for this client
        const linksResponse = await fetch('/api/v1/shared-analytics');
        if (linksResponse.ok) {
          const linksJson = await linksResponse.json() as { data: Array<SharedLink & { client_account_id: string | null }> };
          setSharedLinks(
            linksJson.data.filter((l) => l.client_account_id === clientId)
          );
        }
      } catch {
        setError('Failed to load client.');
      } finally {
        setLoading(false);
      }
    }
    void loadClient();
  }, [clientId]);

  const handleCreateLink = useCallback(async (): Promise<void> => {
    if (linkName.trim().length === 0) return;
    setLinkError(null);
    setCreatingLink(true);
    try {
      const body: Record<string, unknown> = {
        name: linkName.trim(),
        clientAccountId: clientId,
      };
      if (linkPassword.length > 0) {
        body.password = linkPassword;
      }

      const response = await fetch('/api/v1/shared-analytics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const result = await response.json() as { error: string };
        setLinkError(result.error);
        return;
      }

      const result = await response.json() as { data: SharedLink };
      setSharedLinks((prev) => [result.data, ...prev]);
      setShowLinkForm(false);
      setLinkName('');
      setLinkPassword('');
    } catch {
      setLinkError('Failed to create link.');
    } finally {
      setCreatingLink(false);
    }
  }, [clientId, linkName, linkPassword]);

  const handleToggleLink = useCallback(async (linkId: string, currentActive: boolean): Promise<void> => {
    const response = await fetch(`/api/v1/shared-analytics/${linkId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isActive: !currentActive }),
    });
    if (response.ok) {
      setSharedLinks((prev) => prev.map((l) =>
        l.id === linkId ? { ...l, is_active: !currentActive } : l
      ));
    }
  }, []);

  const handleDeleteLink = useCallback(async (linkId: string): Promise<void> => {
    const response = await fetch(`/api/v1/shared-analytics/${linkId}`, { method: 'DELETE' });
    if (response.ok) {
      setSharedLinks((prev) => prev.filter((l) => l.id !== linkId));
    }
  }, []);

  const copyLink = useCallback((token: string): void => {
    const url = `${APP_URL}/analytics/${token}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(token);
      setTimeout(() => setCopied(null), 2000);
    }).catch(() => { /* copy failed */ });
  }, []);

  if (loading) {
    return (
      <div>
        <div className="flex items-center gap-2 mb-6">
          <div className="skeleton h-4 w-16" />
          <span className="text-stone-light">/</span>
          <div className="skeleton h-4 w-32" />
        </div>
        <div className="skeleton h-8 w-48 mb-6" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="card">
              <div className="skeleton h-5 w-20 mb-4" />
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((__, j) => (
                  <div key={j} className="skeleton h-4 w-full" />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error !== null || !client) {
    return (
      <div>
        <div className="flex items-center gap-2 mb-6">
          <Link href="/dashboard/clients" className="text-sm text-stone hover:text-ink transition-colors duration-fast">Clients</Link>
          <span className="text-stone-light">/</span>
          <span className="text-sm text-ink font-medium">Not found</span>
        </div>
        <div className="card text-center py-12">
          <p className="text-sm text-stone">{error ?? 'Client not found.'}</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-2 mb-6">
        <Link href="/dashboard/clients" className="text-sm text-stone hover:text-ink transition-colors duration-fast">Clients</Link>
        <span className="text-stone-light">/</span>
        <span className="text-sm text-ink font-medium">{client.name}</span>
      </div>

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="page-heading">{client.name}</h1>
          <div className="flex items-center gap-3 mt-1 text-sm text-stone">
            {client.contact_email && <span>{client.contact_email}</span>}
            {client.contact_name && <span>{client.contact_name}</span>}
            {!client.is_active && (
              <span className="text-xs px-1.5 py-0.5 rounded-pill bg-surface-alt text-stone">Inactive</span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href={`/dashboard/widgets/new`}
            className="btn-secondary text-sm"
          >
            New Widget
          </Link>
          <button
            type="button"
            onClick={() => setShowLinkForm(!showLinkForm)}
            className="btn-primary text-sm"
          >
            {showLinkForm ? 'Cancel' : 'Share Live Link'}
          </button>
        </div>
      </div>

      {client.notes && (
        <div className="mb-6 card">
          <p className="text-xs text-stone uppercase tracking-wide mb-1">Notes</p>
          <p className="text-sm text-ink">{client.notes}</p>
        </div>
      )}

      {/* Create Shared Link Form */}
      {showLinkForm && (
        <div className="mb-6 card space-y-4">
          <h3 className="font-display text-base font-semibold text-ink">Create Shared Analytics Link</h3>
          <p className="text-xs text-stone">
            Generate a read-only link your client can use to view their analytics dashboard. Optionally protect it with a PIN.
          </p>
          {linkError !== null && (
            <div className="p-2 rounded-sm bg-danger-light text-danger text-xs border border-danger/20">
              {linkError}
            </div>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label htmlFor="share-link-name" className="block text-sm font-medium text-ink mb-1">Link Name</label>
              <input
                id="share-link-name"
                type="text"
                value={linkName}
                onChange={(e) => setLinkName(e.target.value)}
                placeholder={`${client.name} Dashboard`}
                className="input-field w-full"
              />
            </div>
            <div>
              <label htmlFor="share-link-pin" className="block text-sm font-medium text-ink mb-1">PIN (optional)</label>
              <input
                id="share-link-pin"
                type="text"
                value={linkPassword}
                onChange={(e) => setLinkPassword(e.target.value)}
                placeholder="6+ character PIN"
                className="input-field w-full"
                minLength={6}
              />
              <p className="mt-1 text-xs text-stone">Client will need this PIN to view the dashboard.</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => void handleCreateLink()}
            disabled={creatingLink || linkName.trim().length === 0}
            className="btn-primary text-sm"
          >
            {creatingLink ? (
              <span className="inline-flex items-center gap-2">
                <span className="spinner w-4 h-4" />
                Creating...
              </span>
            ) : 'Create Link'}
          </button>
        </div>
      )}

      {/* Shared Analytics Links */}
      {sharedLinks.length > 0 && (
        <div className="mb-6">
          <h2 className="font-display text-base font-semibold text-ink mb-3">
            Shared Links ({String(sharedLinks.length)})
          </h2>
          <div className="space-y-2">
            {sharedLinks.map((link) => (
              <div key={link.id} className="card p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${link.is_active ? 'bg-success' : 'bg-stone-light'}`} />
                      <span className="text-sm font-medium text-ink">{link.name}</span>
                    </div>
                    <div className="mt-1 text-xs text-stone font-mono truncate">
                      {APP_URL}/analytics/{link.token}
                    </div>
                    <div className="mt-1 flex items-center gap-3 text-xs text-stone">
                      <span>Views: {String(link.access_count)}</span>
                      {link.last_accessed_at !== null && (
                        <span>Last viewed: {new Date(link.last_accessed_at).toLocaleDateString()}</span>
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
                      onClick={() => void handleToggleLink(link.id, link.is_active)}
                      className="btn-secondary text-xs px-3 py-1.5"
                    >
                      {link.is_active ? 'Deactivate' : 'Activate'}
                    </button>
                    <button
                      type="button"
                      onClick={() => void handleDeleteLink(link.id)}
                      className="text-xs text-danger hover:text-danger/80 transition-colors duration-fast px-2 py-1.5"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Widgets */}
        <div>
          <h2 className="font-display text-base font-semibold text-ink mb-3">
            Widgets ({String(client.widgets.length)})
          </h2>
          {client.widgets.length === 0 ? (
            <div className="card text-center py-8">
              <p className="text-sm text-stone">No widgets assigned to this client.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {client.widgets.map((widget) => (
                <Link key={widget.id} href={`/dashboard/widgets/${widget.id}`} className="card block hover:shadow-sm transition-shadow duration-fast">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-ink">{widget.name}</p>
                      <p className="text-xs text-stone font-mono mt-0.5">{widget.widget_key}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-stone">{String(widget.submission_count)} leads</span>
                      <span className={`text-xs px-1.5 py-0.5 rounded-pill font-medium ${widget.is_active ? 'bg-success-light text-success' : 'bg-surface-alt text-stone'}`}>
                        {widget.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Recent Leads */}
        <div>
          <h2 className="font-display text-base font-semibold text-ink mb-3">
            Recent Leads ({String(client.leads.length)})
          </h2>
          {client.leads.length === 0 ? (
            <div className="card text-center py-8">
              <p className="text-sm text-stone">No leads for this client yet.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {client.leads.map((lead) => (
                <Link key={lead.id} href={`/dashboard/leads?search=${encodeURIComponent(lead.visitor_email)}`} className="card block hover:shadow-sm transition-shadow duration-fast">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-ink">{lead.visitor_name}</p>
                      <p className="text-xs text-stone mt-0.5">{lead.visitor_email}</p>
                    </div>
                    <div className="text-right">
                      <span className={`text-xs font-semibold uppercase ${TIER_COLORS[lead.lead_tier] ?? 'text-stone'}`}>
                        {lead.lead_tier}
                      </span>
                      <p className="text-xs text-stone font-mono">{String(lead.lead_score)}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
