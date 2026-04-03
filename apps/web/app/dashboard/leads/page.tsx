'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect, useCallback } from 'react';

import { HelpTip } from '@/components/shared/HelpTip';
import { HELP_TIPS } from '@/lib/help-content';

import type { Submission } from '@/lib/supabase/types';

type LeadRow = Pick<
  Submission,
  'id' | 'visitor_name' | 'visitor_email' | 'lead_score' | 'lead_tier' | 'status' | 'created_at' | 'gated'
>;

interface GatedStats {
  count: number;
  hotCount: number;
}

const TIER_OPTIONS = ['all', 'hot', 'warm', 'cold'] as const;
const STATUS_OPTIONS = ['all', 'new', 'viewed', 'contacted', 'qualified', 'disqualified', 'converted', 'archived'] as const;
const PAGE_SIZE = 20;
const HOT_SCORE_THRESHOLD = 70;

function TierBadge({ tier }: { readonly tier: string }): React.ReactElement {
  const classes: Record<string, string> = {
    hot: 'badge-hot',
    warm: 'badge-warm',
    cold: 'badge-cold',
  };
  return (
    <span className={classes[tier] ?? 'badge-cold'}>
      {tier.charAt(0).toUpperCase() + tier.slice(1)}
    </span>
  );
}

function StatusBadge({ status }: { readonly status: string }): React.ReactElement {
  const classes: Record<string, string> = {
    new: 'badge-new',
    viewed: 'bg-surface-alt text-stone text-xs px-2 py-0.5 rounded-pill font-medium inline-flex items-center',
    contacted: 'badge-contacted',
    qualified: 'bg-success-light text-success text-xs px-2 py-0.5 rounded-pill font-medium inline-flex items-center',
    disqualified: 'bg-danger-light text-danger text-xs px-2 py-0.5 rounded-pill font-medium inline-flex items-center',
    converted: 'bg-signal-light text-signal text-xs px-2 py-0.5 rounded-pill font-medium inline-flex items-center',
    archived: 'bg-surface-alt text-stone-light text-xs px-2 py-0.5 rounded-pill font-medium inline-flex items-center',
  };
  return (
    <span className={classes[status] ?? classes['new']}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

const BULK_STATUS_OPTIONS = ['new', 'viewed', 'contacted', 'qualified', 'disqualified', 'converted', 'archived'] as const;

export default function LeadsPage(): React.ReactElement {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [leads, setLeads] = useState<LeadRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(searchParams.get('search') ?? '');
  const [tier, setTier] = useState(searchParams.get('tier') ?? 'all');
  const [status, setStatus] = useState(searchParams.get('status') ?? 'all');
  const [dateFrom, setDateFrom] = useState(searchParams.get('from') ?? '');
  const [dateTo, setDateTo] = useState(searchParams.get('to') ?? '');
  const [sortField, setSortField] = useState<'created_at' | 'lead_score'>('created_at');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [page, setPage] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [accountPlan, setAccountPlan] = useState<string>('');
  const [gatedStats, setGatedStats] = useState<GatedStats>({ count: 0, hotCount: 0 });
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkLoading, setBulkLoading] = useState(false);

  const fetchLeads = useCallback(async (): Promise<void> => {
    setLoading(true);
    try {
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

      // Fetch account plan
      const { data: accountData } = await supabase
        .from('accounts')
        .select('plan')
        .eq('id', memberData.account_id)
        .single();

      const plan = accountData?.plan ?? '';
      setAccountPlan(plan);

      // Fetch gated stats for free plan users
      if (plan === 'free') {
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);

        const { data: gatedLeads } = await supabase
          .from('submissions')
          .select('lead_score')
          .eq('account_id', memberData.account_id)
          .eq('gated', true)
          .gte('created_at', startOfMonth.toISOString());

        if (gatedLeads && gatedLeads.length > 0) {
          const hotCount = gatedLeads.filter(
            (l: { lead_score: number }) => l.lead_score >= HOT_SCORE_THRESHOLD
          ).length;
          setGatedStats({ count: gatedLeads.length, hotCount });
        } else {
          setGatedStats({ count: 0, hotCount: 0 });
        }
      }

      let query = supabase
        .from('submissions')
        .select('id, visitor_name, visitor_email, lead_score, lead_tier, status, created_at, gated', { count: 'exact' })
        .eq('account_id', memberData.account_id)
        .order(sortField, { ascending: sortDir === 'asc' })
        .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1);

      if (tier !== 'all') {
        query = query.eq('lead_tier', tier);
      }
      if (status !== 'all') {
        query = query.eq('status', status);
      }
      if (search.trim().length > 0) {
        query = query.or(`visitor_name.ilike.%${search}%,visitor_email.ilike.%${search}%`);
      }
      if (dateFrom) {
        query = query.gte('created_at', new Date(dateFrom).toISOString());
      }
      if (dateTo) {
        // Set to end of selected day
        const endOfDay = new Date(dateTo);
        endOfDay.setHours(23, 59, 59, 999);
        query = query.lte('created_at', endOfDay.toISOString());
      }

      const { data, count } = await query;
      setLeads((data as LeadRow[]) ?? []);
      setTotalCount(count ?? 0);
    } catch {
      // Error fetching leads
    } finally {
      setLoading(false);
    }
  }, [tier, status, search, dateFrom, dateTo, sortField, sortDir, page]);

  useEffect(() => {
    void fetchLeads();
  }, [fetchLeads]);

  function handleSort(field: 'created_at' | 'lead_score'): void {
    if (sortField === field) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDir('desc');
    }
    setPage(0);
  }

  function toggleSelect(id: string): void {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  function toggleSelectAll(): void {
    const selectableIds = leads.filter((l) => !(isFreePlan && l.gated)).map((l) => l.id);
    const allSelected = selectableIds.length > 0 && selectableIds.every((id) => selectedIds.has(id));
    if (allSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(selectableIds));
    }
  }

  async function executeBulkAction(action: string, payload?: Record<string, unknown>): Promise<void> {
    if (selectedIds.size === 0) return;
    setBulkLoading(true);
    try {
      const response = await fetch('/api/v1/leads/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ids: Array.from(selectedIds),
          action,
          payload,
        }),
      });
      if (response.ok) {
        setSelectedIds(new Set());
        void fetchLeads();
      }
    } catch {
      // Bulk action failed
    } finally {
      setBulkLoading(false);
    }
  }

  const [exporting, setExporting] = useState(false);

  function handleExportCsv(): void {
    setExporting(true);
    const params = new URLSearchParams();
    if (tier !== 'all') params.set('tier', tier);
    if (status !== 'all') params.set('status', status);
    if (search.trim().length > 0) params.set('search', search);
    if (dateFrom) params.set('from', new Date(dateFrom).toISOString());
    if (dateTo) {
      const endOfDay = new Date(dateTo);
      endOfDay.setHours(23, 59, 59, 999);
      params.set('to', endOfDay.toISOString());
    }

    const qs = params.toString();
    const url = `/api/v1/leads/export${qs ? `?${qs}` : ''}`;

    fetch(url)
      .then(async (res) => {
        if (!res.ok) return;
        const blob = await res.blob();
        const blobUrl = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = blobUrl;
        a.download = `hawkleads-export-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        URL.revokeObjectURL(blobUrl);
      })
      .catch(() => {
        // Export failed
      })
      .finally(() => setExporting(false));
  }

  const totalPages = Math.ceil(totalCount / PAGE_SIZE);
  const isFreePlan = accountPlan === 'free';
  const showGatedBanner = isFreePlan && gatedStats.count > 0;
  const hasSelection = selectedIds.size > 0;

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="page-heading">Leads</h1>
        <div className="flex items-center gap-3">
          <p className="text-sm text-stone">{totalCount} total</p>
          <button
            type="button"
            onClick={handleExportCsv}
            disabled={exporting || totalCount === 0}
            className="btn-ghost text-sm h-9 px-3 flex items-center gap-1.5"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
            </svg>
            {exporting ? 'Exporting...' : 'Export CSV'}
          </button>
        </div>
      </div>

      {/* Gated leads upsell banner */}
      {showGatedBanner && (
        <div className="mt-4 border border-border rounded-md bg-surface p-4 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-ink">
              You had {gatedStats.count} more {gatedStats.count === 1 ? 'lead' : 'leads'} this month.
              {gatedStats.hotCount > 0 && (
                <span>
                  {' '}{gatedStats.hotCount} scored above {HOT_SCORE_THRESHOLD}.
                </span>
              )}
            </p>
            <p className="text-xs text-stone mt-1">
              Upgrade to see all your leads and unlock predictive scoring.
            </p>
          </div>
          <Link
            href="/dashboard/settings/billing"
            className="btn-primary text-sm h-9 px-4 flex items-center shrink-0 ml-4"
          >
            Upgrade
          </Link>
        </div>
      )}

      {/* Filters */}
      <div className="mt-6 flex flex-wrap items-center gap-3">
        <div className="flex-1 min-w-[200px]">
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(0);
            }}
            className="input-field h-10 text-sm"
          />
        </div>
        <select
          value={tier}
          onChange={(e) => {
            setTier(e.target.value);
            setPage(0);
          }}
          className="input-field h-10 w-auto min-w-[120px] text-sm"
        >
          {TIER_OPTIONS.map((t) => (
            <option key={t} value={t}>
              {t === 'all' ? 'All Tiers' : t.charAt(0).toUpperCase() + t.slice(1)}
            </option>
          ))}
        </select>
        <select
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            setPage(0);
          }}
          className="input-field h-10 w-auto min-w-[140px] text-sm"
        >
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>
              {s === 'all' ? 'All Statuses' : s.charAt(0).toUpperCase() + s.slice(1)}
            </option>
          ))}
        </select>
        <div className="flex items-center gap-2">
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => {
              setDateFrom(e.target.value);
              setPage(0);
            }}
            className="input-field h-10 w-auto text-sm"
            aria-label="From date"
          />
          <span className="text-xs text-stone">to</span>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => {
              setDateTo(e.target.value);
              setPage(0);
            }}
            className="input-field h-10 w-auto text-sm"
            aria-label="To date"
          />
        </div>
      </div>
      <p className="mt-2 text-xs text-stone">
        Every submission is here. Scoring sorts them by priority. Nothing is deleted or hidden.
      </p>

      {/* Bulk action bar */}
      {hasSelection && (
        <div className="mt-4 bg-ink text-white rounded-md px-5 py-3 flex items-center justify-between sticky top-0 z-10">
          <span className="text-sm font-medium">{selectedIds.size} selected</span>
          <div className="flex items-center gap-2">
            <select
              onChange={(e) => {
                if (e.target.value) {
                  void executeBulkAction('status_change', { status: e.target.value });
                  e.target.value = '';
                }
              }}
              disabled={bulkLoading}
              className="h-8 px-2 rounded-sm text-xs bg-white text-ink border-0"
              aria-label="Change status"
            >
              <option value="">Change status...</option>
              {BULK_STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => void executeBulkAction('archive')}
              disabled={bulkLoading}
              className="h-8 px-3 rounded-sm text-xs bg-white/20 hover:bg-white/30 transition-colors duration-fast"
            >
              Archive
            </button>
            <button
              type="button"
              onClick={() => setSelectedIds(new Set())}
              className="h-8 px-3 rounded-sm text-xs bg-white/10 hover:bg-white/20 transition-colors duration-fast"
            >
              Clear
            </button>
          </div>
        </div>
      )}

      {/* Table inside card */}
      <div className="mt-4 bg-surface border border-border rounded-md overflow-hidden">
        {loading ? (
          <div>
            <div className="border-b border-border bg-surface-alt px-5 py-3 flex gap-8">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="skeleton h-3 w-14" />
              ))}
            </div>
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="px-5 py-4 border-b border-border last:border-0 flex gap-8 items-center">
                <div className="skeleton h-4 w-28" />
                <div className="skeleton h-4 w-44" />
                <div className="skeleton h-4 w-8 ml-auto" />
                <div className="skeleton h-5 w-12 rounded-pill" />
                <div className="skeleton h-5 w-16 rounded-pill" />
                <div className="skeleton h-4 w-20" />
              </div>
            ))}
          </div>
        ) : leads.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-sm text-stone">
              No leads found. Adjust your filters or wait for submissions.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-surface-alt">
                  <th className="py-3 px-3 w-10">
                    <input
                      type="checkbox"
                      onChange={toggleSelectAll}
                      checked={leads.filter((l) => !(isFreePlan && l.gated)).length > 0 && leads.filter((l) => !(isFreePlan && l.gated)).every((l) => selectedIds.has(l.id))}
                      className="rounded-sm"
                      aria-label="Select all"
                    />
                  </th>
                  <th className="text-left py-3 px-5 text-xs font-medium uppercase tracking-wide text-stone">Name</th>
                  <th className="text-left py-3 px-5 text-xs font-medium uppercase tracking-wide text-stone">Email</th>
                  <th className="text-right py-3 px-5 text-xs font-medium uppercase tracking-wide text-stone">
                    <button
                      type="button"
                      onClick={() => handleSort('lead_score')}
                      className="inline-flex items-center gap-1 hover:text-ink transition-colors duration-fast"
                    >
                      Score
                      <HelpTip text={HELP_TIPS.leads.score} position="bottom" />
                      {sortField === 'lead_score' && (
                        <span>{sortDir === 'asc' ? '\u2191' : '\u2193'}</span>
                      )}
                    </button>
                  </th>
                  <th className="text-center py-3 px-5 text-xs font-medium uppercase tracking-wide text-stone">
                    Tier
                    <HelpTip text={HELP_TIPS.leads.tier} position="bottom" />
                  </th>
                  <th className="text-center py-3 px-5 text-xs font-medium uppercase tracking-wide text-stone">
                    Status
                    <HelpTip text={HELP_TIPS.leads.status} position="bottom" />
                  </th>
                  <th className="text-right py-3 px-5 text-xs font-medium uppercase tracking-wide text-stone">
                    <button
                      type="button"
                      onClick={() => handleSort('created_at')}
                      className="inline-flex items-center gap-1 hover:text-ink transition-colors duration-fast"
                    >
                      When
                      {sortField === 'created_at' && (
                        <span>{sortDir === 'asc' ? '\u2191' : '\u2193'}</span>
                      )}
                    </button>
                  </th>
                </tr>
              </thead>
              <tbody>
                {leads.map((lead) => {
                  const isGated = isFreePlan && lead.gated;
                  return (
                    <tr
                      key={lead.id}
                      className={`border-b border-border last:border-0 transition-colors duration-fast ${
                        isGated ? 'opacity-75' : 'hover:bg-surface-alt cursor-pointer'
                      }`}
                      onClick={() => {
                        if (!isGated) {
                          router.push(`/dashboard/leads/${lead.id}`);
                        }
                      }}
                    >
                      <td className="py-3.5 px-3 w-10" onClick={(e) => e.stopPropagation()}>
                        {!isGated && (
                          <input
                            type="checkbox"
                            checked={selectedIds.has(lead.id)}
                            onChange={() => toggleSelect(lead.id)}
                            className="rounded-sm"
                            aria-label={`Select ${lead.visitor_name}`}
                          />
                        )}
                      </td>
                      <td className="py-3.5 px-5 font-medium text-ink whitespace-nowrap">
                        {isGated ? (
                          <span className="select-none" style={{ filter: 'blur(4px)' }}>
                            {lead.visitor_name}
                          </span>
                        ) : (
                          lead.visitor_name
                        )}
                      </td>
                      <td className="py-3.5 px-5 text-stone">
                        {isGated ? (
                          <span className="select-none" style={{ filter: 'blur(4px)' }}>
                            {lead.visitor_email}
                          </span>
                        ) : (
                          lead.visitor_email
                        )}
                      </td>
                      <td className="py-3.5 px-5 text-right font-mono tabular-nums">{lead.lead_score}</td>
                      <td className="py-3.5 px-5 text-center">
                        <TierBadge tier={lead.lead_tier} />
                      </td>
                      <td className="py-3.5 px-5 text-center">
                        {isGated ? (
                          <Link
                            href="/dashboard/settings/billing"
                            className="text-xs font-medium text-signal hover:underline"
                            onClick={(e) => e.stopPropagation()}
                          >
                            Upgrade
                          </Link>
                        ) : (
                          <StatusBadge status={lead.status} />
                        )}
                      </td>
                      <td className="py-3.5 px-5 text-right text-stone whitespace-nowrap">
                        {new Date(lead.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination inside card footer */}
        {totalPages > 1 && (
          <div className="border-t border-border px-5 py-3 flex items-center justify-between bg-surface-alt/50">
            <p className="text-xs text-stone">
              Showing {page * PAGE_SIZE + 1} to {Math.min((page + 1) * PAGE_SIZE, totalCount)} of{' '}
              {totalCount}
            </p>
            <div className="flex items-center gap-2">
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
    </div>
  );
}
