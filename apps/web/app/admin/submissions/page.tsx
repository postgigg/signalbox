'use client';

import { useState, useEffect, useCallback } from 'react';

interface SubmissionRow {
  readonly id: string;
  readonly visitor_name: string;
  readonly visitor_email: string;
  readonly lead_score: number;
  readonly lead_tier: string;
  readonly status: string;
  readonly account_id: string;
  readonly widget_id: string;
  readonly created_at: string;
}

const PAGE_SIZE = 25;

function TierBadge({ tier }: { readonly tier: string }): React.ReactElement {
  const classes: Record<string, string> = { hot: 'badge-hot', warm: 'badge-warm', cold: 'badge-cold' };
  return <span className={classes[tier] ?? 'badge-cold'}>{tier.charAt(0).toUpperCase() + tier.slice(1)}</span>;
}

export default function AdminSubmissionsPage(): React.ReactElement {
  const [submissions, setSubmissions] = useState<SubmissionRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalCount, setTotalCount] = useState(0);

  const fetchSubmissions = useCallback(async (): Promise<void> => {
    setLoading(true);
    try {
      const { createBrowserClient } = await import('@supabase/ssr');
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL ?? '',
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ''
      );

      const { data, count } = await supabase
        .from('submissions')
        .select('id, visitor_name, visitor_email, lead_score, lead_tier, status, account_id, widget_id, created_at', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1);

      setSubmissions((data as SubmissionRow[]) ?? []);
      setTotalCount(count ?? 0);
    } catch {
      // Error
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    void fetchSubmissions();
  }, [fetchSubmissions]);

  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  return (
    <div>
      <div className="flex items-center gap-3">
        <h1 className="page-heading">Global Submissions</h1>
        <span className="text-xs font-body font-medium px-1.5 py-0.5 bg-danger text-white rounded-sm">ADMIN</span>
      </div>
      <p className="mt-1 text-sm text-stone">All submissions across the platform.</p>

      <div className="mt-6 overflow-x-auto">
        {loading ? (
          <div className="card text-center py-10"><p className="text-sm text-stone">Loading...</p></div>
        ) : submissions.length === 0 ? (
          <div className="card text-center py-10"><p className="text-sm text-stone">No submissions yet.</p></div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="table-header">
                <th className="text-left py-3 px-4 font-medium">Name</th>
                <th className="text-left py-3 px-4 font-medium">Email</th>
                <th className="text-right py-3 px-4 font-medium">Score</th>
                <th className="text-left py-3 px-4 font-medium">Tier</th>
                <th className="text-left py-3 px-4 font-medium">Account</th>
                <th className="text-right py-3 px-4 font-medium">When</th>
              </tr>
            </thead>
            <tbody>
              {submissions.map((sub) => (
                <tr key={sub.id} className="table-row">
                  <td className="py-3 px-4 font-medium text-ink">{sub.visitor_name}</td>
                  <td className="py-3 px-4 text-stone">{sub.visitor_email}</td>
                  <td className="py-3 px-4 text-right font-mono">{sub.lead_score}</td>
                  <td className="py-3 px-4"><TierBadge tier={sub.lead_tier} /></td>
                  <td className="py-3 px-4 text-xs text-stone font-mono">{sub.account_id.slice(0, 8)}</td>
                  <td className="py-3 px-4 text-right text-stone">{new Date(sub.created_at).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between">
          <p className="text-xs text-stone">{page * PAGE_SIZE + 1} to {Math.min((page + 1) * PAGE_SIZE, totalCount)} of {totalCount}</p>
          <div className="flex gap-2">
            <button type="button" onClick={() => setPage(Math.max(0, page - 1))} disabled={page === 0} className="btn-ghost text-xs h-8 px-3">Previous</button>
            <button type="button" onClick={() => setPage(Math.min(totalPages - 1, page + 1))} disabled={page >= totalPages - 1} className="btn-ghost text-xs h-8 px-3">Next</button>
          </div>
        </div>
      )}
    </div>
  );
}
