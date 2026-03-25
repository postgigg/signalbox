'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect, useCallback } from 'react';

import { InboxRow } from './InboxRow';

interface InboxEmail {
  readonly id: string;
  readonly from_email: string;
  readonly from_name: string;
  readonly subject: string;
  readonly body_text: string;
  readonly is_read: boolean;
  readonly is_archived: boolean;
  readonly is_starred: boolean;
  readonly received_at: string;
}

interface InboxResponse {
  readonly data: InboxEmail[];
  readonly pagination: {
    readonly page: number;
    readonly limit: number;
    readonly total: number;
  };
}

const STATUS_OPTIONS = ['all', 'unread', 'read', 'starred', 'archived'] as const;
const PAGE_SIZE = 20;

export default function InboxPage(): React.ReactElement {
  const router = useRouter();

  const [emails, setEmails] = useState<InboxEmail[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [page, setPage] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const fetchEmails = useCallback(async (): Promise<void> => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('limit', String(PAGE_SIZE));
      params.set('page', String(page + 1));
      if (statusFilter !== 'all') {
        params.set('status', statusFilter);
      }
      if (search.trim().length > 0) {
        params.set('search', search.trim());
      }

      const response = await fetch(`/api/v1/admin/inbox?${params.toString()}`);
      if (!response.ok) return;

      const result = (await response.json()) as InboxResponse;
      setEmails(result.data ?? []);
      setTotalCount(result.pagination?.total ?? 0);
    } catch {
      // Failed to fetch inbox
    } finally {
      setLoading(false);
    }
  }, [statusFilter, search, page]);

  useEffect(() => {
    void fetchEmails();
  }, [fetchEmails]);

  function handleSelectAll(): void {
    if (selected.size === emails.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(emails.map((e) => e.id)));
    }
  }

  function handleSelect(id: string): void {
    const next = new Set(selected);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setSelected(next);
  }

  function handleToggleStar(
    e: React.MouseEvent,
    emailId: string,
    currentStarred: boolean
  ): void {
    e.stopPropagation();
    void (async (): Promise<void> => {
      try {
        await fetch(`/api/v1/admin/inbox/${emailId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ is_starred: !currentStarred }),
        });
        setEmails((prev) =>
          prev.map((em) =>
            em.id === emailId ? { ...em, is_starred: !currentStarred } : em
          )
        );
      } catch {
        // Failed to toggle star
      }
    })();
  }

  async function handleBatchAction(
    action: 'mark_read' | 'archive' | 'delete'
  ): Promise<void> {
    const ids = Array.from(selected);
    if (ids.length === 0) return;

    try {
      await fetch('/api/v1/admin/inbox/batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids, action }),
      });
      setSelected(new Set());
      void fetchEmails();
    } catch {
      // Failed to perform batch action
    }
  }

  function handleNavigate(id: string): void {
    router.push(`/dashboard/inbox/${id}`);
  }

  const totalPages = Math.ceil(totalCount / PAGE_SIZE);
  const unreadCount = emails.filter((e) => !e.is_read).length;

  return (
    <div>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="page-heading">Inbox</h1>
          {unreadCount > 0 && (
            <span className="text-xs font-medium px-2 py-0.5 rounded-pill bg-signal-light text-signal">
              {unreadCount} unread
            </span>
          )}
        </div>
        <p className="text-sm text-stone">{totalCount} total</p>
      </div>

      {/* Filters */}
      <div className="mt-6 flex flex-wrap items-center gap-3">
        <div className="flex-1 min-w-[200px]">
          <input
            type="text"
            placeholder="Search by sender or subject..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(0);
            }}
            className="input-field h-10 text-sm"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPage(0);
          }}
          className="input-field h-10 w-auto min-w-[140px] text-sm"
        >
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>
              {s === 'all'
                ? 'All Messages'
                : s.charAt(0).toUpperCase() + s.slice(1)}
            </option>
          ))}
        </select>
      </div>

      {/* Batch actions */}
      {selected.size > 0 && (
        <div className="mt-3 flex items-center gap-2">
          <span className="text-xs text-stone">{selected.size} selected</span>
          <button type="button" onClick={() => void handleBatchAction('mark_read')} className="btn-ghost text-xs h-8 px-3">
            Mark Read
          </button>
          <button type="button" onClick={() => void handleBatchAction('archive')} className="btn-ghost text-xs h-8 px-3">
            Archive
          </button>
          <button type="button" onClick={() => void handleBatchAction('delete')} className="btn-ghost text-xs h-8 px-3 text-danger hover:text-danger">
            Delete
          </button>
        </div>
      )}

      {/* Email list */}
      <div className="mt-4 bg-surface border border-border rounded-md overflow-hidden">
        {loading ? (
          <div>
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="px-5 py-4 border-b border-border last:border-0 flex gap-4 items-center">
                <div className="skeleton h-4 w-4 rounded-sm" />
                <div className="skeleton h-4 w-4" />
                <div className="skeleton h-4 w-32" />
                <div className="skeleton h-4 w-64 flex-1" />
                <div className="skeleton h-4 w-16 ml-auto" />
              </div>
            ))}
          </div>
        ) : emails.length === 0 ? (
          <div className="text-center py-16">
            <svg className="w-10 h-10 text-stone-light mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
            </svg>
            <p className="text-sm text-stone">
              No emails yet. Emails sent to support@hawkleads.io will appear here.
            </p>
          </div>
        ) : (
          <div>
            {/* Header row */}
            <div className="border-b border-border bg-surface-alt px-5 py-2.5 flex items-center gap-4">
              <input
                type="checkbox"
                checked={emails.length > 0 && selected.size === emails.length}
                onChange={handleSelectAll}
                className="w-4 h-4 rounded-sm border-border"
                aria-label="Select all"
              />
              <span className="w-4" />
              <span className="text-xs font-medium uppercase tracking-wide text-stone flex-shrink-0 w-44">From</span>
              <span className="text-xs font-medium uppercase tracking-wide text-stone flex-1">Subject</span>
              <span className="text-xs font-medium uppercase tracking-wide text-stone flex-shrink-0 w-24 text-right">Received</span>
            </div>

            {/* Email rows */}
            {emails.map((email) => (
              <InboxRow
                key={email.id}
                email={email}
                isSelected={selected.has(email.id)}
                onSelect={handleSelect}
                onToggleStar={handleToggleStar}
                onNavigate={handleNavigate}
              />
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="border-t border-border px-5 py-3 flex items-center justify-between bg-surface-alt/50">
            <p className="text-xs text-stone">
              Showing {page * PAGE_SIZE + 1} to{' '}
              {Math.min((page + 1) * PAGE_SIZE, totalCount)} of {totalCount}
            </p>
            <div className="flex items-center gap-2">
              <button type="button" onClick={() => setPage(Math.max(0, page - 1))} disabled={page === 0} className="btn-ghost text-xs h-8 px-3">
                Previous
              </button>
              <button type="button" onClick={() => setPage(Math.min(totalPages - 1, page + 1))} disabled={page >= totalPages - 1} className="btn-ghost text-xs h-8 px-3">
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
