import React from 'react';

export interface EmptyStateProps {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: React.ReactNode;
  className?: string;
}

export function EmptyState({
  title,
  description,
  actionLabel,
  onAction,
  icon,
  className = '',
}: EmptyStateProps) {
  return (
    <div className={`flex flex-col items-center justify-center py-16 px-6 text-center ${className}`}>
      {icon && (
        <div className="mb-4 text-stone" aria-hidden="true">
          {icon}
        </div>
      )}

      <h3 className="font-display text-xl font-semibold text-ink mb-2">{title}</h3>

      <p className="text-sm text-stone font-body max-w-sm mb-6">{description}</p>

      {actionLabel && onAction && (
        <button
          type="button"
          onClick={onAction}
          className={[
            'inline-flex items-center justify-center h-10 px-4 text-sm font-medium font-body',
            'bg-ink text-white rounded-sm',
            'hover:bg-ink/90 transition-colors duration-fast',
            'focus:outline-none focus:ring-2 focus:ring-signal focus:ring-offset-2',
          ].join(' ')}
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}
