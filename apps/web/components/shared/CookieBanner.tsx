'use client';

import Link from 'next/link';
import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'hl_cookie_consent';

type ConsentValue = 'accepted' | 'declined';

export function CookieBanner(): React.ReactElement | null {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) {
        setVisible(true);
      }
    } catch {
      // localStorage unavailable (private browsing, etc.)
      setVisible(true);
    }
  }, []);

  const handleConsent = useCallback((value: ConsentValue): void => {
    try {
      localStorage.setItem(STORAGE_KEY, value);
    } catch {
      // Silently fail if localStorage unavailable
    }
    setVisible(false);
  }, []);

  if (!visible) return null;

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-50 p-4 md:p-6"
      role="dialog"
      aria-label="Cookie consent"
    >
      <div className="max-w-content mx-auto bg-paper border border-border rounded-md p-4 md:p-5 flex flex-col md:flex-row items-start md:items-center gap-4 shadow-sm">
        <div className="flex-1 text-sm text-stone leading-relaxed">
          <p>
            We use essential cookies for authentication and a single functional cookie (
            <code className="text-xs bg-surface-alt px-1 py-0.5 rounded">sb_v</code>
            ) for anonymous visitor tracking to improve lead scoring. No advertising or third-party tracking.{' '}
            <Link
              href="/cookies"
              className="text-signal hover:text-signal-hover transition-colors duration-fast underline"
            >
              Cookie Policy
            </Link>
          </p>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          <button
            type="button"
            onClick={() => handleConsent('declined')}
            className="btn-ghost text-sm px-4 py-2"
          >
            Decline
          </button>
          <button
            type="button"
            onClick={() => handleConsent('accepted')}
            className="btn-primary text-sm px-4 py-2"
          >
            Accept
          </button>
        </div>
      </div>
    </div>
  );
}
