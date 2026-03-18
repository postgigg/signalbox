'use client';

import Link from 'next/link';
import { useState, useEffect, useCallback } from 'react';

import { TICKET_STATUSES, TICKET_PRIORITIES, TICKET_CATEGORIES } from '@/lib/constants';

import type { SupportTicket } from '@/lib/supabase/types';

interface LabelValue {
  readonly value: string;
  readonly label: string;
}

const PAGE_SIZE = 20;

const STATUS_COLORS: Record<string, string> = {
  open: 'bg-signal-light text-signal',
  pending: 'bg-warning-light text-warning',
  resolved: 'bg-success-light text-success',
  closed: 'bg-surface-alt text-stone',
};

const PRIORITY_COLORS: Record<string, string> = {
  low: 'bg-surface-alt text-stone',
  normal: 'bg-signal-light text-signal',
  high: 'bg-warning-light text-warning',
  urgent: 'bg-danger-light text-danger',
};

function timeAgo(dateStr: string): string {
  const diffMs = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${String(mins)}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${String(hrs)}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${String(days)}d ago`;
  return new Date(dateStr).toLocaleDateString();
}

interface TicketsResponse {
  data: SupportTicket[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

interface KpiData {
  openCount: number;
  pendingCount: number;
  avgResolutionHours: number | null;
}

export default function AdminTicketsPage(): React.ReactElement {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [page, setPage] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [kpi, setKpi] = useState<KpiData>({ openCount: 0, pendingCount: 0, avgResolutionHours: null });

  const fetchTickets = useCallback(async (): Promise<void> => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('page', String(page + 1));
      params.set('limit', String(PAGE_SIZE));
      if (statusFilter) params.set('status', statusFilter);
      if (priorityFilter) params.set('priority', priorityFilter);
      if (categoryFilter) params.set('category', categoryFilter);
      if (search.trim()) params.set('search', search.trim());

      const response = await fetch(`/api/v1/admin/tickets?${params.toString()}`);
      if (!response.ok) return;

      const result = await response.json() as TicketsResponse;
      setTickets(result.data);
      setTotalCount(result.pagination.total);
    } catch {
      // Network error
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, priorityFilter, categoryFilter, page]);

  const fetchKpis = useCallback(async (): Promise<void> => {
    try {
      const [openRes, pendingRes, resolvedRes] = await Promise.all([
        fetch('/api/v1/admin/tickets?status=open&limit=1'),
        fetch('/api/v1/admin/tickets?status=pending&limit=1'),
        fetch('/api/v1/admin/tickets?status=resolved&limit=50'),
      ]);

      const openData = openRes.ok ? await openRes.json() as TicketsResponse : null;
      const pendingData = pendingRes.ok ? await pendingRes.json() as TicketsResponse : null;
      const resolvedData = resolvedRes.ok ? await resolvedRes.json() as TicketsResponse : null;

      let avgHours: number | null = null;
      if (resolvedData?.data && resolvedData.data.length > 0) {
        const totalHours = resolvedData.data.reduce((sum: number, t: SupportTicket) => {
          if (!t.resolved_at) return sum;
          const created = new Date(t.created_at).getTime();
          const resolved = new Date(t.resolved_at).getTime();
          return sum + (resolved - created) / 3600000;
        }, 0);
        avgHours = Math.round(totalHours / resolvedData.data.length);
      }

      setKpi({
        openCount: openData?.pagination.total ?? 0,
        pendingCount: pendingData?.pagination.total ?? 0,
        avgResolutionHours: avgHours,
      });
    } catch {
      // KPI fetch error
    }
  }, []);

  useEffect(() => {
    void fetchTickets();
  }, [fetchTickets]);

  useEffect(() => {
    void fetchKpis();
  }, [fetchKpis]);

  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  return (
    <div>
      <div className="flex items-center gap-3">
        <h1 className="page-heading">Support Tickets</h1>
        <span className="text-xs font-body font-medium px-1.5 py-0.5 bg-danger text-white rounded-sm">
          ADMIN
        </span>
      </div>

      {/* KPI Cards */}
      <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card p-4">
          <p className="text-xs font-body text-stone uppercase tracking-wide">Open</p>
          <p className="mt-1 text-2xl font-display font-semibold text-ink">
            {kpi.openCount}
          </p>
        </div>
        <div className="card p-4">
          <p className="text-xs font-body text-stone uppercase tracking-wide">Pending</p>
          <p className="mt-1 text-2xl font-display font-semibold text-ink">
            {kpi.pendingCount}
          </p>
        </div>
        <div className="card p-4">
          <p className="text-xs font-body text-stone uppercase tracking-wide">Avg Resolution</p>
          <p className="mt-1 text-2xl font-display font-semibold text-ink">
            {kpi.avgResolutionHours !== null ? `${String(kpi.avgResolutionHours)}h` : '--'}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="mt-6 flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          placeholder="Search subject or email..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(0); }}
          className="input-field h-10 flex-1"
        />
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(0); }}
          className="input-field h-10 w-auto min-w-[120px]"
        >
          <option value="">All Statuses</option>
          {TICKET_STATUSES.map((s: LabelValue) => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>
        <select
          value={priorityFilter}
          onChange={(e) => { setPriorityFilter(e.target.value); setPage(0); }}
          className="input-field h-10 w-auto min-w-[120px]"
        >
          <option value="">All Priorities</option>
          {TICKET_PRIORITIES.map((p: LabelValue) => (
            <option key={p.value} value={p.value}>{p.label}</option>
          ))}
        </select>
        <select
          value={categoryFilter}
          onChange={(e) => { setCategoryFilter(e.target.value); setPage(0); }}
          className="input-field h-10 w-auto min-w-[120px]"
        >
          <option value="">All Categories</option>
          {TICKET_CATEGORIES.map((c: LabelValue) => (
            <option key={c.value} value={c.value}>{c.label}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="mt-4 overflow-x-auto">
        {loading ? (
          <div className="card text-center py-10">
            <p className="text-sm text-stone">Loading tickets...</p>
          </div>
        ) : tickets.length === 0 ? (
          <div className="card text-center py-10">
            <p className="text-sm text-stone">No tickets found.</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="table-header">
                <th className="text-left py-3 px-4 font-medium">Subject</th>
                <th className="text-left py-3 px-4 font-medium">Requester</th>
                <th className="text-left py-3 px-4 font-medium">Status</th>
                <th className="text-left py-3 px-4 font-medium">Priority</th>
                <th className="text-left py-3 px-4 font-medium">Category</th>
                <th className="text-right py-3 px-4 font-medium">Created</th>
              </tr>
            </thead>
            <tbody>
              {tickets.map((ticket) => (
                <tr key={ticket.id} className="table-row">
                  <td className="py-3 px-4">
                    <Link
                      href={`/admin/tickets/${ticket.id}`}
                      className="font-medium text-ink hover:text-signal transition-colors duration-fast"
                    >
                      {ticket.subject}
                    </Link>
                  </td>
                  <td className="py-3 px-4">
                    <p className="text-ink">{ticket.requester_name}</p>
                    <p className="text-xs text-stone">{ticket.requester_email}</p>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`text-xs px-2 py-0.5 rounded-pill font-medium ${STATUS_COLORS[ticket.status] ?? ''}`}>
                      {ticket.status.charAt(0).toUpperCase() + ticket.status.slice(1)}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`text-xs px-2 py-0.5 rounded-pill font-medium ${PRIORITY_COLORS[ticket.priority] ?? ''}`}>
                      {ticket.priority.charAt(0).toUpperCase() + ticket.priority.slice(1)}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-xs text-stone">
                      {TICKET_CATEGORIES.find((c: LabelValue) => c.value === ticket.category)?.label ?? ticket.category}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right text-stone">
                    {timeAgo(ticket.created_at)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between">
          <p className="text-xs text-stone">
            {page * PAGE_SIZE + 1} to {Math.min((page + 1) * PAGE_SIZE, totalCount)} of {totalCount}
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setPage(Math.max(0, page - 1))}
              disabled={page === 0}
              className="btn-ghost text-xs h-8 px-3"
            >
              Previous
            </button>
            <button
              type="button"
              onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
              disabled={page >= totalPages - 1}
              className="btn-ghost text-xs h-8 px-3"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
