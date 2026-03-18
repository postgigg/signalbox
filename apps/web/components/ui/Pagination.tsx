'use client';

import React from 'react';

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}

/**
 * Builds an array of page numbers + ellipsis markers around the current page.
 * Always shows first, last, and up to 2 pages around current.
 */
function getPageNumbers(current: number, total: number): (number | 'ellipsis')[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  const pages: (number | 'ellipsis')[] = [];

  pages.push(1);

  if (current > 3) {
    pages.push('ellipsis');
  }

  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);

  for (let i = start; i <= end; i++) {
    pages.push(i);
  }

  if (current < total - 2) {
    pages.push('ellipsis');
  }

  pages.push(total);

  return pages;
}

export function Pagination({ currentPage, totalPages, onPageChange, className = '' }: PaginationProps) {
  if (totalPages <= 1) return null;

  const pages = getPageNumbers(currentPage, totalPages);

  return (
    <nav className={`flex items-center gap-1 font-body ${className}`} aria-label="Pagination">
      {/* Previous */}
      <button
        type="button"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage <= 1}
        aria-label="Previous page"
        className={[
          'inline-flex items-center justify-center h-9 px-3 text-sm rounded-sm',
          'border border-border transition-colors duration-fast',
          'focus:outline-none focus:ring-2 focus:ring-signal focus:ring-offset-2',
          currentPage <= 1
            ? 'opacity-50 pointer-events-none'
            : 'hover:bg-surface-alt text-ink',
        ].join(' ')}
      >
        <svg className="h-4 w-4 mr-1" viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <path d="M10 12L6 8l4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        Prev
      </button>

      {/* Page numbers */}
      {pages.map((page, index) =>
        page === 'ellipsis' ? (
          <span
            key={`ellipsis-${index}`}
            className="inline-flex items-center justify-center h-9 w-9 text-sm text-stone"
            aria-hidden="true"
          >
            ...
          </span>
        ) : (
          <button
            key={page}
            type="button"
            onClick={() => onPageChange(page)}
            aria-label={`Page ${page}`}
            aria-current={page === currentPage ? 'page' : undefined}
            className={[
              'inline-flex items-center justify-center h-9 w-9 text-sm rounded-sm',
              'transition-colors duration-fast',
              'focus:outline-none focus:ring-2 focus:ring-signal focus:ring-offset-2',
              page === currentPage
                ? 'bg-signal text-white font-medium'
                : 'text-ink hover:bg-surface-alt',
            ].join(' ')}
          >
            {page}
          </button>
        ),
      )}

      {/* Next */}
      <button
        type="button"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage >= totalPages}
        aria-label="Next page"
        className={[
          'inline-flex items-center justify-center h-9 px-3 text-sm rounded-sm',
          'border border-border transition-colors duration-fast',
          'focus:outline-none focus:ring-2 focus:ring-signal focus:ring-offset-2',
          currentPage >= totalPages
            ? 'opacity-50 pointer-events-none'
            : 'hover:bg-surface-alt text-ink',
        ].join(' ')}
      >
        Next
        <svg className="h-4 w-4 ml-1" viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
    </nav>
  );
}
