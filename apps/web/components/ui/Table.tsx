import React from 'react';

/* ------------------------------------------------------------------ */
/*  Table                                                              */
/* ------------------------------------------------------------------ */

export interface TableProps {
  children: React.ReactNode;
  className?: string;
}

export function Table({ children, className = '' }: TableProps) {
  return (
    <div className="w-full overflow-x-auto">
      <table className={`w-full border-collapse font-body ${className}`}>
        {children}
      </table>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  TableHead                                                          */
/* ------------------------------------------------------------------ */

export interface TableHeadProps {
  children: React.ReactNode;
  className?: string;
}

export function TableHead({ children, className = '' }: TableHeadProps) {
  return (
    <thead className={`bg-surface-alt ${className}`}>
      {children}
    </thead>
  );
}

/* ------------------------------------------------------------------ */
/*  TableBody                                                          */
/* ------------------------------------------------------------------ */

export interface TableBodyProps {
  children: React.ReactNode;
  className?: string;
}

export function TableBody({ children, className = '' }: TableBodyProps) {
  return <tbody className={className}>{children}</tbody>;
}

/* ------------------------------------------------------------------ */
/*  TableRow                                                           */
/* ------------------------------------------------------------------ */

export interface TableRowProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export function TableRow({ children, className = '', onClick }: TableRowProps) {
  return (
    <tr
      className={[
        'border-b border-border transition-colors duration-fast',
        'hover:bg-surface-alt',
        onClick ? 'cursor-pointer' : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={
        onClick
          ? (e: React.KeyboardEvent<HTMLTableRowElement>) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onClick();
              }
            }
          : undefined
      }
    >
      {children}
    </tr>
  );
}

/* ------------------------------------------------------------------ */
/*  TableHeaderCell                                                    */
/* ------------------------------------------------------------------ */

export interface TableHeaderCellProps {
  children: React.ReactNode;
  className?: string;
  align?: 'left' | 'right' | 'center';
  onClick?: () => void;
  sortable?: boolean;
  sorted?: 'asc' | 'desc' | false;
}

export function TableHeaderCell({
  children,
  className = '',
  align = 'left',
  onClick,
  sortable = false,
  sorted = false,
}: TableHeaderCellProps) {
  const alignClass =
    align === 'right' ? 'text-right' : align === 'center' ? 'text-center' : 'text-left';

  return (
    <th
      className={[
        'px-4 py-3 text-xs uppercase tracking-wide font-medium font-body text-stone',
        alignClass,
        sortable ? 'cursor-pointer select-none hover:text-ink transition-colors duration-fast' : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      onClick={onClick}
      aria-sort={
        sorted === 'asc'
          ? 'ascending'
          : sorted === 'desc'
            ? 'descending'
            : undefined
      }
    >
      <span className="inline-flex items-center gap-1">
        {children}
        {sortable && (
          <svg
            className={`h-3 w-3 transition-transform duration-fast ${
              sorted === 'desc' ? 'rotate-180' : ''
            } ${sorted ? 'opacity-100' : 'opacity-0'}`}
            viewBox="0 0 12 12"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M6 3l4 5H2l4-5z"
              fill="currentColor"
            />
          </svg>
        )}
      </span>
    </th>
  );
}

/* ------------------------------------------------------------------ */
/*  TableCell                                                          */
/* ------------------------------------------------------------------ */

export interface TableCellProps {
  children: React.ReactNode;
  className?: string;
  align?: 'left' | 'right' | 'center';
  mono?: boolean;
}

export function TableCell({
  children,
  className = '',
  align = 'left',
  mono = false,
}: TableCellProps) {
  const alignClass =
    align === 'right' ? 'text-right' : align === 'center' ? 'text-center' : 'text-left';

  return (
    <td
      className={[
        'px-4 py-3 text-sm text-ink',
        alignClass,
        mono ? 'font-mono' : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {children}
    </td>
  );
}
