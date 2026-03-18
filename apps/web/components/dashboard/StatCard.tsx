import React from 'react';

export interface StatCardProps {
  label: string;
  value: string | number;
  trend?: 'up' | 'down';
  trendLabel?: string;
  description?: string;
  className?: string;
}

export function StatCard({
  label,
  value,
  trend,
  trendLabel,
  description,
  className = '',
}: StatCardProps) {
  return (
    <div
      className={`bg-surface border border-border rounded-md p-5 ${className}`}
    >
      <p className="text-sm font-body font-medium text-stone">{label}</p>

      <div className="mt-2 flex items-baseline gap-3">
        <span className="font-mono text-3xl font-semibold text-ink">{value}</span>

        {trend && trendLabel && (
          <span
            className={[
              'inline-flex items-center gap-0.5 text-xs font-medium',
              trend === 'up' ? 'text-success' : 'text-danger',
            ].join(' ')}
          >
            <svg
              className={`h-3 w-3 ${trend === 'down' ? 'rotate-180' : ''}`}
              viewBox="0 0 12 12"
              fill="currentColor"
              aria-hidden="true"
            >
              <path d="M6 2l4 5H2l4-5z" />
            </svg>
            {trendLabel}
          </span>
        )}
      </div>

      {description && (
        <p className="mt-1 text-xs font-body text-stone">{description}</p>
      )}
    </div>
  );
}
