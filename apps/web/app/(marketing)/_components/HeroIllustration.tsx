'use client';

import { useEffect, useRef } from 'react';

/**
 * Animated hero illustration: a dashboard showing 3 scored leads.
 * Hot lead (92) at top with "Call first" button, warm (67) middle, cold (23) bottom.
 * One glance communicates: leads are scored, prioritized, call the hot ones.
 * Loops every ~5.5s: rows slide in staggered, scores pop, hold, fade, restart.
 */

const PLAY_MS = 2200;
const HOLD_MS = 3000;
const FADE_MS = 400;

export function HeroIllustration(): React.ReactElement {
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (reducedMotion.matches) {
      el.classList.add('hero-active');
      el.style.opacity = '1';
      return;
    }

    let timer: ReturnType<typeof setTimeout> | undefined;
    let raf: number | undefined;
    let running = false;

    function cycle(): void {
      if (!el) return;
      el.classList.add('hero-active');
      el.style.opacity = '1';

      timer = setTimeout(() => {
        if (!el) return;
        el.style.opacity = '0';
        timer = setTimeout(() => {
          if (!el) return;
          el.classList.remove('hero-active');
          raf = requestAnimationFrame(() => {
            raf = requestAnimationFrame(() => { cycle(); });
          });
        }, FADE_MS);
      }, PLAY_MS + HOLD_MS);
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting && !running) {
            running = true;
            cycle();
          }
        }
      },
      { threshold: 0.15 },
    );
    observer.observe(el);

    return () => {
      observer.disconnect();
      if (timer !== undefined) clearTimeout(timer);
      if (raf !== undefined) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div
      ref={wrapperRef}
      className="step-illustration"
      style={{ opacity: 0, transition: `opacity ${String(FADE_MS)}ms ease` }}
    >
      <svg
        viewBox="0 0 520 340"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-auto"
        role="img"
        aria-label="A dashboard showing three leads scored 92, 67, and 23. The highest-scoring lead has a Call First button."
      >
        {/* ── Card Background ── */}
        <g className="hero-frame">
          <rect x="0" y="0" width="520" height="340" rx="12" fill="#1E293B" stroke="#334155" strokeWidth="1" />

          {/* Header */}
          <text x="24" y="34" fontSize="13" fontFamily="var(--font-display)" fill="#F1F5F9" fontWeight="600">
            Your Leads
          </text>
          <rect x="108" y="18" width="46" height="22" rx="4" fill="#334155" />
          <text x="131" y="33" fontSize="8.5" fontFamily="var(--font-body)" fill="#94A3B8" textAnchor="middle" fontWeight="500">
            Today
          </text>

          {/* Notification count */}
          <g className="hero-notif-count">
            <circle cx="492" cy="28" r="11" fill="#DC2626" />
            <text x="492" y="32" fontSize="9" fontFamily="var(--font-body)" fill="#FFFFFF" textAnchor="middle" fontWeight="600">
              3
            </text>
          </g>

          {/* Header divider */}
          <rect x="0" y="50" width="520" height="1" fill="#334155" />

          {/* Column labels */}
          <text x="68" y="66" fontSize="7.5" fontFamily="var(--font-body)" fill="#475569" fontWeight="500" letterSpacing="0.5">
            LEAD
          </text>
          <text x="350" y="66" fontSize="7.5" fontFamily="var(--font-body)" fill="#475569" fontWeight="500" letterSpacing="0.5">
            SCORE
          </text>
          <text x="410" y="66" fontSize="7.5" fontFamily="var(--font-body)" fill="#475569" fontWeight="500" letterSpacing="0.5">
            TIER
          </text>
          <rect x="0" y="74" width="520" height="1" fill="#334155" opacity="0.5" />
        </g>

        {/* ── Row 1: Hot Lead (Score 92) ── */}
        <g className="hero-row-1">
          {/* Row highlight glow */}
          <rect className="hero-row-glow" x="6" y="80" width="508" height="68" rx="8" fill="#0F172A" />
          {/* Green left accent */}
          <rect x="6" y="80" width="3" height="68" rx="1" fill="#16A34A" />

          {/* Avatar */}
          <circle cx="38" cy="114" r="16" fill="#FEF2F2" />
          <text x="38" y="119" fontSize="13" fontFamily="var(--font-body)" fill="#DC2626" fontWeight="600" textAnchor="middle">
            S
          </text>

          {/* Name + details */}
          <text x="64" y="106" fontSize="11.5" fontFamily="var(--font-body)" fill="#F1F5F9" fontWeight="500">
            Sarah Mitchell
          </text>
          <text x="64" y="122" fontSize="8.5" fontFamily="var(--font-body)" fill="#64748B">
            Plumbing repair · $5k-$10k · This week
          </text>

          {/* Score */}
          <g className="hero-score-1">
            <text x="366" y="118" fontSize="22" fontFamily="var(--font-display)" fill="#F1F5F9" fontWeight="700">
              92
            </text>
          </g>

          {/* Hot badge */}
          <g className="hero-badge-hot">
            <rect x="408" y="102" width="34" height="20" rx="10" fill="#FEF2F2" />
            <text x="425" y="116" fontSize="9" fontFamily="var(--font-body)" fill="#DC2626" fontWeight="600" textAnchor="middle">
              Hot
            </text>
          </g>

          {/* Call first button */}
          <g className="hero-call-btn">
            <rect x="452" y="100" width="58" height="24" rx="6" fill="#16A34A" />
            <text x="481" y="116" fontSize="9" fontFamily="var(--font-body)" fill="#FFFFFF" fontWeight="500" textAnchor="middle">
              Call first
            </text>
          </g>
        </g>

        {/* Row divider */}
        <rect x="24" y="154" width="472" height="1" fill="#334155" opacity="0.4" />

        {/* ── Row 2: Warm Lead (Score 67) ── */}
        <g className="hero-row-2">
          {/* Avatar */}
          <circle cx="38" cy="186" r="16" fill="#FEF3C7" />
          <text x="38" y="191" fontSize="13" fontFamily="var(--font-body)" fill="#B45309" fontWeight="600" textAnchor="middle">
            J
          </text>

          {/* Name + details */}
          <text x="64" y="178" fontSize="11.5" fontFamily="var(--font-body)" fill="#CBD5E1" fontWeight="500">
            James Rivera
          </text>
          <text x="64" y="194" fontSize="8.5" fontFamily="var(--font-body)" fill="#64748B">
            HVAC install · $2k-$5k · Next month
          </text>

          {/* Score */}
          <g className="hero-score-2">
            <text x="366" y="190" fontSize="22" fontFamily="var(--font-display)" fill="#CBD5E1" fontWeight="700">
              67
            </text>
          </g>

          {/* Warm badge */}
          <rect x="408" y="174" width="44" height="20" rx="10" fill="#422006" />
          <text x="430" y="188" fontSize="9" fontFamily="var(--font-body)" fill="#F59E0B" fontWeight="600" textAnchor="middle">
            Warm
          </text>
        </g>

        {/* Row divider */}
        <rect x="24" y="218" width="472" height="1" fill="#334155" opacity="0.4" />

        {/* ── Row 3: Cold Lead (Score 23) ── */}
        <g className="hero-row-3">
          {/* Avatar */}
          <circle cx="38" cy="250" r="16" fill="#334155" />
          <text x="38" y="255" fontSize="13" fontFamily="var(--font-body)" fill="#64748B" fontWeight="600" textAnchor="middle">
            L
          </text>

          {/* Name + details */}
          <text x="64" y="242" fontSize="11.5" fontFamily="var(--font-body)" fill="#64748B" fontWeight="500">
            Lisa Kim
          </text>
          <text x="64" y="258" fontSize="8.5" fontFamily="var(--font-body)" fill="#475569">
            Roof inspection · Under $1k · No rush
          </text>

          {/* Score */}
          <g className="hero-score-3">
            <text x="366" y="254" fontSize="22" fontFamily="var(--font-display)" fill="#64748B" fontWeight="700">
              23
            </text>
          </g>

          {/* Cold badge */}
          <rect x="408" y="238" width="40" height="20" rx="10" fill="#1E293B" stroke="#334155" strokeWidth="1" />
          <text x="428" y="252" fontSize="9" fontFamily="var(--font-body)" fill="#64748B" fontWeight="600" textAnchor="middle">
            Cold
          </text>
        </g>

        {/* ── Footer: Where scores come from ── */}
        <g className="hero-origin">
          <rect x="0" y="280" width="520" height="1" fill="#334155" />

          {/* Mini widget icon */}
          <rect x="24" y="294" width="32" height="32" rx="6" fill="#334155" />
          <rect x="30" y="300" width="20" height="2.5" rx="1" fill="#475569" />
          <rect x="30" y="306" width="14" height="2.5" rx="1" fill="#475569" />
          <circle cx="34" cy="316" r="2.5" fill="#2563EB" />
          <circle cx="42" cy="316" r="2.5" fill="#334155" stroke="#475569" strokeWidth="0.5" />

          {/* Arrow */}
          <path d="M 62 310 L 72 310" stroke="#475569" strokeWidth="1" strokeDasharray="2 2" />
          <path d="M 70 307 L 75 310 L 70 313" stroke="#475569" strokeWidth="1" fill="none" />

          <text x="82" y="306" fontSize="9" fontFamily="var(--font-body)" fill="#94A3B8" fontWeight="500">
            Scored from your website widget
          </text>
          <text x="82" y="320" fontSize="8" fontFamily="var(--font-body)" fill="#475569">
            Each visitor answers 2-5 qualifying questions. Scores update in real time.
          </text>
        </g>
      </svg>
    </div>
  );
}
