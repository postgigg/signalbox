import React from 'react';

type SpinnerSize = 'sm' | 'md' | 'lg';

export interface SpinnerProps {
  size?: SpinnerSize;
  className?: string;
}

const sizeClasses: Record<SpinnerSize, string> = {
  sm: 'h-4 w-4',
  md: 'h-6 w-6',
  lg: 'h-8 w-8',
};

export function Spinner({ size = 'md', className = '' }: SpinnerProps) {
  return (
    <span
      role="status"
      aria-label="Loading"
      className={`inline-block ${sizeClasses[size]} ${className}`}
    >
      <span
        className={[
          'block rounded-full border-2 border-current border-t-transparent animate-spin',
          'text-signal',
          sizeClasses[size],
        ].join(' ')}
        aria-hidden="true"
      />
      <span className="sr-only">Loading</span>
    </span>
  );
}
