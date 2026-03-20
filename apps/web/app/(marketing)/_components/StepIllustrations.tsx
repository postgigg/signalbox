/**
 * Hand-crafted SVG illustrations with CSS animations for the three
 * "How It Works" steps. Each depicts the literal action described.
 *
 * 1. Build your flow — cards stacking into a flow builder
 * 2. Paste two lines — a code editor with a blinking cursor
 * 3. Get scored leads — a score gauge filling up with tier badges
 *
 * CSS-only animations. No libraries. Respects prefers-reduced-motion
 * via the .step-illustration wrapper (animations disabled in globals).
 */

export function FlowBuilderIllustration(): React.ReactElement {
  return (
    <div className="step-illustration" aria-hidden="true">
      <svg
        viewBox="0 0 240 160"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-auto"
      >
        {/* Card 1 — slides in from left */}
        <g className="step-flow-card-1">
          <rect x="16" y="20" width="96" height="40" rx="6" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="1.5" />
          <rect x="26" y="30" width="40" height="6" rx="3" fill="#E2E8F0" />
          <rect x="26" y="42" width="60" height="4" rx="2" fill="#F1F5F9" />
          <circle cx="96" cy="40" r="6" fill="#EFF6FF" stroke="#2563EB" strokeWidth="1.5" />
          <path d="M93 40h6M96 37v6" stroke="#2563EB" strokeWidth="1.5" strokeLinecap="round" />
        </g>

        {/* Connector line 1 — draws downward */}
        <line x1="64" y1="60" x2="64" y2="80" stroke="#CBD5E1" strokeWidth="1.5" strokeDasharray="4 3" className="step-flow-connector-1" />

        {/* Card 2 — slides in from right */}
        <g className="step-flow-card-2">
          <rect x="16" y="80" width="96" height="40" rx="6" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="1.5" />
          <rect x="26" y="90" width="52" height="6" rx="3" fill="#E2E8F0" />
          <rect x="26" y="102" width="44" height="4" rx="2" fill="#F1F5F9" />
          <circle cx="96" cy="100" r="6" fill="#EFF6FF" stroke="#2563EB" strokeWidth="1.5" />
          <path d="M93 100h6M96 97v6" stroke="#2563EB" strokeWidth="1.5" strokeLinecap="round" />
        </g>

        {/* Connector line 2 */}
        <line x1="64" y1="120" x2="64" y2="140" stroke="#CBD5E1" strokeWidth="1.5" strokeDasharray="4 3" className="step-flow-connector-2" />

        {/* Score weight panel — fades in on right side */}
        <g className="step-flow-weights">
          <rect x="132" y="30" width="92" height="100" rx="6" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="1.5" />
          <text x="144" y="50" fontSize="9" fontFamily="var(--font-body)" fill="#64748B" fontWeight="500">Score weights</text>

          {/* Weight bar 1 */}
          <rect x="144" y="60" width="68" height="6" rx="3" fill="#F1F5F9" />
          <rect x="144" y="60" width="54" height="6" rx="3" fill="#2563EB" className="step-flow-bar-1" />

          {/* Weight bar 2 */}
          <rect x="144" y="78" width="68" height="6" rx="3" fill="#F1F5F9" />
          <rect x="144" y="78" width="38" height="6" rx="3" fill="#2563EB" opacity="0.6" className="step-flow-bar-2" />

          {/* Weight bar 3 */}
          <rect x="144" y="96" width="68" height="6" rx="3" fill="#F1F5F9" />
          <rect x="144" y="96" width="22" height="6" rx="3" fill="#2563EB" opacity="0.35" className="step-flow-bar-3" />

          {/* 5 min badge */}
          <rect x="152" y="112" width="52" height="14" rx="7" fill="#EFF6FF" />
          <text x="163" y="122" fontSize="8" fontFamily="var(--font-mono)" fill="#2563EB" fontWeight="500">5 min</text>
        </g>
      </svg>
    </div>
  );
}

export function EmbedSnippetIllustration(): React.ReactElement {
  return (
    <div className="step-illustration" aria-hidden="true">
      <svg
        viewBox="0 0 240 160"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-auto"
      >
        {/* Editor chrome */}
        <rect x="16" y="12" width="208" height="136" rx="8" fill="#0F172A" />
        <circle cx="32" cy="26" r="4" fill="#DC2626" opacity="0.7" />
        <circle cx="44" cy="26" r="4" fill="#CA8A04" opacity="0.7" />
        <circle cx="56" cy="26" r="4" fill="#16A34A" opacity="0.7" />

        {/* Line numbers */}
        <text x="26" y="56" fontSize="9" fontFamily="var(--font-mono)" fill="#475569">1</text>
        <text x="26" y="76" fontSize="9" fontFamily="var(--font-mono)" fill="#475569">2</text>
        <text x="26" y="96" fontSize="9" fontFamily="var(--font-mono)" fill="#475569">3</text>
        <text x="26" y="116" fontSize="9" fontFamily="var(--font-mono)" fill="#475569">4</text>

        {/* Code line 1 — types in */}
        <g className="step-embed-line-1">
          <text x="42" y="56" fontSize="9" fontFamily="var(--font-mono)" fill="#94A3B8">&lt;</text>
          <text x="49" y="56" fontSize="9" fontFamily="var(--font-mono)" fill="#2563EB">script</text>
          <text x="85" y="56" fontSize="9" fontFamily="var(--font-mono)" fill="#94A3B8">&gt;</text>
        </g>

        {/* Code line 2 — types in with delay */}
        <g className="step-embed-line-2">
          <text x="50" y="76" fontSize="8" fontFamily="var(--font-mono)" fill="#CA8A04">HawkLeads</text>
          <text x="99" y="76" fontSize="8" fontFamily="var(--font-mono)" fill="#94A3B8">.</text>
          <text x="103" y="76" fontSize="8" fontFamily="var(--font-mono)" fill="#16A34A">init</text>
          <text x="122" y="76" fontSize="8" fontFamily="var(--font-mono)" fill="#94A3B8">(</text>
          <text x="127" y="76" fontSize="8" fontFamily="var(--font-mono)" fill="#DC2626">{`'sb_k3x...'`}</text>
          <text x="185" y="76" fontSize="8" fontFamily="var(--font-mono)" fill="#94A3B8">)</text>
        </g>

        {/* Code line 3 */}
        <g className="step-embed-line-3">
          <text x="42" y="96" fontSize="9" fontFamily="var(--font-mono)" fill="#94A3B8">&lt;/</text>
          <text x="54" y="96" fontSize="9" fontFamily="var(--font-mono)" fill="#2563EB">script</text>
          <text x="90" y="96" fontSize="9" fontFamily="var(--font-mono)" fill="#94A3B8">&gt;</text>
        </g>

        {/* Blinking cursor */}
        <rect x="97" y="88" width="1.5" height="12" fill="#2563EB" className="step-embed-cursor" />

        {/* "Copied!" badge — pops in */}
        <g className="step-embed-copied">
          <rect x="148" y="108" width="56" height="20" rx="6" fill="#16A34A" />
          <text x="157" y="122" fontSize="9" fontFamily="var(--font-body)" fill="#FFFFFF" fontWeight="500">Copied</text>
          <path d="M190 115l3 3 5-6" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </g>
      </svg>
    </div>
  );
}

export function ScoredLeadsIllustration(): React.ReactElement {
  return (
    <div className="step-illustration" aria-hidden="true">
      <svg
        viewBox="0 0 240 160"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-auto"
      >
        {/* Dashboard card frame */}
        <rect x="12" y="8" width="216" height="144" rx="8" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="1.5" />

        {/* Header bar */}
        <rect x="12" y="8" width="216" height="28" rx="8" fill="#F8FAFC" />
        <rect x="12" y="28" width="216" height="1" fill="#E2E8F0" />
        <text x="24" y="26" fontSize="9" fontFamily="var(--font-body)" fill="#64748B" fontWeight="500">Leads</text>

        {/* Score column header */}
        <text x="170" y="26" fontSize="8" fontFamily="var(--font-body)" fill="#94A3B8">Score</text>

        {/* Lead row 1 — HOT — slides in first */}
        <g className="step-leads-row-1">
          <rect x="20" y="40" width="200" height="30" rx="4" fill="#FFFFFF" />
          <circle cx="36" cy="55" r="8" fill="#FEF2F2" />
          <text x="33" y="58" fontSize="8" fontFamily="var(--font-body)" fill="#DC2626" fontWeight="600">S</text>
          <rect x="52" y="49" width="56" height="5" rx="2.5" fill="#0F172A" opacity="0.7" />
          <rect x="52" y="58" width="40" height="3.5" rx="1.75" fill="#E2E8F0" />
          {/* Hot badge */}
          <rect x="120" y="48" width="28" height="14" rx="7" fill="#FEF2F2" />
          <text x="126" y="58" fontSize="7" fontFamily="var(--font-body)" fill="#DC2626" fontWeight="600">Hot</text>

          {/* Score bar */}
          <rect x="160" y="51" width="48" height="8" rx="4" fill="#F1F5F9" />
          <rect x="160" y="51" width="44" height="8" rx="4" fill="#DC2626" className="step-leads-bar-1" />
          <text x="168" y="58" fontSize="7" fontFamily="var(--font-mono)" fill="#FFFFFF" fontWeight="600">92</text>
        </g>

        {/* Lead row 2 — WARM — slides in second */}
        <g className="step-leads-row-2">
          <rect x="20" y="74" width="200" height="30" rx="4" fill="#FFFFFF" />
          <circle cx="36" cy="89" r="8" fill="#FEFCE8" />
          <text x="33" y="92" fontSize="8" fontFamily="var(--font-body)" fill="#CA8A04" fontWeight="600">M</text>
          <rect x="52" y="83" width="48" height="5" rx="2.5" fill="#0F172A" opacity="0.7" />
          <rect x="52" y="92" width="36" height="3.5" rx="1.75" fill="#E2E8F0" />
          {/* Warm badge */}
          <rect x="120" y="82" width="36" height="14" rx="7" fill="#FEFCE8" />
          <text x="125" y="92" fontSize="7" fontFamily="var(--font-body)" fill="#CA8A04" fontWeight="600">Warm</text>

          {/* Score bar */}
          <rect x="160" y="85" width="48" height="8" rx="4" fill="#F1F5F9" />
          <rect x="160" y="85" width="30" height="8" rx="4" fill="#CA8A04" className="step-leads-bar-2" />
          <text x="165" y="92" fontSize="7" fontFamily="var(--font-mono)" fill="#FFFFFF" fontWeight="600">61</text>
        </g>

        {/* Lead row 3 — COLD — slides in third */}
        <g className="step-leads-row-3">
          <rect x="20" y="108" width="200" height="30" rx="4" fill="#FFFFFF" />
          <circle cx="36" cy="123" r="8" fill="#F8FAFC" />
          <text x="33" y="126" fontSize="8" fontFamily="var(--font-body)" fill="#94A3B8" fontWeight="600">J</text>
          <rect x="52" y="117" width="44" height="5" rx="2.5" fill="#0F172A" opacity="0.7" />
          <rect x="52" y="126" width="32" height="3.5" rx="1.75" fill="#E2E8F0" />
          {/* Cold badge */}
          <rect x="120" y="116" width="32" height="14" rx="7" fill="#F8FAFC" />
          <text x="126" y="126" fontSize="7" fontFamily="var(--font-body)" fill="#94A3B8" fontWeight="600">Cold</text>

          {/* Score bar */}
          <rect x="160" y="119" width="48" height="8" rx="4" fill="#F1F5F9" />
          <rect x="160" y="119" width="14" height="8" rx="4" fill="#94A3B8" className="step-leads-bar-3" />
          <text x="163" y="126" fontSize="7" fontFamily="var(--font-mono)" fill="#FFFFFF" fontWeight="600">28</text>
        </g>

        {/* Notification bell ping — pops on hot lead */}
        <g className="step-leads-ping">
          <circle cx="204" cy="20" r="4" fill="#DC2626" />
          <circle cx="204" cy="20" r="7" fill="none" stroke="#DC2626" strokeWidth="1" opacity="0.4" className="step-leads-ping-ring" />
        </g>
      </svg>
    </div>
  );
}
