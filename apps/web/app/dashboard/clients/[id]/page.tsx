'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useState, useEffect } from 'react';

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
      } catch {
        setError('Failed to load client.');
      } finally {
        setLoading(false);
      }
    }
    void loadClient();
  }, [clientId]);

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
      </div>

      {client.notes && (
        <div className="mb-6 card">
          <p className="text-xs text-stone uppercase tracking-wide mb-1">Notes</p>
          <p className="text-sm text-ink">{client.notes}</p>
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
