'use client';

import Link from 'next/link';
import { useState, useEffect, useCallback, useRef } from 'react';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const STORAGE_KEY = 'hl_audit_promo_dismissed';
const SCROLL_THRESHOLD = 40;
const TIME_DELAY_MS = 20000;
const COOLDOWN_DAYS = 7;

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function AuditPromoModal(): React.ReactElement | null {
  const [open, setOpen] = useState(false);
  const triggered = useRef(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const previouslyFocused = useRef<HTMLElement | null>(null);

  const isDismissed = useCallback((): boolean => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) return false;
      const dismissedAt = parseInt(stored, 10);
      if (isNaN(dismissedAt)) return false;
      const daysSince = (Date.now() - dismissedAt) / (1000 * 60 * 60 * 24);
      return daysSince < COOLDOWN_DAYS;
    } catch {
      return false;
    }
  }, []);

  const showModal = useCallback((): void => {
    if (triggered.current) return;
    if (isDismissed()) return;
    triggered.current = true;
    setOpen(true);
  }, [isDismissed]);

  const handleClose = useCallback((): void => {
    setOpen(false);
    try {
      localStorage.setItem(STORAGE_KEY, String(Date.now()));
    } catch {
      // localStorage unavailable
    }
  }, []);

  // --- Triggers: scroll, time, exit intent ---
  useEffect(() => {
    if (isDismissed()) return;

    const timer = setTimeout(() => { showModal(); }, TIME_DELAY_MS);

    function handleScroll(): void {
      const scrollable = document.documentElement.scrollHeight - window.innerHeight;
      if (scrollable <= 0) return;
      const scrollPercent = (window.scrollY / scrollable) * 100;
      if (scrollPercent >= SCROLL_THRESHOLD) showModal();
    }

    function handleMouseLeave(e: MouseEvent): void {
      if (e.clientY <= 0) showModal();
    }

    window.addEventListener('scroll', handleScroll, { passive: true });
    document.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('scroll', handleScroll);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [isDismissed, showModal]);

  // --- Focus management ---
  useEffect(() => {
    if (!open) return;

    previouslyFocused.current = document.activeElement as HTMLElement | null;

    const panel = panelRef.current;
    if (panel) {
      const focusable = panel.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
      );
      focusable[0]?.focus();
    }

    function handleKeyDown(e: KeyboardEvent): void {
      if (e.key === 'Escape') handleClose();
    }

    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
      previouslyFocused.current?.focus();
    };
  }, [open, handleClose]);

  const handleTabTrap = (e: React.KeyboardEvent<HTMLDivElement>): void => {
    if (e.key !== 'Tab') return;
    const panel = panelRef.current;
    if (!panel) return;

    const focusable = panel.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
    );
    if (focusable.length === 0) return;

    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (!first || !last) return;

    if (e.shiftKey) {
      if (document.activeElement === first) {
        e.preventDefault();
        last.focus();
      }
    } else {
      if (document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center px-4"
      role="dialog"
      aria-modal="true"
      aria-label="Free lead capture audit"
      onKeyDown={handleTabTrap}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        aria-hidden="true"
        onClick={handleClose}
      />

      {/* Panel */}
      <div
        ref={panelRef}
        className="relative z-10 w-full max-w-xl bg-surface border border-border rounded-md overflow-hidden animate-in fade-in"
      >
        {/* Dark hero section */}
        <div className="bg-ink px-8 pt-10 pb-8 text-center relative">
          {/* Close */}
          <button
            type="button"
            onClick={handleClose}
            className="absolute top-3 right-3 p-1.5 rounded-sm text-white/50 hover:text-white transition-colors duration-fast focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-ink"
            aria-label="Close"
          >
            <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
            </svg>
          </button>

          {/* Fake score display */}
          <div className="inline-flex items-baseline gap-0.5 mb-4">
            <span className="font-display text-6xl font-semibold text-white">?</span>
            <span className="text-lg text-white/40 font-body">/100</span>
          </div>

          <h2 className="font-display text-2xl font-semibold text-white leading-tight">
            How does your site score on lead capture?
          </h2>
          <p className="mt-3 text-sm text-stone-light leading-relaxed max-w-sm mx-auto">
            We analyzed 500+ business websites. The average score was 18 out of 100.
            Most contact forms collect names and emails but nothing that helps you prioritize.
          </p>
        </div>

        {/* Light content section */}
        <div className="px-8 pt-6 pb-8">
          {/* Three score categories */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="text-center">
              <div className="w-10 h-10 mx-auto rounded-md bg-surface-alt border border-border flex items-center justify-center mb-2">
                <svg className="w-4 h-4 text-ink" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25z" />
                </svg>
              </div>
              <p className="text-xs font-medium text-ink font-body">Qualification</p>
              <p className="text-xs text-stone mt-0.5">Right questions?</p>
            </div>
            <div className="text-center">
              <div className="w-10 h-10 mx-auto rounded-md bg-surface-alt border border-border flex items-center justify-center mb-2">
                <svg className="w-4 h-4 text-ink" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
                </svg>
              </div>
              <p className="text-xs font-medium text-ink font-body">Speed</p>
              <p className="text-xs text-stone mt-0.5">Fast response?</p>
            </div>
            <div className="text-center">
              <div className="w-10 h-10 mx-auto rounded-md bg-surface-alt border border-border flex items-center justify-center mb-2">
                <svg className="w-4 h-4 text-ink" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
                </svg>
              </div>
              <p className="text-xs font-medium text-ink font-body">Routing</p>
              <p className="text-xs text-stone mt-0.5">Right person?</p>
            </div>
          </div>

          {/* Value props */}
          <div className="border-t border-border pt-5 mb-6">
            <div className="flex items-center gap-2.5 mb-2.5">
              <svg className="w-3.5 h-3.5 text-success flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-sm text-stone">Takes 10 seconds. Enter your URL, get your score.</span>
            </div>
            <div className="flex items-center gap-2.5 mb-2.5">
              <svg className="w-3.5 h-3.5 text-success flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-sm text-stone">Free. No signup, no email required.</span>
            </div>
            <div className="flex items-center gap-2.5">
              <svg className="w-3.5 h-3.5 text-success flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-sm text-stone">Shareable report card with specific findings.</span>
            </div>
          </div>

          {/* CTA */}
          <Link
            href="/audit"
            onClick={handleClose}
            className="btn-primary-lg w-full text-center"
          >
            Get your free score
          </Link>
          <button
            type="button"
            onClick={handleClose}
            className="w-full mt-3 text-center text-xs text-stone-light hover:text-stone transition-colors duration-fast py-1"
          >
            Maybe later
          </button>
        </div>
      </div>
    </div>
  );
}
