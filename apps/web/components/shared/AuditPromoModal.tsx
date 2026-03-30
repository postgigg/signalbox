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
      return (Date.now() - dismissedAt) / (1000 * 60 * 60 * 24) < COOLDOWN_DAYS;
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
    try { localStorage.setItem(STORAGE_KEY, String(Date.now())); } catch { /* noop */ }
  }, []);

  useEffect(() => {
    if (isDismissed()) return;
    const timer = setTimeout(() => { showModal(); }, TIME_DELAY_MS);
    function handleScroll(): void {
      const scrollable = document.documentElement.scrollHeight - window.innerHeight;
      if (scrollable > 0 && (window.scrollY / scrollable) * 100 >= SCROLL_THRESHOLD) showModal();
    }
    function handleMouseLeave(e: MouseEvent): void {
      if (e.clientY <= 0) showModal();
    }
    window.addEventListener('scroll', handleScroll, { passive: true });
    document.addEventListener('mouseleave', handleMouseLeave);
    return () => { clearTimeout(timer); window.removeEventListener('scroll', handleScroll); document.removeEventListener('mouseleave', handleMouseLeave); };
  }, [isDismissed, showModal]);

  useEffect(() => {
    if (!open) return;
    previouslyFocused.current = document.activeElement as HTMLElement | null;
    const panel = panelRef.current;
    if (panel) {
      const focusable = panel.querySelectorAll<HTMLElement>('a[href], button:not([disabled])');
      focusable[0]?.focus();
    }
    function handleKeyDown(e: KeyboardEvent): void { if (e.key === 'Escape') handleClose(); }
    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';
    return () => { document.removeEventListener('keydown', handleKeyDown); document.body.style.overflow = ''; previouslyFocused.current?.focus(); };
  }, [open, handleClose]);

  const handleTabTrap = (e: React.KeyboardEvent<HTMLDivElement>): void => {
    if (e.key !== 'Tab') return;
    const panel = panelRef.current;
    if (!panel) return;
    const focusable = panel.querySelectorAll<HTMLElement>('a[href], button:not([disabled])');
    if (focusable.length === 0) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (!first || !last) return;
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100]"
      role="dialog"
      aria-modal="true"
      aria-label="Free lead capture audit"
      onKeyDown={handleTabTrap}
    >
      <div
        ref={panelRef}
        className="w-full h-full bg-ink overflow-y-auto"
      >
        {/* Close */}
        <button
          type="button"
          onClick={handleClose}
          className="fixed top-5 right-5 md:top-8 md:right-8 z-10 p-2 rounded-sm text-white/40 hover:text-white transition-colors duration-fast focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-ink"
          aria-label="Close"
        >
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Centered content */}
        <div className="min-h-full flex flex-col items-center justify-center px-6 py-16 md:py-20">
          <div className="w-full max-w-md text-center">

            {/* Score ring */}
            <div className="relative inline-flex items-center justify-center w-24 h-24 md:w-32 md:h-32 mb-8 md:mb-10">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="44" fill="none" stroke="#1E293B" strokeWidth="4" />
                <circle cx="50" cy="50" r="44" fill="none" stroke="#2563EB" strokeWidth="4" strokeLinecap="round" strokeDasharray="276.46" strokeDashoffset="276.46" />
              </svg>
              <span className="absolute font-display text-4xl md:text-5xl font-semibold text-white">?</span>
            </div>

            {/* Heading */}
            <h2 className="font-display text-2xl md:text-4xl font-semibold text-white leading-tight">
              How does your site score on lead capture?
            </h2>

            <p className="mt-4 md:mt-5 text-sm md:text-base text-stone-light leading-relaxed">
              We analyzed 500+ business websites. The average score was 18 out of 100.
              Most contact forms collect names and emails but nothing that helps you prioritize.
            </p>

            {/* Three categories */}
            <div className="mt-8 md:mt-10 grid grid-cols-3 gap-4 md:gap-6">
              <div className="text-center">
                <div className="w-11 h-11 md:w-14 md:h-14 mx-auto rounded-md bg-white/5 border border-white/10 flex items-center justify-center mb-2">
                  <svg className="w-5 h-5 md:w-6 md:h-6 text-white/70" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25z" />
                  </svg>
                </div>
                <p className="text-xs md:text-sm font-medium text-white font-body">Qualification</p>
                <p className="text-[10px] md:text-xs text-stone-light mt-0.5">Right questions?</p>
              </div>
              <div className="text-center">
                <div className="w-11 h-11 md:w-14 md:h-14 mx-auto rounded-md bg-white/5 border border-white/10 flex items-center justify-center mb-2">
                  <svg className="w-5 h-5 md:w-6 md:h-6 text-white/70" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
                  </svg>
                </div>
                <p className="text-xs md:text-sm font-medium text-white font-body">Speed</p>
                <p className="text-[10px] md:text-xs text-stone-light mt-0.5">Fast response?</p>
              </div>
              <div className="text-center">
                <div className="w-11 h-11 md:w-14 md:h-14 mx-auto rounded-md bg-white/5 border border-white/10 flex items-center justify-center mb-2">
                  <svg className="w-5 h-5 md:w-6 md:h-6 text-white/70" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
                  </svg>
                </div>
                <p className="text-xs md:text-sm font-medium text-white font-body">Routing</p>
                <p className="text-[10px] md:text-xs text-stone-light mt-0.5">Right person?</p>
              </div>
            </div>

            {/* Value props */}
            <div className="mt-8 md:mt-10 space-y-3 text-left max-w-sm mx-auto">
              <div className="flex items-center gap-3">
                <svg className="w-4 h-4 text-success flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-xs md:text-sm text-stone-light">Takes 10 seconds. Enter your URL, get your score.</span>
              </div>
              <div className="flex items-center gap-3">
                <svg className="w-4 h-4 text-success flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-xs md:text-sm text-stone-light">Free. No signup, no email required.</span>
              </div>
              <div className="flex items-center gap-3">
                <svg className="w-4 h-4 text-success flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-xs md:text-sm text-stone-light">Shareable report card with specific findings.</span>
              </div>
            </div>

            {/* CTA */}
            <div className="mt-10 md:mt-12">
              <Link
                href="/audit"
                onClick={handleClose}
                className="inline-flex items-center justify-center rounded-md bg-white text-ink font-body font-medium text-sm md:text-base h-12 md:h-14 w-full transition-all duration-fast hover:bg-paper focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-ink"
              >
                Get your free score
              </Link>
              <button
                type="button"
                onClick={handleClose}
                className="w-full mt-4 text-center text-xs md:text-sm text-stone-light/60 hover:text-stone-light transition-colors duration-fast py-2"
              >
                Maybe later
              </button>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
