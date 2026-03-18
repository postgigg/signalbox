'use client';

import Link from 'next/link';
import { useState, useEffect, useCallback } from 'react';

interface AccountRow {
  readonly id: string;
  readonly name: string;
  readonly slug: string;
  readonly plan: string;
  readonly subscription_status: string;
  readonly is_suspended: boolean;
  readonly created_at: string;
}

const PLAN_FILTER_OPTIONS = ['all', 'trial', 'starter', 'pro', 'agency'] as const;
const STATUS_FILTER_OPTIONS = ['all', 'active', 'trialing', 'past_due', 'canceled', 'suspended'] as const;
const PAGE_SIZE = 20;

export default function AdminAccountsPage(): React.ReactElement {
  const [accounts, setAccounts] = useState<AccountRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [planFilter, setPlanFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(0);
  const [totalCount, setTotalCount] = useState(0);

  const fetchAccounts = useCallback(async (): Promise<void> => {
    setLoading(true);
    try {
      const { createBrowserClient } = await import('@supabase/ssr');
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL ?? '',
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ''
      );

      let query = supabase
        .from('accounts')
        .select('id, name, slug, plan, subscription_status, is_suspended, created_at', { count: 'exact' })
        .is('deleted_at', null)
        .order('created_at', { ascending: false })
        .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1);

      if (planFilter !== 'all') {
        query = query.eq('plan', planFilter);
      }
      if (statusFilter === 'suspended') {
        query = query.eq('is_suspended', true);
      } else if (statusFilter !== 'all') {
        query = query.eq('subscription_status', statusFilter);
      }
      if (search.trim().length > 0) {
        query = query.or(`name.ilike.%${search}%,slug.ilike.%${search}%`);
      }

      const { data, count } = await query;
      setAccounts((data as AccountRow[]) ?? []);
      setTotalCount(count ?? 0);
    } catch {
      // Error fetching accounts
    } finally {
      setLoading(false);
    }
  }, [search, planFilter, statusFilter, page]);

  useEffect(() => {
    void fetchAccounts();
  }, [fetchAccounts]);

  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  return (
    <div>
      <div className="flex items-center gap-3">
        <h1 className="page-heading">Accounts</h1>
        <span className="text-xs font-body font-medium px-1.5 py-0.5 bg-danger text-white rounded-sm">ADMIN</span>
      </div>

      {/* Filters */}
      <div className="mt-6 flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          placeholder="Search by name or slug..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(0); }}
          className="input-field h-10 flex-1"
        />
        <select value={planFilter} onChange={(e) => { setPlanFilter(e.target.value); setPage(0); }} className="input-field h-10 w-auto min-w-[120px]">
          {PLAN_FILTER_OPTIONS.map((p) => (
            <option key={p} value={p}>{p === 'all' ? 'All Plans' : p.charAt(0).toUpperCase() + p.slice(1)}</option>
          ))}
        </select>
        <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(0); }} className="input-field h-10 w-auto min-w-[140px]">
          {STATUS_FILTER_OPTIONS.map((s) => (
            <option key={s} value={s}>{s === 'all' ? 'All Statuses' : s.charAt(0).toUpperCase() + s.slice(1).replace('_', ' ')}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="mt-4 overflow-x-auto">
        {loading ? (
          <div className="card text-center py-10">
            <p className="text-sm text-stone">Loading accounts...</p>
          </div>
        ) : accounts.length === 0 ? (
          <div className="card text-center py-10">
            <p className="text-sm text-stone">No accounts found.</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="table-header">
                <th className="text-left py-3 px-4 font-medium">Name</th>
                <th className="text-left py-3 px-4 font-medium">Plan</th>
                <th className="text-left py-3 px-4 font-medium">Status</th>
                <th className="text-right py-3 px-4 font-medium">Since</th>
              </tr>
            </thead>
            <tbody>
              {accounts.map((account) => (
                <tr key={account.id} className="table-row">
                  <td className="py-3 px-4">
                    <Link href={`/admin/accounts/${account.id}`} className="font-medium text-ink hover:text-signal transition-colors duration-fast">
                      {account.name}
                    </Link>
                    <p className="text-xs text-stone">{account.slug}</p>
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-xs px-2 py-0.5 rounded-pill font-medium bg-surface-alt text-stone">
                      {account.plan.charAt(0).toUpperCase() + account.plan.slice(1)}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    {account.is_suspended ? (
                      <span className="text-xs px-2 py-0.5 rounded-pill font-medium bg-danger-light text-danger">Suspended</span>
                    ) : (
                      <span className={`text-xs px-2 py-0.5 rounded-pill font-medium ${
                        account.subscription_status === 'active' ? 'bg-success-light text-success'
                        : account.subscription_status === 'trialing' ? 'bg-signal-light text-signal'
                        : account.subscription_status === 'past_due' ? 'bg-warning-light text-warning'
                        : 'bg-danger-light text-danger'
                      }`}>
                        {account.subscription_status.charAt(0).toUpperCase() + account.subscription_status.slice(1).replace('_', ' ')}
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-right text-stone">
                    {new Date(account.created_at).toLocaleDateString()}
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
            <button type="button" onClick={() => setPage(Math.max(0, page - 1))} disabled={page === 0} className="btn-ghost text-xs h-8 px-3">Previous</button>
            <button type="button" onClick={() => setPage(Math.min(totalPages - 1, page + 1))} disabled={page >= totalPages - 1} className="btn-ghost text-xs h-8 px-3">Next</button>
          </div>
        </div>
      )}
    </div>
  );
}
