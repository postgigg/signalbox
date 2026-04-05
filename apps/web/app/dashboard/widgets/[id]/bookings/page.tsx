'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';

interface Booking {
  id: string;
  visitor_name: string;
  visitor_email: string;
  starts_at: string;
  ends_at: string;
  timezone: string;
  status: string;
  created_at: string;
}

type FilterType = 'upcoming' | 'past' | 'cancelled';

export default function BookingsPage(): React.ReactElement {
  const params = useParams();
  const widgetId = params.id as string;

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [total, setTotal] = useState(0);
  const [filter, setFilter] = useState<FilterType>('upcoming');
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  const pageSize = 25;

  const fetchBookings = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    try {
      const res = await fetch(
        `/api/v1/widgets/${widgetId}/bookings?filter=${filter}&page=${page}&pageSize=${pageSize}`
      );
      if (res.ok) {
        const data = await res.json() as { bookings: Booking[]; total: number };
        setBookings(data.bookings);
        setTotal(data.total);
      }
    } catch {
      // Non-blocking
    } finally {
      setIsLoading(false);
    }
  }, [widgetId, filter, page]);

  useEffect(() => {
    void fetchBookings();
  }, [fetchBookings]);

  async function handleStatusChange(bookingId: string, newStatus: string): Promise<void> {
    const res = await fetch(`/api/v1/widgets/${widgetId}/bookings/${bookingId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    });

    if (res.ok) {
      void fetchBookings();
    }
  }

  function formatDateTime(iso: string, tz: string): string {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
      timeZone: tz,
    }).format(new Date(iso));
  }

  function durationMinutes(start: string, end: string): number {
    return Math.round((new Date(end).getTime() - new Date(start).getTime()) / 60000);
  }

  const totalPages = Math.ceil(total / pageSize);

  const statusColors: Record<string, string> = {
    confirmed: 'bg-signal-light text-signal',
    completed: 'bg-success-light text-success',
    cancelled: 'bg-surface-alt text-stone',
    no_show: 'bg-danger-light text-danger',
  };

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <Link href={`/dashboard/widgets/${widgetId}`} className="text-sm text-stone hover:text-ink transition-colors duration-150">
          Widget
        </Link>
        <span className="text-stone-light">/</span>
        <span className="text-sm text-ink font-medium">Bookings</span>
      </div>

      <h1 className="page-heading mb-6">Bookings</h1>

      {/* Filters */}
      <div className="flex gap-2 mb-6">
        {(['upcoming', 'past', 'cancelled'] as const).map((f) => (
          <button
            key={f}
            onClick={() => { setFilter(f); setPage(1); }}
            className={`px-4 py-2 text-sm font-medium rounded-md border transition-colors duration-150 ${
              filter === f
                ? 'border-signal bg-signal-light text-signal'
                : 'border-border text-stone hover:text-ink'
            }`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="card text-center py-12">
          <p className="text-sm text-stone">Loading bookings...</p>
        </div>
      ) : bookings.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-sm text-stone">No {filter} bookings.</p>
        </div>
      ) : (
        <>
          <div className="bg-surface border border-border rounded-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-surface-alt">
                    <th className="text-left py-3 px-5 text-xs font-medium uppercase tracking-wide text-stone">Visitor</th>
                    <th className="text-left py-3 px-5 text-xs font-medium uppercase tracking-wide text-stone">Email</th>
                    <th className="text-left py-3 px-5 text-xs font-medium uppercase tracking-wide text-stone">Date/Time</th>
                    <th className="text-right py-3 px-5 text-xs font-medium uppercase tracking-wide text-stone">Duration</th>
                    <th className="text-center py-3 px-5 text-xs font-medium uppercase tracking-wide text-stone">Status</th>
                    <th className="text-right py-3 px-5 text-xs font-medium uppercase tracking-wide text-stone">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map((b) => (
                    <tr key={b.id} className="border-b border-border last:border-0 hover:bg-surface-alt transition-colors duration-150">
                      <td className="py-3.5 px-5 font-medium text-ink">{b.visitor_name}</td>
                      <td className="py-3.5 px-5 text-stone">{b.visitor_email}</td>
                      <td className="py-3.5 px-5 text-ink whitespace-nowrap">
                        {formatDateTime(b.starts_at, b.timezone)}
                      </td>
                      <td className="py-3.5 px-5 text-right text-stone font-mono">
                        {durationMinutes(b.starts_at, b.ends_at)}m
                      </td>
                      <td className="py-3.5 px-5 text-center">
                        <span className={`text-xs px-2 py-0.5 rounded-pill font-medium ${statusColors[b.status] ?? 'bg-surface-alt text-stone'}`}>
                          {b.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="py-3.5 px-5 text-right">
                        {b.status === 'confirmed' && (
                          <div className="flex gap-2 justify-end">
                            <button
                              onClick={() => void handleStatusChange(b.id, 'completed')}
                              className="text-xs text-success hover:text-success/80 font-medium"
                            >
                              Complete
                            </button>
                            <button
                              onClick={() => void handleStatusChange(b.id, 'no_show')}
                              className="text-xs text-stone hover:text-ink font-medium"
                            >
                              No show
                            </button>
                            <button
                              onClick={() => void handleStatusChange(b.id, 'cancelled')}
                              className="text-xs text-danger hover:text-danger/80 font-medium"
                            >
                              Cancel
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <p className="text-xs text-stone">
                Showing {(page - 1) * pageSize + 1}-{Math.min(page * pageSize, total)} of {total}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page === 1}
                  className="px-3 py-1.5 text-sm border border-border rounded-md disabled:opacity-40"
                >
                  Previous
                </button>
                <button
                  onClick={() => setPage(Math.min(totalPages, page + 1))}
                  disabled={page === totalPages}
                  className="px-3 py-1.5 text-sm border border-border rounded-md disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
