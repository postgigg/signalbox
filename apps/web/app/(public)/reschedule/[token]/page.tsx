'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';

import { APP_NAME } from '@/lib/constants';

interface BookingInfo {
  id: string;
  startsAt: string;
  endsAt: string;
  timezone: string;
  visitorName: string;
  visitorEmail: string;
  status: string;
}

interface SettingsInfo {
  slotDuration: number;
  timezone: string;
  headingText: string;
}

interface DaySlot {
  date: string;
  dayLabel: string;
  slots: Array<{ start: string; startsAt: string }>;
}

type PageStatus = 'loading' | 'ready' | 'confirming' | 'done' | 'error';

export default function ReschedulePage(): React.ReactElement {
  const params = useParams();
  const token = params.token as string;

  const [status, setStatus] = useState<PageStatus>('loading');
  const [booking, setBooking] = useState<BookingInfo | null>(null);
  const [settings, setSettings] = useState<SettingsInfo | null>(null);
  const [slots, setSlots] = useState<DaySlot[]>([]);
  const [selectedDate, setSelectedDate] = useState<number>(0);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');

  const apiBase = typeof window !== 'undefined'
    ? window.location.origin
    : '';

  const loadData = useCallback(async (): Promise<void> => {
    try {
      const [bookingRes, slotsRes] = await Promise.all([
        fetch(`${apiBase}/api/v1/public/bookings/reschedule/${token}`),
        fetch(`${apiBase}/api/v1/public/bookings/reschedule/${token}/slots`),
      ]);

      if (!bookingRes.ok) {
        const err = await bookingRes.json().catch(() => ({ error: 'Failed to load booking' }));
        setErrorMessage((err as Record<string, string>).error ?? 'Failed to load booking');
        setStatus('error');
        return;
      }

      const bookingData = await bookingRes.json() as { booking: BookingInfo; settings: SettingsInfo };
      setBooking(bookingData.booking);
      setSettings(bookingData.settings);

      if (slotsRes.ok) {
        const slotsData = await slotsRes.json() as { slots: DaySlot[] };
        setSlots(slotsData.slots);

        // Select first day with slots
        const firstAvailable = slotsData.slots.findIndex((d: DaySlot) => d.slots.length > 0);
        if (firstAvailable >= 0) setSelectedDate(firstAvailable);
      }

      setStatus('ready');
    } catch {
      setErrorMessage('Failed to load booking information.');
      setStatus('error');
    }
  }, [apiBase, token]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  async function handleReschedule(): Promise<void> {
    if (!selectedSlot) return;

    setStatus('confirming');
    setErrorMessage('');

    try {
      const res = await fetch(`${apiBase}/api/v1/public/bookings/reschedule/${token}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ startsAt: selectedSlot }),
      });

      if (res.status === 409) {
        setErrorMessage('This time was just booked. Please pick another.');
        setSelectedSlot(null);
        // Refresh slots
        const slotsRes = await fetch(`${apiBase}/api/v1/public/bookings/reschedule/${token}/slots`);
        if (slotsRes.ok) {
          const slotsData = await slotsRes.json() as { slots: DaySlot[] };
          setSlots(slotsData.slots);
        }
        setStatus('ready');
        return;
      }

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: 'Reschedule failed' }));
        setErrorMessage((err as Record<string, string>).error ?? 'Reschedule failed');
        setStatus('ready');
        return;
      }

      const data = await res.json() as { booking: BookingInfo };
      setBooking(data.booking);
      setStatus('done');
    } catch {
      setErrorMessage('Network error. Please try again.');
      setStatus('ready');
    }
  }

  function formatDateTime(iso: string, tz: string): string {
    const date = new Date(iso);
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
      timeZone: tz,
    }).format(date);
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-surface-alt flex items-center justify-center">
        <div className="text-stone">Loading...</div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="min-h-screen bg-surface-alt flex items-center justify-center">
        <div className="card max-w-md w-full mx-4 text-center py-12">
          <h1 className="text-xl font-semibold text-ink mb-2">Unable to reschedule</h1>
          <p className="text-sm text-stone">{errorMessage}</p>
        </div>
      </div>
    );
  }

  if (status === 'done' && booking) {
    const tz = settings?.timezone ?? booking.timezone;
    return (
      <div className="min-h-screen bg-surface-alt flex items-center justify-center">
        <div className="card max-w-md w-full mx-4 text-center py-12">
          <div className="w-12 h-12 rounded-full bg-success-light flex items-center justify-center mx-auto mb-4">
            <svg viewBox="0 0 24 24" className="w-6 h-6 text-success" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <h1 className="text-xl font-semibold text-ink mb-2">Call rescheduled</h1>
          <p className="text-sm text-stone">
            {formatDateTime(booking.startsAt, tz)}
          </p>
        </div>
      </div>
    );
  }

  const currentDay = slots[selectedDate];
  const tz = settings?.timezone ?? booking?.timezone ?? 'America/New_York';

  return (
    <div className="min-h-screen bg-surface-alt flex items-center justify-center py-8">
      <div className="card max-w-lg w-full mx-4">
        <div className="text-center mb-6">
          <h1 className="text-xl font-semibold text-ink mb-1">Reschedule your call</h1>
          {booking && (
            <p className="text-sm text-stone">
              Current: {formatDateTime(booking.startsAt, tz)}
            </p>
          )}
        </div>

        {errorMessage && (
          <div className="text-sm text-center text-danger mb-4 p-3 bg-danger-light rounded-md">
            {errorMessage}
          </div>
        )}

        {/* Date strip */}
        <div className="flex gap-2 overflow-x-auto pb-3 mb-4">
          {slots.map((day, i) => (
            <button
              key={day.date}
              onClick={() => {
                if (day.slots.length === 0) return;
                setSelectedDate(i);
                setSelectedSlot(null);
              }}
              className={`flex-shrink-0 flex flex-col items-center px-3 py-2 rounded-md border text-sm transition-colors duration-150 ${
                i === selectedDate
                  ? 'border-signal bg-signal-light text-signal font-semibold'
                  : day.slots.length === 0
                    ? 'border-border text-stone opacity-40 cursor-default'
                    : 'border-border text-stone hover:border-signal hover:text-signal cursor-pointer'
              }`}
            >
              <span className="text-xs uppercase">{day.dayLabel.split(',')[0]?.trim()}</span>
              <span className="text-base font-semibold">{day.dayLabel.split(',')[1]?.trim()}</span>
            </button>
          ))}
        </div>

        {/* Time slots */}
        <div className="space-y-2 max-h-60 overflow-y-auto mb-4">
          {currentDay && currentDay.slots.length > 0 ? (
            currentDay.slots.map((slot) => (
              <button
                key={slot.startsAt}
                onClick={() => setSelectedSlot(slot.startsAt)}
                className={`w-full text-center py-3 rounded-md border text-sm font-medium transition-colors duration-150 ${
                  selectedSlot === slot.startsAt
                    ? 'border-signal bg-signal-light text-signal'
                    : 'border-border text-ink hover:border-signal'
                }`}
              >
                {slot.start}
              </button>
            ))
          ) : (
            <p className="text-sm text-stone text-center py-6">No times available for this date.</p>
          )}
        </div>

        {/* Confirm */}
        <button
          onClick={() => void handleReschedule()}
          disabled={!selectedSlot || status === 'confirming'}
          className="btn-primary w-full py-3 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {status === 'confirming' ? 'Rescheduling...' : 'Confirm new time'}
        </button>

        <p className="text-xs text-stone text-center mt-4">
          Powered by {APP_NAME}
        </p>
      </div>
    </div>
  );
}
