'use client';

import { useState, useEffect, use } from 'react';

interface AnalyticsData {
  readonly name: string;
  readonly totalSubmissions?: number;
  readonly tierBreakdown?: {
    readonly hot: number;
    readonly warm: number;
    readonly cold: number;
  };
  readonly conversionRate?: number;
  readonly overTime?: ReadonlyArray<{
    readonly date: string;
    readonly submissions: number;
    readonly hotCount: number;
    readonly warmCount: number;
    readonly coldCount: number;
  }>;
}

export default function SharedAnalyticsPage({
  params,
}: {
  readonly params: Promise<{ token: string }>;
}): React.ReactElement {
  const { token } = use(params);
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [needsPassword, setNeedsPassword] = useState(false);
  const [password, setPassword] = useState('');

  async function fetchData(pw?: string): Promise<void> {
    setLoading(true);
    setError(null);
    try {
      const url = new URL('/api/v1/public/analytics', window.location.origin);
      url.searchParams.set('token', token);
      url.searchParams.set('days', '30');
      if (pw) {
        url.searchParams.set('password', pw);
      }

      const response = await fetch(url.toString());
      if (response.status === 401) {
        setNeedsPassword(true);
        if (pw) setError('Incorrect password');
        setLoading(false);
        return;
      }
      if (response.status === 410) {
        setError('This link has expired.');
        setLoading(false);
        return;
      }
      if (!response.ok) {
        setError('Failed to load analytics.');
        setLoading(false);
        return;
      }
      const result = await response.json() as AnalyticsData;
      setData(result);
      setNeedsPassword(false);
    } catch {
      setError('Network error.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void fetchData();
  }, [token]);

  function handlePasswordSubmit(e: React.FormEvent): void {
    e.preventDefault();
    void fetchData(password);
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-paper flex items-center justify-center">
        <meta name="robots" content="noindex, nofollow" />
        <span className="spinner w-8 h-8" />
      </div>
    );
  }

  if (needsPassword) {
    return (
      <div className="min-h-screen bg-paper flex items-center justify-center">
        <meta name="robots" content="noindex, nofollow" />
        <div className="card p-8 w-full max-w-sm">
          <h1 className="font-display text-xl font-semibold text-ink text-center">Analytics</h1>
          <p className="mt-2 text-sm text-stone text-center font-body">This report is password protected.</p>
          {error !== null && (
            <div className="mt-4 p-3 rounded-sm bg-danger-light text-danger text-sm border border-danger/20">
              {error}
            </div>
          )}
          <form onSubmit={handlePasswordSubmit} className="mt-4 space-y-3">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              required
              className="input-field w-full"
            />
            <button type="submit" className="btn-primary w-full">View Report</button>
          </form>
        </div>
      </div>
    );
  }

  if (error !== null) {
    return (
      <div className="min-h-screen bg-paper flex items-center justify-center">
        <meta name="robots" content="noindex, nofollow" />
        <div className="card p-8 text-center">
          <p className="text-sm text-stone">{error}</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-paper flex items-center justify-center">
        <meta name="robots" content="noindex, nofollow" />
        <p className="text-sm text-stone">No data available.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-paper">
      <meta name="robots" content="noindex, nofollow" />
      <div className="max-w-4xl mx-auto p-6 lg:p-10">
        <header className="mb-8">
          <p className="text-xs text-stone font-body uppercase tracking-wide">HawkLeads Analytics</p>
          <h1 className="font-display text-2xl font-semibold text-ink mt-1">{data.name}</h1>
          <p className="text-sm text-stone font-body mt-1">Last 30 days</p>
        </header>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {data.totalSubmissions !== undefined && (
            <div className="card p-5">
              <p className="text-xs text-stone font-body uppercase">Total Submissions</p>
              <p className="mt-1 font-display text-2xl font-semibold text-ink">{data.totalSubmissions}</p>
            </div>
          )}
          {data.conversionRate !== undefined && (
            <div className="card p-5">
              <p className="text-xs text-stone font-body uppercase">Conversion Rate</p>
              <p className="mt-1 font-display text-2xl font-semibold text-ink">{data.conversionRate}%</p>
            </div>
          )}
          {data.tierBreakdown !== undefined && (
            <div className="card p-5">
              <p className="text-xs text-stone font-body uppercase">Tier Breakdown</p>
              <div className="mt-2 space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-stone font-body">Hot</span>
                  <span className="font-medium" style={{ color: '#EF4444' }}>{data.tierBreakdown.hot}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-stone font-body">Warm</span>
                  <span className="font-medium" style={{ color: '#F59E0B' }}>{data.tierBreakdown.warm}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-stone font-body">Cold</span>
                  <span className="font-medium" style={{ color: '#3B82F6' }}>{data.tierBreakdown.cold}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Over Time Table */}
        {data.overTime !== undefined && data.overTime.length > 0 && (
          <div className="mt-8">
            <h2 className="font-display text-lg font-semibold text-ink">Daily Breakdown</h2>
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="table-header">
                    <th className="text-left py-3 px-4 font-medium">Date</th>
                    <th className="text-right py-3 px-4 font-medium">Submissions</th>
                    <th className="text-right py-3 px-4 font-medium">Hot</th>
                    <th className="text-right py-3 px-4 font-medium">Warm</th>
                    <th className="text-right py-3 px-4 font-medium">Cold</th>
                  </tr>
                </thead>
                <tbody>
                  {data.overTime.map((row) => (
                    <tr key={row.date} className="table-row">
                      <td className="py-3 px-4 text-ink">{row.date}</td>
                      <td className="py-3 px-4 text-right text-stone">{row.submissions}</td>
                      <td className="py-3 px-4 text-right" style={{ color: '#EF4444' }}>{row.hotCount}</td>
                      <td className="py-3 px-4 text-right" style={{ color: '#F59E0B' }}>{row.warmCount}</td>
                      <td className="py-3 px-4 text-right" style={{ color: '#3B82F6' }}>{row.coldCount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <footer className="mt-12 text-center text-xs text-stone-light font-body">
          Powered by HawkLeads
        </footer>
      </div>
    </div>
  );
}
