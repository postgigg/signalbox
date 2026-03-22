'use client';

import { useState, useEffect } from 'react';

interface PageGuideProps {
  readonly storageKey: string;
  readonly title?: string;
  readonly children: React.ReactNode;
}

export function PageGuide({ storageKey, title, children }: PageGuideProps): React.ReactElement | null {
  const [mounted, setMounted] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  const fullKey = `guide_${storageKey}`;

  useEffect(() => {
    setMounted(true);
    try {
      if (localStorage.getItem(fullKey) === 'dismissed') {
        setDismissed(true);
      }
    } catch {
      // localStorage unavailable
    }
  }, [fullKey]);

  // Avoid hydration mismatch: render nothing until mounted
  if (!mounted || dismissed) {
    return null;
  }

  function handleDismiss(): void {
    try {
      localStorage.setItem(fullKey, 'dismissed');
    } catch {
      // localStorage unavailable
    }
    setDismissed(true);
  }

  return (
    <div className="mb-6 bg-signal-light/50 border border-signal/20 rounded-md p-4 flex items-start gap-3">
      {/* Info icon */}
      <svg
        className="w-5 h-5 text-signal flex-shrink-0 mt-0.5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.5}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z"
        />
      </svg>

      <div className="flex-1 min-w-0">
        {title !== undefined && (
          <p className="text-sm font-medium text-ink font-body mb-1">{title}</p>
        )}
        <div className="text-sm text-stone font-body leading-relaxed">{children}</div>
      </div>

      {/* Dismiss button */}
      <button
        type="button"
        onClick={handleDismiss}
        aria-label="Dismiss guide"
        className="flex-shrink-0 p-1 text-stone hover:text-ink transition-colors duration-fast focus:outline-none focus:ring-2 focus:ring-signal focus:ring-offset-1 rounded-sm"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}
