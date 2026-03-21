'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';

import type { FormEvent } from 'react';

interface ClientEntry {
  readonly id: string;
  readonly name: string;
  readonly slug: string;
  readonly contact_name: string | null;
  readonly contact_email: string | null;
  readonly is_active: boolean;
  readonly widget_count: number;
  readonly lead_count: number;
  readonly created_at: string;
}

export default function ClientsPage(): React.ReactElement {
  const [clients, setClients] = useState<ClientEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [newName, setNewName] = useState('');
  const [newSlug, setNewSlug] = useState('');
  const [newContactName, setNewContactName] = useState('');
  const [newContactEmail, setNewContactEmail] = useState('');

  useEffect(() => {
    async function loadClients(): Promise<void> {
      try {
        const response = await fetch('/api/v1/clients');
        if (response.ok) {
          const json = await response.json() as { data: ClientEntry[] };
          setClients(json.data ?? []);
        }
      } catch {
        // Failed to load
      } finally {
        setLoading(false);
      }
    }
    void loadClients();
  }, []);

  async function handleCreateClient(e: FormEvent<HTMLFormElement>): Promise<void> {
    e.preventDefault();
    setError(null);
    setCreating(true);

    try {
      const response = await fetch('/api/v1/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newName.trim(),
          slug: newSlug.trim(),
          contact_name: newContactName.trim() || undefined,
          contact_email: newContactEmail.trim() || undefined,
        }),
      });

      const json = await response.json() as { data?: ClientEntry; error?: string };

      if (!response.ok) {
        setError(json.error ?? 'Failed to create client.');
        return;
      }

      // Reload list
      const listResponse = await fetch('/api/v1/clients');
      if (listResponse.ok) {
        const listJson = await listResponse.json() as { data: ClientEntry[] };
        setClients(listJson.data ?? []);
      }

      setNewName('');
      setNewSlug('');
      setNewContactName('');
      setNewContactEmail('');
      setShowForm(false);
    } catch {
      setError('Failed to create client.');
    } finally {
      setCreating(false);
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="page-heading">Clients</h1>
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/clients/shared-analytics"
            className="btn-secondary text-sm"
          >
            Shared Analytics
          </Link>
          <button
            type="button"
            onClick={() => setShowForm(!showForm)}
            className="btn-primary"
          >
            {showForm ? 'Cancel' : 'Add Client'}
          </button>
        </div>
      </div>

      {error !== null && (
        <div className="mb-4 p-3 rounded-sm bg-danger-light text-danger text-sm border border-danger/20">
          {error}
        </div>
      )}

      {showForm && (
        <form onSubmit={handleCreateClient} className="mb-6 card space-y-4">
          <h2 className="font-display text-base font-semibold text-ink">New Client</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="clientName" className="input-label">Name</label>
              <input
                id="clientName"
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                required
                className="input-field h-10"
                placeholder="Acme Corp"
              />
            </div>
            <div>
              <label htmlFor="clientSlug" className="input-label">Slug</label>
              <input
                id="clientSlug"
                type="text"
                value={newSlug}
                onChange={(e) => setNewSlug(e.target.value)}
                required
                pattern="^[a-z0-9-]+$"
                className="input-field h-10"
                placeholder="acme-corp"
              />
            </div>
            <div>
              <label htmlFor="contactName" className="input-label">Contact Name</label>
              <input
                id="contactName"
                type="text"
                value={newContactName}
                onChange={(e) => setNewContactName(e.target.value)}
                className="input-field h-10"
                placeholder="Jane Smith"
              />
            </div>
            <div>
              <label htmlFor="contactEmail" className="input-label">Contact Email</label>
              <input
                id="contactEmail"
                type="email"
                value={newContactEmail}
                onChange={(e) => setNewContactEmail(e.target.value)}
                className="input-field h-10"
                placeholder="jane@acme.com"
              />
            </div>
          </div>
          <button type="submit" disabled={creating} className="btn-primary">
            {creating ? (
              <span className="inline-flex items-center gap-2">
                <span className="spinner w-4 h-4" />
                Creating...
              </span>
            ) : 'Create Client'}
          </button>
        </form>
      )}

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="card">
              <div className="flex items-center justify-between">
                <div>
                  <div className="skeleton h-5 w-40 mb-2" />
                  <div className="skeleton h-3 w-60" />
                </div>
                <div className="skeleton h-4 w-20" />
              </div>
            </div>
          ))}
        </div>
      ) : clients.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-sm text-stone mb-1">No clients yet.</p>
          <p className="text-xs text-stone">Add a client to organize widgets and leads by customer.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {clients.map((client) => (
            <Link key={client.id} href={`/dashboard/clients/${client.id}`} className="card block hover:shadow-sm transition-shadow duration-fast">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-ink">{client.name}</p>
                    {!client.is_active && (
                      <span className="text-xs px-1.5 py-0.5 rounded-pill bg-surface-alt text-stone">Inactive</span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 mt-1 text-xs text-stone">
                    {client.contact_email && <span>{client.contact_email}</span>}
                    <span>{String(client.widget_count)} widgets</span>
                    <span>{String(client.lead_count)} leads</span>
                  </div>
                </div>
                <svg className="w-4 h-4 text-stone" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
