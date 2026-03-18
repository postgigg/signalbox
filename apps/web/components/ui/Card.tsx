import React from 'react';

export interface CardProps {
  children: React.ReactNode;
  className?: string;
  hoverable?: boolean;
  header?: React.ReactNode;
  footer?: React.ReactNode;
}

export function Card({ children, className = '', hoverable = false, header, footer }: CardProps) {
  return (
    <div
      className={[
        'bg-surface border border-border rounded-md',
        hoverable ? 'transition-shadow duration-fast hover:shadow-sm' : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {header && (
        <div className="px-5 py-4 border-b border-border">{header}</div>
      )}
      <div className="p-5">{children}</div>
      {footer && (
        <div className="px-5 py-4 border-t border-border">{footer}</div>
      )}
    </div>
  );
}
