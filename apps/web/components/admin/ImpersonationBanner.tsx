'use client';

import React from 'react';

export interface ImpersonationBannerProps {
  accountName: string;
  onExit: () => void;
}

export function ImpersonationBanner({ accountName, onExit }: ImpersonationBannerProps) {
  return (
    <div
      className="fixed top-0 left-0 right-0 z-[100] bg-warning text-ink"
      role="alert"
    >
      <div className="max-w-content mx-auto px-5 h-10 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <svg
            className="h-4 w-4 shrink-0"
            viewBox="0 0 16 16"
            fill="currentColor"
            aria-hidden="true"
          >
            <path d="M8 1a7 7 0 100 14A7 7 0 008 1zm0 2a1 1 0 011 1v4a1 1 0 01-2 0V4a1 1 0 011-1zm0 8a1 1 0 100-2 1 1 0 000 2z" />
          </svg>
          <span className="text-sm font-body font-medium">
            Viewing as <span className="font-semibold">{accountName}</span>
          </span>
        </div>
        <button
          type="button"
          onClick={onExit}
          className={[
            'inline-flex items-center h-7 px-3 text-xs font-body font-medium',
            'bg-ink text-white rounded-sm',
            'hover:bg-ink/90 transition-colors duration-fast',
            'focus:outline-none focus:ring-2 focus:ring-ink focus:ring-offset-2 focus:ring-offset-warning',
          ].join(' ')}
        >
          Exit
        </button>
      </div>
    </div>
  );
}
