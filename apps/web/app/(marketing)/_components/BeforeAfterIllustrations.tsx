/**
 * Before/After SVG illustrations with CSS animations.
 *
 * Before: A flat gray inbox where every lead looks identical.
 *         A question mark, a slow clock reading "47h".
 * After:  A scored lead list with tier badges, a bell pinging,
 *         a response timer reading "3 min".
 *
 * CSS-only animations. Respects prefers-reduced-motion.
 */

export function BeforeIllustration(): React.ReactElement {
  return (
    <div className="step-illustration" aria-hidden="true">
      <svg
        viewBox="0 0 280 120"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-auto"
      >
        {/* Inbox frame */}
        <rect x="16" y="6" width="168" height="108" rx="8" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="1.5" />
        <rect x="16" y="6" width="168" height="22" rx="8" fill="#F8FAFC" />
        <rect x="16" y="26" width="168" height="1" fill="#E2E8F0" />
        <text x="28" y="21" fontSize="8" fontFamily="var(--font-body)" fill="#94A3B8" fontWeight="500">Inbox (37)</text>

        {/* Row 1 — identical gray lead */}
        <g className="ba-before-row-1">
          <rect x="24" y="32" width="152" height="22" rx="3" fill="#FFFFFF" />
          <circle cx="36" cy="43" r="6" fill="#F1F5F9" />
          <rect x="48" y="38" width="52" height="4" rx="2" fill="#E2E8F0" />
          <rect x="48" y="46" width="80" height="3" rx="1.5" fill="#F1F5F9" />
          <rect x="140" y="39" width="28" height="3" rx="1.5" fill="#F1F5F9" />
        </g>

        {/* Row 2 — identical */}
        <g className="ba-before-row-2">
          <rect x="24" y="56" width="152" height="22" rx="3" fill="#FFFFFF" />
          <circle cx="36" cy="67" r="6" fill="#F1F5F9" />
          <rect x="48" y="62" width="44" height="4" rx="2" fill="#E2E8F0" />
          <rect x="48" y="70" width="72" height="3" rx="1.5" fill="#F1F5F9" />
          <rect x="140" y="63" width="28" height="3" rx="1.5" fill="#F1F5F9" />
        </g>

        {/* Row 3 — identical */}
        <g className="ba-before-row-3">
          <rect x="24" y="80" width="152" height="22" rx="3" fill="#FFFFFF" />
          <circle cx="36" cy="91" r="6" fill="#F1F5F9" />
          <rect x="48" y="86" width="56" height="4" rx="2" fill="#E2E8F0" />
          <rect x="48" y="94" width="68" height="3" rx="1.5" fill="#F1F5F9" />
          <rect x="140" y="87" width="28" height="3" rx="1.5" fill="#F1F5F9" />
        </g>

        {/* Question mark floating over the rows */}
        <g className="ba-before-question">
          <circle cx="206" cy="28" r="16" fill="#F8FAFC" stroke="#E2E8F0" strokeWidth="1.5" />
          <text x="200" y="34" fontSize="16" fontFamily="var(--font-display)" fill="#CBD5E1" fontWeight="600">?</text>
        </g>

        {/* Slow clock */}
        <g className="ba-before-clock">
          <rect x="196" y="56" width="68" height="36" rx="6" fill="#F8FAFC" stroke="#E2E8F0" strokeWidth="1.5" />
          {/* Clock face */}
          <circle cx="214" cy="74" r="8" fill="none" stroke="#CBD5E1" strokeWidth="1.5" />
          <line x1="214" y1="74" x2="214" y2="69" stroke="#94A3B8" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="214" y1="74" x2="218" y2="74" stroke="#94A3B8" strokeWidth="1" strokeLinecap="round" />
          <circle cx="214" cy="74" r="1.5" fill="#94A3B8" />
          <text x="228" y="72" fontSize="10" fontFamily="var(--font-mono)" fill="#94A3B8" fontWeight="600">47h</text>
          <text x="228" y="80" fontSize="6" fontFamily="var(--font-body)" fill="#CBD5E1">avg reply</text>
        </g>

        {/* "All look the same" label */}
        <g className="ba-before-label">
          <rect x="196" y="100" width="68" height="14" rx="7" fill="#F1F5F9" />
          <text x="206" y="110" fontSize="6.5" fontFamily="var(--font-body)" fill="#94A3B8" fontWeight="500">All look the same</text>
        </g>
      </svg>
    </div>
  );
}

export function AfterIllustration(): React.ReactElement {
  return (
    <div className="step-illustration" aria-hidden="true">
      <svg
        viewBox="0 0 280 120"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-auto"
      >
        {/* Dashboard frame */}
        <rect x="16" y="6" width="168" height="108" rx="8" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="1.5" />
        <rect x="16" y="6" width="168" height="22" rx="8" fill="#F8FAFC" />
        <rect x="16" y="26" width="168" height="1" fill="#E2E8F0" />
        <text x="28" y="21" fontSize="8" fontFamily="var(--font-body)" fill="#64748B" fontWeight="500">Leads</text>
        <text x="128" y="21" fontSize="7" fontFamily="var(--font-body)" fill="#94A3B8">Score</text>

        {/* Row 1 — HOT, score 92 */}
        <g className="ba-after-row-1">
          <rect x="24" y="32" width="152" height="22" rx="3" fill="#FFFFFF" />
          <circle cx="36" cy="43" r="6" fill="#FEF2F2" />
          <text x="33" y="46" fontSize="7" fontFamily="var(--font-body)" fill="#DC2626" fontWeight="600">S</text>
          <rect x="48" y="38" width="44" height="4.5" rx="2" fill="#0F172A" opacity="0.7" />
          <rect x="48" y="46" width="32" height="3" rx="1.5" fill="#E2E8F0" />
          {/* Hot badge */}
          <rect x="98" y="37" width="22" height="12" rx="6" fill="#FEF2F2" />
          <text x="103" y="46" fontSize="6" fontFamily="var(--font-body)" fill="#DC2626" fontWeight="600">Hot</text>
          {/* Score */}
          <rect x="128" y="38" width="36" height="8" rx="4" fill="#F1F5F9" />
          <rect x="128" y="38" width="33" height="8" rx="4" fill="#DC2626" className="ba-after-bar-1" />
          <text x="134" y="45" fontSize="6.5" fontFamily="var(--font-mono)" fill="#FFFFFF" fontWeight="600">92</text>
        </g>

        {/* Row 2 — WARM, score 64 */}
        <g className="ba-after-row-2">
          <rect x="24" y="56" width="152" height="22" rx="3" fill="#FFFFFF" />
          <circle cx="36" cy="67" r="6" fill="#FEFCE8" />
          <text x="33" y="70" fontSize="7" fontFamily="var(--font-body)" fill="#CA8A04" fontWeight="600">M</text>
          <rect x="48" y="62" width="40" height="4.5" rx="2" fill="#0F172A" opacity="0.7" />
          <rect x="48" y="70" width="28" height="3" rx="1.5" fill="#E2E8F0" />
          {/* Warm badge */}
          <rect x="98" y="61" width="28" height="12" rx="6" fill="#FEFCE8" />
          <text x="101" y="70" fontSize="6" fontFamily="var(--font-body)" fill="#CA8A04" fontWeight="600">Warm</text>
          {/* Score */}
          <rect x="128" y="62" width="36" height="8" rx="4" fill="#F1F5F9" />
          <rect x="128" y="62" width="23" height="8" rx="4" fill="#CA8A04" className="ba-after-bar-2" />
          <text x="132" y="69" fontSize="6.5" fontFamily="var(--font-mono)" fill="#FFFFFF" fontWeight="600">64</text>
        </g>

        {/* Row 3 — COLD, score 21 */}
        <g className="ba-after-row-3">
          <rect x="24" y="80" width="152" height="22" rx="3" fill="#FFFFFF" />
          <circle cx="36" cy="91" r="6" fill="#F8FAFC" />
          <text x="34" y="94" fontSize="7" fontFamily="var(--font-body)" fill="#94A3B8" fontWeight="600">J</text>
          <rect x="48" y="86" width="36" height="4.5" rx="2" fill="#0F172A" opacity="0.7" />
          <rect x="48" y="94" width="24" height="3" rx="1.5" fill="#E2E8F0" />
          {/* Cold badge */}
          <rect x="98" y="85" width="24" height="12" rx="6" fill="#F8FAFC" />
          <text x="102" y="94" fontSize="6" fontFamily="var(--font-body)" fill="#94A3B8" fontWeight="600">Cold</text>
          {/* Score */}
          <rect x="128" y="86" width="36" height="8" rx="4" fill="#F1F5F9" />
          <rect x="128" y="86" width="10" height="8" rx="4" fill="#94A3B8" className="ba-after-bar-3" />
          <text x="130" y="93" fontSize="6.5" fontFamily="var(--font-mono)" fill="#FFFFFF" fontWeight="600">21</text>
        </g>

        {/* Bell with alert ping */}
        <g className="ba-after-bell">
          {/* Bell knob */}
          <circle cx="214" cy="12" r="1.5" fill="#DC2626" />
          {/* Bell body: flat bottom, sides taper up, dome arc on top */}
          <path
            d="M207 26h14l-2-4v-4a5 5 0 0 0-10 0v4l-2 4z"
            fill="none"
            stroke="#DC2626"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
          {/* Clapper arc */}
          <path d="M211 26a3 3 0 0 0 6 0" fill="none" stroke="#DC2626" strokeWidth="1.5" strokeLinecap="round" />
          {/* Ping dot */}
          <circle cx="222" cy="14" r="3" fill="#DC2626" />
          <circle cx="222" cy="14" r="6" fill="none" stroke="#DC2626" strokeWidth="1" opacity="0.3" className="ba-after-ping-ring" />
        </g>

        {/* Fast response timer */}
        <g className="ba-after-timer">
          <rect x="196" y="44" width="68" height="36" rx="6" fill="#F0FDF4" stroke="#16A34A" strokeWidth="1" opacity="0.8" />
          {/* Fast clock */}
          <circle cx="214" cy="62" r="8" fill="none" stroke="#16A34A" strokeWidth="1.5" />
          <line x1="214" y1="62" x2="214" y2="58" stroke="#16A34A" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="214" y1="62" x2="217" y2="64" stroke="#16A34A" strokeWidth="1" strokeLinecap="round" />
          <circle cx="214" cy="62" r="1.5" fill="#16A34A" />
          <text x="228" y="60" fontSize="10" fontFamily="var(--font-mono)" fill="#16A34A" fontWeight="600">3m</text>
          <text x="228" y="68" fontSize="6" fontFamily="var(--font-body)" fill="#16A34A" opacity="0.7">response</text>
        </g>

        {/* "Sorted by score" label */}
        <g className="ba-after-label">
          <rect x="196" y="88" width="68" height="14" rx="7" fill="#EFF6FF" />
          <text x="203" y="98" fontSize="6.5" fontFamily="var(--font-body)" fill="#2563EB" fontWeight="500">Sorted by score</text>
        </g>
      </svg>
    </div>
  );
}
