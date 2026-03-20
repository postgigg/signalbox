'use client';

import { useEffect, useRef } from 'react';

/**
 * Animated hero illustration showing the HawkLeads flow:
 * Visitor answers widget questions -> lead gets scored -> business owner sees who to call first.
 * Loops every ~6s: plays animation, holds 3s at "92 scored", fades out, restarts.
 */

const PLAY_MS = 2400;
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
            raf = requestAnimationFrame(() => {
              cycle();
            });
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
        viewBox="0 0 560 360"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-auto"
        role="img"
        aria-label="A visitor selects their budget in a HawkLeads widget. The lead is scored 92 and appears as a hot lead to call first."
      >
        <defs>
          <filter id="hero-sh" x="-4%" y="-4%" width="108%" height="112%">
            <feDropShadow dx="0" dy="4" stdDeviation="8" floodColor="#000" floodOpacity="0.06" />
          </filter>
        </defs>

        {/* ── Widget Card (left) ── */}
        <g className="hero-widget">
          {/* Card frame */}
          <rect x="16" y="44" width="196" height="272" rx="10" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="1" filter="url(#hero-sh)" />

          {/* Header */}
          <text x="42" y="76" fontSize="12" fontFamily="var(--font-display)" fill="#0F172A" fontWeight="600">
            Get a free quote
          </text>
          <rect x="32" y="88" width="164" height="1" fill="#F1F5F9" />

          {/* Progress dots */}
          <circle cx="92" cy="104" r="3" fill="#E2E8F0" />
          <circle cx="108" cy="104" r="3.5" fill="#2563EB" />
          <circle cx="124" cy="104" r="3" fill="#E2E8F0" />
          <text x="136" y="107" fontSize="7.5" fontFamily="var(--font-body)" fill="#94A3B8">
            2 of 3
          </text>

          {/* Previous answer: Timeline */}
          <text x="42" y="130" fontSize="8" fontFamily="var(--font-body)" fill="#94A3B8" fontWeight="500">
            Timeline
          </text>
          <rect x="42" y="136" width="80" height="22" rx="11" fill="#F0FDF4" />
          <text x="56" y="151" fontSize="8.5" fontFamily="var(--font-body)" fill="#16A34A" fontWeight="500">
            This week
          </text>

          {/* Current question */}
          <text x="42" y="182" fontSize="10" fontFamily="var(--font-body)" fill="#0F172A" fontWeight="500">
            What is your budget?
          </text>

          {/* Option A: not selected */}
          <g className="hero-opt-a">
            <rect x="42" y="194" width="72" height="28" rx="6" fill="#FAFAFA" stroke="#E2E8F0" strokeWidth="1" />
            <text x="58" y="212" fontSize="9" fontFamily="var(--font-body)" fill="#64748B">
              $2k - $5k
            </text>
          </g>

          {/* Option B: selected */}
          <g className="hero-opt-b">
            <rect x="122" y="194" width="78" height="28" rx="6" fill="#EFF6FF" stroke="#2563EB" strokeWidth="1.5" />
            <text x="134" y="212" fontSize="9" fontFamily="var(--font-body)" fill="#2563EB" fontWeight="500">
              $5k - $10k
            </text>
          </g>

          {/* Next button */}
          <rect x="42" y="240" width="152" height="30" rx="6" fill="#0F172A" />
          <text x="118" y="259" fontSize="10" fontFamily="var(--font-body)" fill="#FFFFFF" textAnchor="middle" fontWeight="500">
            Next
          </text>

          {/* Branding */}
          <text x="114" y="298" fontSize="7" fontFamily="var(--font-body)" fill="#CBD5E1" textAnchor="middle">
            hawkleads.io
          </text>
        </g>

        {/* ── Connecting Flow (middle) ── */}
        {/* Dotted arc from widget to dashboard */}
        <path
          className="hero-flow-line"
          d="M 216 186 C 240 146, 320 146, 348 186"
          stroke="#CBD5E1"
          strokeWidth="1.5"
          strokeDasharray="5 4"
          fill="none"
        />

        {/* Score circle — travels along the connector arc via CSS offset-path */}
        <g className="hero-score-pip">
          <circle cx="0" cy="0" r="22" fill="#EFF6FF" stroke="#2563EB" strokeWidth="1.5" />
          <text x="0" y="-3" fontSize="7" fontFamily="var(--font-body)" fill="#94A3B8" textAnchor="middle" fontWeight="500">
            Score
          </text>
          <text x="0" y="11" fontSize="14" fontFamily="var(--font-mono)" fill="#2563EB" textAnchor="middle" fontWeight="700">
            92
          </text>
        </g>

        {/* ── Lead Card (right) ── */}
        <g className="hero-lead-card">
          <rect x="348" y="24" width="200" height="312" rx="10" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="1" filter="url(#hero-sh)" />

          {/* Header */}
          <text x="370" y="54" fontSize="12" fontFamily="var(--font-display)" fill="#0F172A" fontWeight="600">
            New Lead
          </text>

          {/* Notification dot */}
          <g className="hero-notif">
            <circle cx="532" cy="44" r="4" fill="#DC2626" />
            <circle cx="532" cy="44" r="4" fill="none" stroke="#DC2626" strokeWidth="1.5" className="hero-ping" opacity="0" />
          </g>

          <rect x="362" y="66" width="172" height="1" fill="#F1F5F9" />

          {/* Avatar */}
          <circle cx="388" cy="96" r="18" fill="#FEF2F2" />
          <text x="388" y="102" fontSize="15" fontFamily="var(--font-body)" fill="#DC2626" fontWeight="600" textAnchor="middle">
            S
          </text>

          {/* Name + description */}
          <text x="416" y="92" fontSize="11" fontFamily="var(--font-body)" fill="#0F172A" fontWeight="500">
            Sarah Mitchell
          </text>
          <text x="416" y="108" fontSize="8.5" fontFamily="var(--font-body)" fill="#64748B">
            Plumbing repair, urgent
          </text>

          <rect x="362" y="124" width="172" height="1" fill="#F1F5F9" />

          {/* Score label */}
          <text x="370" y="146" fontSize="8" fontFamily="var(--font-body)" fill="#94A3B8" fontWeight="500" letterSpacing="0.5">
            LEAD SCORE
          </text>

          {/* Score number */}
          <g className="hero-score-num">
            <text x="370" y="178" fontSize="28" fontFamily="var(--font-display)" fill="#0F172A" fontWeight="700">
              92
            </text>
          </g>

          {/* Hot badge */}
          <g className="hero-badge">
            <rect x="412" y="160" width="34" height="18" rx="9" fill="#FEF2F2" />
            <text x="422" y="173" fontSize="9" fontFamily="var(--font-body)" fill="#DC2626" fontWeight="600">
              Hot
            </text>
          </g>

          {/* Score bar */}
          <rect x="370" y="192" width="160" height="6" rx="3" fill="#F1F5F9" />
          <rect x="370" y="192" width="147" height="6" rx="3" fill="#DC2626" className="hero-bar" />

          <rect x="362" y="210" width="172" height="1" fill="#F1F5F9" />

          {/* Details */}
          <text x="370" y="230" fontSize="8.5" fontFamily="var(--font-body)" fill="#64748B">
            Budget
          </text>
          <text x="534" y="230" fontSize="8.5" fontFamily="var(--font-body)" fill="#0F172A" fontWeight="500" textAnchor="end">
            $5k - $10k
          </text>

          <text x="370" y="248" fontSize="8.5" fontFamily="var(--font-body)" fill="#64748B">
            Timeline
          </text>
          <text x="534" y="248" fontSize="8.5" fontFamily="var(--font-body)" fill="#0F172A" fontWeight="500" textAnchor="end">
            This week
          </text>

          <text x="370" y="266" fontSize="8.5" fontFamily="var(--font-body)" fill="#64748B">
            Service
          </text>
          <text x="534" y="266" fontSize="8.5" fontFamily="var(--font-body)" fill="#0F172A" fontWeight="500" textAnchor="end">
            Plumbing
          </text>

          <rect x="362" y="278" width="172" height="1" fill="#F1F5F9" />

          {/* Call first button */}
          <g className="hero-call">
            <rect x="370" y="290" width="160" height="30" rx="6" fill="#16A34A" />
            <text x="450" y="309" fontSize="10" fontFamily="var(--font-body)" fill="#FFFFFF" textAnchor="middle" fontWeight="500">
              Call first
            </text>
          </g>
        </g>

        {/* Confetti burst at path destination */}
        <circle cx="348" cy="186" r="3" fill="#2563EB" className="hero-conf-1" />
        <circle cx="348" cy="186" r="2.5" fill="#16A34A" className="hero-conf-2" />
        <circle cx="348" cy="186" r="2" fill="#DC2626" className="hero-conf-3" />
        <circle cx="348" cy="186" r="2.5" fill="#2563EB" className="hero-conf-4" />
        <circle cx="348" cy="186" r="3" fill="#16A34A" className="hero-conf-5" />
        <circle cx="348" cy="186" r="2" fill="#DC2626" className="hero-conf-6" />
        <circle cx="348" cy="186" r="2.5" fill="#2563EB" className="hero-conf-7" />
        <circle cx="348" cy="186" r="3" fill="#16A34A" className="hero-conf-8" />
      </svg>
    </div>
  );
}
