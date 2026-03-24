'use client';

import Link from 'next/link';
import { useState, useEffect, useCallback } from 'react';

import { APP_URL } from '@/lib/constants';

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

interface ClientEntry {
  readonly id: string;
  readonly name: string;
}

interface GroupedLinks {
  readonly clientId: string;
  readonly clientName: string;
  readonly links: SharedLink[];
}

export default function SharedAnalyticsManagePage(): React.ReactElement {
  const [groups, setGroups] = useState<GroupedLinks[]>([]);
  const [ungrouped, setUngrouped] = useState<SharedLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    async function load(): Promise<void> {
      try {
        const [linksRes, clientsRes] = await Promise.all([
          fetch('/api/v1/shared-analytics'),
          fetch('/api/v1/clients'),
        ]);

        const linksJson = linksRes.ok
          ? (await linksRes.json() as { data: SharedLink[] })
          : { data: [] };
        const clientsJson = clientsRes.ok
          ? (await clientsRes.json() as { data: ClientEntry[] })
          : { data: [] };

        const clientMap = new Map<string, string>();
        for (const c of clientsJson.data) {
          clientMap.set(c.id, c.name);
        }

        const grouped = new Map<string, SharedLink[]>();
        const noClient: SharedLink[] = [];

        for (const link of linksJson.data) {
          if (link.client_account_id !== null && clientMap.has(link.client_account_id)) {
            const existing = grouped.get(link.client_account_id) ?? [];
            existing.push(link);
            grouped.set(link.client_account_id, existing);
          } else {
            noClient.push(link);
          }
        }

        const result: GroupedLinks[] = [];
        for (const [clientId, links] of grouped.entries()) {
          result.push({
            clientId,
            clientName: clientMap.get(clientId) ?? 'Unknown',
            links,
          });
        }

        setGroups(result);
        setUngrouped(noClient);
      } catch {
        // Failed to load
      } finally {
        setLoading(false);
      }
    }
    void load();
  }, []);

  const handleToggle = useCallback(async (linkId: string, currentActive: boolean): Promise<void> => {
    const response = await fetch(`/api/v1/shared-analytics/${linkId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isActive: !currentActive }),
    });
    if (response.ok) {
      const updater = (prev: SharedLink[]): SharedLink[] =>
        prev.map((l) => l.id === linkId ? { ...l, is_active: !currentActive } : l);
      setGroups((prev) => prev.map((g) => ({ ...g, links: updater(g.links) })));
      setUngrouped(updater);
    }
  }, []);

  const handleDelete = useCallback(async (linkId: string): Promise<void> => {
    const response = await fetch(`/api/v1/shared-analytics/${linkId}`, { method: 'DELETE' });
    if (response.ok) {
      const remover = (prev: SharedLink[]): SharedLink[] => prev.filter((l) => l.id !== linkId);
      setGroups((prev) => prev.map((g) => ({ ...g, links: remover(g.links) })).filter((g) => g.links.length > 0));
      setUngrouped(remover);
    }
  }, []);

  const copyLink = useCallback((token: string): void => {
    const url = `${APP_URL}/analytics/${token}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(token);
      setTimeout(() => setCopied(null), 2000);
    }).catch(() => { /* copy failed */ });
  }, []);

  function renderLink(link: SharedLink): React.ReactElement {
    return (
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
    );
  }

  const totalLinks = groups.reduce((sum, g) => sum + g.links.length, 0) + ungrouped.length;

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <h1 className="page-heading">Shared Analytics</h1>
        <Link href="/dashboard/clients" className="btn-secondary text-sm">
          Back to Clients
        </Link>
      </div>
      <p className="text-sm text-stone font-body">
        All shared analytics links across your clients. To create a new link, go to a client's detail page and click "Share Live Link".
      </p>

      <div className="mt-6">
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="card p-4">
                <div className="skeleton h-4 w-48" />
                <div className="mt-2 skeleton h-3 w-64" />
              </div>
            ))}
          </div>
        ) : totalLinks === 0 ? (
          <div className="card text-center py-10">
            <p className="text-sm text-stone mb-2">No shared analytics links yet.</p>
            <p className="text-xs text-stone">
              Go to a client's page and click "Share Live Link" to create one.
            </p>
            <Link href="/dashboard/clients" className="mt-3 inline-block text-sm text-signal hover:text-signal/80 transition-colors duration-150">
              View Clients
            </Link>
          </div>
        ) : (
          <div className="space-y-8">
            {groups.map((group) => (
              <div key={group.clientId}>
                <div className="flex items-center justify-between mb-3">
                  <h2 className="font-display text-base font-semibold text-ink">
                    {group.clientName}
                  </h2>
                  <Link
                    href={`/dashboard/clients/${group.clientId}`}
                    className="text-xs text-signal hover:text-signal/80 transition-colors duration-150"
                  >
                    View Client
                  </Link>
                </div>
                <div className="space-y-2">
                  {group.links.map(renderLink)}
                </div>
              </div>
            ))}

            {ungrouped.length > 0 && (
              <div>
                <h2 className="font-display text-base font-semibold text-ink mb-3">
                  Not assigned to a client
                </h2>
                <div className="space-y-2">
                  {ungrouped.map(renderLink)}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
