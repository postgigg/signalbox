import React from 'react';

export interface ProgressBarProps {
  /** Percentage 0-100 */
  value: number;
  color?: string;
  className?: string;
  label?: string;
}

export function ProgressBar({
  value,
  color,
  className = '',
  label,
}: ProgressBarProps) {
  const clamped = Math.min(100, Math.max(0, value));

  return (
    <div className={className}>
      {label && (
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-sm font-body text-ink">{label}</span>
          <span className="text-sm font-mono text-stone">{Math.round(clamped)}%</span>
        </div>
      )}
      <div
        className="h-1 w-full rounded-pill bg-border overflow-hidden"
        role="progressbar"
        aria-valuenow={clamped}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label ?? `${Math.round(clamped)}% progress`}
      >
        <div
          className={[
            'h-full rounded-pill transition-[width] duration-[400ms] ease-out',
            !color ? 'bg-signal' : '',
          ].join(' ')}
          style={{
            width: `${clamped}%`,
            ...(color ? { backgroundColor: color } : {}),
          }}
        />
      </div>
    </div>
  );
}
