import React from 'react';

type LogoSize = 'sm' | 'md' | 'lg';

export interface LogoProps {
  size?: LogoSize;
  dark?: boolean;
  className?: string;
}

const sizeClasses: Record<LogoSize, string> = {
  sm: 'text-lg',
  md: 'text-xl',
  lg: 'text-2xl',
};

export function Logo({ size = 'md', dark = false, className = '' }: LogoProps) {
  return (
    <span
      className={[
        'font-display font-semibold tracking-tight select-none',
        sizeClasses[size],
        dark ? 'text-white' : 'text-ink',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      aria-label="HawkLeads"
    >
      HawkLeads
    </span>
  );
}
