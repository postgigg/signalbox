'use client';

import { useState, useEffect, useCallback } from 'react';

interface AuditEntry {
  readonly id: string;
  readonly admin_email: string;
  readonly action: string;
  readonly target_type: string;
  readonly target_id: string;
  readonly metadata: Record<string, unknown> | null;
  readonly ip_address: string | null;
  readonly created_at: string;
}

const PAGE_SIZE = 25;
const ACTION_FILTERS = ['all', 'impersonate', 'change_plan', 'suspend', 'unsuspend', 'delete', 'extend_trial', 'gift_plan', 'reset_limit', 'create_ticket', 'update_ticket', 'reply_to_ticket', 'add_internal_note'] as const;

export default function AdminAuditPage(): React.ReactElement {
  const [entries, setEntries] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState('all');
  const [page, setPage] = useState(0);
  const [totalCount, setTotalCount] = useState(0);

  const fetchEntries = useCallback(async (): Promise<void> => {
    setLoading(true);
    try {
      const { createBrowserClient } = await import('@supabase/ssr');
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL ?? '',
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ''
      );

      let query = supabase
        .from('admin_audit_log')
        .select('id, admin_email, action, target_type, target_id, metadata, ip_address, created_at', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1);

      if (actionFilter !== 'all') {
        query = query.eq('action', actionFilter);
      }
      if (search.trim().length > 0) {
        query = query.or(`action.ilike.%${search}%,target_type.ilike.%${search}%`);
      }

      const { data, count } = await query;
      setEntries((data as AuditEntry[]) ?? []);
      setTotalCount(count ?? 0);
    } catch {
      // Error
    } finally {
      setLoading(false);
    }
  }, [search, actionFilter, page]);

  useEffect(() => {
    void fetchEntries();
  }, [fetchEntries]);

  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  return (
    <div>
      <div className="flex items-center gap-3">
        <h1 className="page-heading">Audit Log</h1>
        <span className="text-xs font-body font-medium px-1.5 py-0.5 bg-danger text-white rounded-sm">ADMIN</span>
      </div>
      <p className="mt-1 text-sm text-stone">All admin actions with timestamps and details.</p>

      {/* Filters */}
      <div className="mt-6 flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          placeholder="Search actions..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(0); }}
          className="input-field h-10 flex-1"
        />
        <select
          value={actionFilter}
          onChange={(e) => { setActionFilter(e.target.value); setPage(0); }}
          className="input-field h-10 w-auto min-w-[160px]"
        >
          {ACTION_FILTERS.map((a) => (
            <option key={a} value={a}>{a === 'all' ? 'All Actions' : a.replace('_', ' ').replace(/^\w/, (c) => c.toUpperCase())}</option>
          ))}
        </select>
      </div>

      <div className="mt-4 overflow-x-auto">
        {loading ? (
          <div className="card text-center py-10"><p className="text-sm text-stone">Loading...</p></div>
        ) : entries.length === 0 ? (
          <div className="card text-center py-10"><p className="text-sm text-stone">No audit entries found.</p></div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="table-header">
                <th className="text-left py-3 px-4 font-medium">When</th>
                <th className="text-left py-3 px-4 font-medium">Admin</th>
                <th className="text-left py-3 px-4 font-medium">Action</th>
                <th className="text-left py-3 px-4 font-medium">Target</th>
                <th className="text-left py-3 px-4 font-medium">IP</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((entry) => (
                <tr key={entry.id} className="table-row">
                  <td className="py-3 px-4 text-stone text-xs">
                    {new Date(entry.created_at).toLocaleString()}
                  </td>
                  <td className="py-3 px-4 font-mono text-xs text-stone">
                    {entry.admin_email}
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-xs px-2 py-0.5 rounded-sm bg-surface-alt text-ink font-medium font-mono">
                      {entry.action}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-xs text-stone">
                    {entry.target_type}: {entry.target_id.slice(0, 8)}
                  </td>
                  <td className="py-3 px-4 font-mono text-xs text-stone-light">
                    {entry.ip_address ?? 'N/A'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between">
          <p className="text-xs text-stone">
            {page * PAGE_SIZE + 1} to {Math.min((page + 1) * PAGE_SIZE, totalCount)} of {totalCount}
          </p>
          <div className="flex gap-2">
            <button type="button" onClick={() => setPage(Math.max(0, page - 1))} disabled={page === 0} className="btn-ghost text-xs h-8 px-3">Previous</button>
            <button type="button" onClick={() => setPage(Math.min(totalPages - 1, page + 1))} disabled={page >= totalPages - 1} className="btn-ghost text-xs h-8 px-3">Next</button>
          </div>
        </div>
      )}
    </div>
  );
}
