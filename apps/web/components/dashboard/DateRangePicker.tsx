'use client';

import React, { useState, useCallback } from 'react';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export interface DateRange {
  from: string; // YYYY-MM-DD
  to: string;   // YYYY-MM-DD
}

type PresetKey = 'today' | '7d' | '30d' | '90d' | 'custom';

export interface DateRangePickerProps {
  value: DateRange;
  onChange: (range: DateRange) => void;
  className?: string;
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function formatDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function subtractDays(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return formatDate(d);
}

const presets: { key: PresetKey; label: string }[] = [
  { key: 'today', label: 'Today' },
  { key: '7d', label: '7 days' },
  { key: '30d', label: '30 days' },
  { key: '90d', label: '90 days' },
  { key: 'custom', label: 'Custom' },
];

function rangeForPreset(key: Exclude<PresetKey, 'custom'>): DateRange {
  const today = formatDate(new Date());
  switch (key) {
    case 'today':
      return { from: today, to: today };
    case '7d':
      return { from: subtractDays(7), to: today };
    case '30d':
      return { from: subtractDays(30), to: today };
    case '90d':
      return { from: subtractDays(90), to: today };
  }
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function DateRangePicker({ value, onChange, className = '' }: DateRangePickerProps) {
  const [activePreset, setActivePreset] = useState<PresetKey>('30d');

  const handlePreset = useCallback(
    (key: PresetKey) => {
      setActivePreset(key);
      if (key !== 'custom') {
        onChange(rangeForPreset(key));
      }
    },
    [onChange],
  );

  return (
    <div className={`flex flex-wrap items-end gap-3 ${className}`}>
      {/* Preset buttons */}
      <div className="flex items-center gap-1 bg-surface-alt rounded-sm p-0.5">
        {presets.map((preset) => (
          <button
            key={preset.key}
            type="button"
            onClick={() => handlePreset(preset.key)}
            className={[
              'px-3 py-1.5 text-xs font-body font-medium rounded-sm transition-colors duration-fast',
              'focus:outline-none focus:ring-2 focus:ring-signal focus:ring-inset',
              activePreset === preset.key
                ? 'bg-surface text-ink shadow-sm'
                : 'text-stone hover:text-ink',
            ].join(' ')}
          >
            {preset.label}
          </button>
        ))}
      </div>

      {/* Custom date inputs (visible when custom is active) */}
      {activePreset === 'custom' && (
        <div className="flex items-center gap-2">
          <input
            type="date"
            value={value.from}
            onChange={(e) => onChange({ ...value, from: e.target.value })}
            className="h-9 px-2.5 text-sm font-body border border-border rounded-sm bg-surface focus:outline-none focus:border-signal focus:ring-1 focus:ring-signal transition-all duration-fast"
            aria-label="Start date"
          />
          <span className="text-xs text-stone">to</span>
          <input
            type="date"
            value={value.to}
            onChange={(e) => onChange({ ...value, to: e.target.value })}
            className="h-9 px-2.5 text-sm font-body border border-border rounded-sm bg-surface focus:outline-none focus:border-signal focus:ring-1 focus:ring-signal transition-all duration-fast"
            aria-label="End date"
          />
        </div>
      )}
    </div>
  );
}
