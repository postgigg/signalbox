import React from 'react';

export type BadgeVariant =
  | 'hot'
  | 'warm'
  | 'cold'
  | 'new'
  | 'viewed'
  | 'contacted'
  | 'qualified'
  | 'disqualified'
  | 'converted'
  | 'archived';

export interface BadgeProps {
  variant: BadgeVariant;
  children: React.ReactNode;
  className?: string;
}

const variantClasses: Record<BadgeVariant, string> = {
  hot: 'bg-danger-light text-danger',
  warm: 'bg-warning-light text-warning',
  cold: 'bg-surface-alt text-stone',
  new: 'bg-signal-light text-signal',
  viewed: 'bg-surface-alt text-stone',
  contacted: 'bg-success-light text-success',
  qualified: 'bg-signal-light text-signal',
  disqualified: 'bg-danger-light text-danger',
  converted: 'bg-success-light text-success',
  archived: 'bg-surface-alt text-stone',
};

export function Badge({ variant, children, className = '' }: BadgeProps) {
  return (
    <span
      className={[
        'inline-flex items-center rounded-pill text-xs font-medium px-2.5 py-0.5',
        variantClasses[variant],
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {children}
    </span>
  );
}
