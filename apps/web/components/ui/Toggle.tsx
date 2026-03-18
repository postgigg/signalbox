'use client';

import React from 'react';

export interface ToggleProps {
  enabled: boolean;
  onChange: (enabled: boolean) => void;
  label?: string;
  disabled?: boolean;
}

export function Toggle({ enabled, onChange, label, disabled = false }: ToggleProps) {
  const id = label ? `toggle-${label.toLowerCase().replace(/\s+/g, '-')}` : undefined;

  return (
    <div className="inline-flex items-center gap-2.5">
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={enabled}
        aria-label={label}
        disabled={disabled}
        onClick={() => onChange(!enabled)}
        className={[
          'relative inline-flex h-6 w-10 shrink-0 rounded-full transition-colors duration-fast',
          'focus:outline-none focus:ring-2 focus:ring-signal focus:ring-offset-2',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          enabled ? 'bg-signal' : 'bg-border',
        ].join(' ')}
      >
        <span
          aria-hidden="true"
          className={[
            'pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-sm',
            'transform transition-transform duration-fast',
            enabled ? 'translate-x-[18px]' : 'translate-x-[2px]',
            'mt-[2px]',
          ].join(' ')}
        />
      </button>
      {label && (
        <label
          htmlFor={id}
          className="text-sm font-body text-ink cursor-pointer select-none"
        >
          {label}
        </label>
      )}
    </div>
  );
}
