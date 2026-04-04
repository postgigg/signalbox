/**
 * SVG illustrations for the Why HawkLeads page.
 *
 * Problem section (light bg):
 * 1. ProblemBlindnessIllustration — identical lead cards with hidden dollar values
 * 2. ProblemWastedTimeIllustration — clock with declining qualification bar chart
 * 3. ProblemSpeedIllustration — timer with dramatic drop line after 5 min
 *
 * Solution section (dark bg):
 * 4. SolutionScoreIllustration — lead card scoring from 0 to 92 with Hot badge
 * 5. SolutionCallListIllustration — prioritized lead list with alert pinging
 * 6. SolutionNurtureIllustration — email sequence timeline with badge warming
 *
 * CSS-only animations triggered by `.is-visible` on parent.
 * Respects prefers-reduced-motion via globals.css.
 */

/* ── Problem 1: Lead Blindness ── */
export function ProblemBlindnessIllustration(): React.ReactElement {
  return (
    <div className="step-illustration" aria-hidden="true">
      <svg viewBox="0 0 480 240" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto">
        {/* Inbox frame */}
        <rect x="40" y="20" width="400" height="200" rx="8" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="1.5" />
        <rect x="40" y="20" width="400" height="28" rx="8" fill="#F8FAFC" />
        <rect x="40" y="47" width="400" height="1" fill="#E2E8F0" />
        <text x="56" y="39" fontSize="11" fontFamily="var(--font-body)" fill="#94A3B8" fontWeight="500">Inbox (12 new)</text>

        {/* Card 1 — $200 value hidden */}
        <g className="why-blind-card-1">
          <rect x="56" y="58" width="368" height="44" rx="6" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="1" />
          <circle cx="78" cy="80" r="10" fill="#F1F5F9" />
          <rect x="96" y="72" width="80" height="5" rx="2.5" fill="#E2E8F0" />
          <rect x="96" y="83" width="140" height="4" rx="2" fill="#F1F5F9" />
          <g className="why-blind-price-1">
            <rect x="340" y="68" width="68" height="24" rx="6" fill="#F1F5F9" />
            <text x="355" y="84" fontSize="11" fontFamily="var(--font-mono)" fill="#94A3B8" fontWeight="600">$200</text>
          </g>
        </g>

        {/* Card 2 — $15,000 value hidden */}
        <g className="why-blind-card-2">
          <rect x="56" y="110" width="368" height="44" rx="6" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="1" />
          <circle cx="78" cy="132" r="10" fill="#F1F5F9" />
          <rect x="96" y="124" width="72" height="5" rx="2.5" fill="#E2E8F0" />
          <rect x="96" y="135" width="120" height="4" rx="2" fill="#F1F5F9" />
          <g className="why-blind-price-2">
            <rect x="340" y="120" width="68" height="24" rx="6" fill="#F1F5F9" />
            <text x="346" y="136" fontSize="11" fontFamily="var(--font-mono)" fill="#94A3B8" fontWeight="600">$15,000</text>
          </g>
        </g>

        {/* Card 3 — another low value */}
        <g className="why-blind-card-3">
          <rect x="56" y="162" width="368" height="44" rx="6" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="1" />
          <circle cx="78" cy="184" r="10" fill="#F1F5F9" />
          <rect x="96" y="176" width="88" height="5" rx="2.5" fill="#E2E8F0" />
          <rect x="96" y="187" width="108" height="4" rx="2" fill="#F1F5F9" />
          <g className="why-blind-price-3">
            <rect x="340" y="172" width="68" height="24" rx="6" fill="#F1F5F9" />
            <text x="355" y="188" fontSize="11" fontFamily="var(--font-mono)" fill="#94A3B8" fontWeight="600">$500</text>
          </g>
        </g>

        {/* Equals sign between cards to show they look identical */}
        <g className="why-blind-equals">
          <text x="230" y="218" fontSize="9" fontFamily="var(--font-body)" fill="#CBD5E1" fontWeight="500" textAnchor="middle">
            All look the same. Which one do you call first?
          </text>
        </g>
      </svg>
    </div>
  );
}

/* ── Problem 2: Wasted Time ── */
export function ProblemWastedTimeIllustration(): React.ReactElement {
  return (
    <div className="step-illustration" aria-hidden="true">
      <svg viewBox="0 0 480 240" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto">
        {/* Clock on left */}
        <circle cx="100" cy="100" r="52" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="2" />
        <circle cx="100" cy="100" r="44" fill="none" stroke="#F1F5F9" strokeWidth="1" />
        {/* Hour marks */}
        {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((deg) => (
          <line
            key={deg}
            x1={100 + 38 * Math.cos((deg - 90) * Math.PI / 180)}
            y1={100 + 38 * Math.sin((deg - 90) * Math.PI / 180)}
            x2={100 + 42 * Math.cos((deg - 90) * Math.PI / 180)}
            y2={100 + 42 * Math.sin((deg - 90) * Math.PI / 180)}
            stroke="#CBD5E1" strokeWidth="2" strokeLinecap="round"
          />
        ))}
        {/* Clock hands */}
        <line x1="100" y1="100" x2="100" y2="68" stroke="#0F172A" strokeWidth="2.5" strokeLinecap="round" />
        <line x1="100" y1="100" x2="124" y2="100" stroke="#0F172A" strokeWidth="2" strokeLinecap="round" />
        <circle cx="100" cy="100" r="3" fill="#0F172A" />

        {/* Bar chart on right — 4 bars showing call quality */}
        <g>
          <text x="210" y="36" fontSize="10" fontFamily="var(--font-body)" fill="#64748B" fontWeight="500">Call outcomes</text>

          {/* Bar backgrounds */}
          <rect x="210" y="48" width="220" height="28" rx="4" fill="#F8FAFC" />
          <rect x="210" y="84" width="220" height="28" rx="4" fill="#F8FAFC" />
          <rect x="210" y="120" width="220" height="28" rx="4" fill="#F8FAFC" />
          <rect x="210" y="156" width="220" height="28" rx="4" fill="#F8FAFC" />

          {/* Bar fills — grow from left */}
          <rect x="210" y="48" width="165" height="28" rx="4" fill="#DC2626" opacity="0.15" className="why-waste-bar-1" />
          <rect x="210" y="84" width="55" height="28" rx="4" fill="#CA8A04" opacity="0.2" className="why-waste-bar-2" />
          <rect x="210" y="120" width="33" height="28" rx="4" fill="#CA8A04" opacity="0.15" className="why-waste-bar-3" />
          <rect x="210" y="156" width="22" height="28" rx="4" fill="#16A34A" opacity="0.2" className="why-waste-bar-4" />

          {/* Bar labels */}
          <text x="218" y="67" fontSize="10" fontFamily="var(--font-body)" fill="#DC2626" fontWeight="600" className="why-waste-label-1">Not interested</text>
          <text x="218" y="103" fontSize="10" fontFamily="var(--font-body)" fill="#CA8A04" fontWeight="500" className="why-waste-label-2">Wrong fit</text>
          <text x="218" y="139" fontSize="10" fontFamily="var(--font-body)" fill="#CA8A04" fontWeight="500" className="why-waste-label-3">Maybe later</text>
          <text x="218" y="175" fontSize="10" fontFamily="var(--font-body)" fill="#16A34A" fontWeight="600" className="why-waste-label-4">Qualified</text>

          {/* Percentages on right */}
          <text x="414" y="67" fontSize="11" fontFamily="var(--font-mono)" fill="#DC2626" fontWeight="600" textAnchor="end" className="why-waste-pct-1">50%</text>
          <text x="414" y="103" fontSize="11" fontFamily="var(--font-mono)" fill="#CA8A04" fontWeight="500" textAnchor="end" className="why-waste-pct-2">15%</text>
          <text x="414" y="139" fontSize="11" fontFamily="var(--font-mono)" fill="#CA8A04" fontWeight="500" textAnchor="end" className="why-waste-pct-3">10%</text>
          <text x="414" y="175" fontSize="11" fontFamily="var(--font-mono)" fill="#16A34A" fontWeight="600" textAnchor="end" className="why-waste-pct-4">25%</text>
        </g>

        {/* 75% callout */}
        <g className="why-waste-callout">
          <rect x="210" y="196" width="220" height="28" rx="6" fill="#FEF2F2" stroke="#FECACA" strokeWidth="1" />
          <text x="230" y="214" fontSize="11" fontFamily="var(--font-body)" fill="#DC2626" fontWeight="600">75% of your calls go nowhere</text>
        </g>
      </svg>
    </div>
  );
}

/* ── Problem 3: Speed to Lead ── */
export function ProblemSpeedIllustration(): React.ReactElement {
  return (
    <div className="step-illustration" aria-hidden="true">
      <svg viewBox="0 0 480 240" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto">
        {/* Chart area */}
        <rect x="60" y="20" width="380" height="180" rx="0" fill="none" />

        {/* Y-axis label */}
        <text x="28" y="30" fontSize="9" fontFamily="var(--font-body)" fill="#94A3B8" fontWeight="500">100%</text>
        <text x="36" y="110" fontSize="9" fontFamily="var(--font-body)" fill="#94A3B8" fontWeight="500">50%</text>
        <text x="36" y="196" fontSize="9" fontFamily="var(--font-body)" fill="#94A3B8" fontWeight="500">0%</text>

        {/* Grid lines */}
        <line x1="60" y1="28" x2="440" y2="28" stroke="#F1F5F9" strokeWidth="1" />
        <line x1="60" y1="108" x2="440" y2="108" stroke="#F1F5F9" strokeWidth="1" />
        <line x1="60" y1="192" x2="440" y2="192" stroke="#E2E8F0" strokeWidth="1" />

        {/* X-axis labels */}
        <text x="72" y="210" fontSize="9" fontFamily="var(--font-mono)" fill="#94A3B8">0m</text>
        <text x="132" y="210" fontSize="9" fontFamily="var(--font-mono)" fill="#94A3B8">5m</text>
        <text x="202" y="210" fontSize="9" fontFamily="var(--font-mono)" fill="#94A3B8">10m</text>
        <text x="296" y="210" fontSize="9" fontFamily="var(--font-mono)" fill="#94A3B8">20m</text>
        <text x="396" y="210" fontSize="9" fontFamily="var(--font-mono)" fill="#94A3B8">30m</text>

        {/* Red zone after 5 minutes */}
        <rect x="140" y="28" width="300" height="164" fill="#DC2626" opacity="0.04" className="why-speed-red-zone" />
        <line x1="140" y1="28" x2="140" y2="192" stroke="#DC2626" strokeWidth="1" strokeDasharray="4 3" opacity="0.4" />
        <text x="146" y="40" fontSize="8" fontFamily="var(--font-body)" fill="#DC2626" fontWeight="500" opacity="0.7">Danger zone</text>

        {/* The drop line — draws itself */}
        <polyline
          points="72,32 140,36 210,140 300,170 400,182"
          fill="none"
          stroke="#DC2626"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="why-speed-drop-line"
        />

        {/* Green dot at 5-min mark */}
        <circle cx="140" cy="36" r="5" fill="#16A34A" className="why-speed-dot-ok" />

        {/* Red dot at 30-min mark */}
        <circle cx="400" cy="182" r="5" fill="#DC2626" className="why-speed-dot-bad" />

        {/* Label: 21x drop */}
        <g className="why-speed-label">
          <rect x="280" y="80" width="140" height="40" rx="6" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="1.5" />
          <text x="296" y="98" fontSize="10" fontFamily="var(--font-body)" fill="#0F172A" fontWeight="600">After 5 min: 10x drop</text>
          <text x="296" y="112" fontSize="9" fontFamily="var(--font-body)" fill="#94A3B8">After 30 min: 100x drop</text>
        </g>

        {/* Chart title */}
        <text x="240" y="230" fontSize="9" fontFamily="var(--font-body)" fill="#CBD5E1" fontWeight="500" textAnchor="middle">
          Probability of qualifying a lead vs. response time
        </text>
      </svg>
    </div>
  );
}

/* ── Solution 1: Lead Scoring ── */
export function SolutionScoreIllustration(): React.ReactElement {
  return (
    <div className="step-illustration" aria-hidden="true">
      <svg viewBox="0 0 480 240" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto">
        {/* Card frame */}
        <rect x="80" y="24" width="320" height="192" rx="8" fill="#18181B" stroke="#27272A" strokeWidth="1.5" />

        {/* Card header */}
        <rect x="80" y="24" width="320" height="36" rx="8" fill="#18181B" />
        <rect x="80" y="58" width="320" height="1" fill="#27272A" />
        <text x="100" y="48" fontSize="11" fontFamily="var(--font-body)" fill="#A1A1AA" fontWeight="500">New Lead</text>

        {/* Avatar placeholder */}
        <circle cx="120" cy="88" r="16" fill="#27272A" className="why-score-avatar" />
        <text x="114" y="93" fontSize="12" fontFamily="var(--font-body)" fill="#A1A1AA" fontWeight="600" className="why-score-avatar">JD</text>

        {/* Name and info */}
        <text x="146" y="84" fontSize="13" fontFamily="var(--font-body)" fill="#FFFFFF" fontWeight="600" className="why-score-name">John Davis</text>
        <text x="146" y="98" fontSize="10" fontFamily="var(--font-body)" fill="#A1A1AA" className="why-score-name">Kitchen remodel, $15k budget</text>

        {/* Score section */}
        <g className="why-score-number">
          <text x="340" y="92" fontSize="32" fontFamily="var(--font-display)" fill="#16A34A" fontWeight="700" textAnchor="middle">92</text>
        </g>

        {/* Hot badge */}
        <g className="why-score-badge">
          <rect x="312" y="100" width="52" height="20" rx="10" fill="#DC2626" opacity="0.15" />
          <text x="324" y="114" fontSize="10" fontFamily="var(--font-body)" fill="#DC2626" fontWeight="600">Hot</text>
          <circle cx="355" cy="110" r="3" fill="#DC2626" />
        </g>

        {/* Score bar */}
        <rect x="100" y="126" width="280" height="8" rx="4" fill="#27272A" />
        <rect x="100" y="126" width="258" height="8" rx="4" fill="#16A34A" className="why-score-bar-fill" />

        {/* Answer breakdown rows */}
        <g className="why-score-answers">
          <text x="100" y="156" fontSize="9" fontFamily="var(--font-body)" fill="#A1A1AA">Budget</text>
          <text x="200" y="156" fontSize="9" fontFamily="var(--font-mono)" fill="#FFFFFF" fontWeight="500">$10k-20k</text>

          <text x="100" y="174" fontSize="9" fontFamily="var(--font-body)" fill="#A1A1AA">Timeline</text>
          <text x="200" y="174" fontSize="9" fontFamily="var(--font-mono)" fill="#FFFFFF" fontWeight="500">This month</text>

          <text x="100" y="192" fontSize="9" fontFamily="var(--font-body)" fill="#A1A1AA">Service</text>
          <text x="200" y="192" fontSize="9" fontFamily="var(--font-mono)" fill="#FFFFFF" fontWeight="500">Kitchen remodel</text>

          {/* Separator lines */}
          <line x1="100" y1="161" x2="380" y2="161" stroke="#27272A" strokeWidth="0.5" />
          <line x1="100" y1="179" x2="380" y2="179" stroke="#27272A" strokeWidth="0.5" />
        </g>
      </svg>
    </div>
  );
}

/* ── Solution 2: Prioritized Call List ── */
export function SolutionCallListIllustration(): React.ReactElement {
  return (
    <div className="step-illustration" aria-hidden="true">
      <svg viewBox="0 0 480 240" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto">
        {/* List frame */}
        <rect x="40" y="16" width="400" height="208" rx="8" fill="#18181B" stroke="#27272A" strokeWidth="1.5" />
        <rect x="40" y="16" width="400" height="30" rx="8" fill="#18181B" />
        <rect x="40" y="44" width="400" height="1" fill="#27272A" />
        <text x="58" y="36" fontSize="10" fontFamily="var(--font-body)" fill="#A1A1AA" fontWeight="500">Call List</text>
        <text x="112" y="36" fontSize="10" fontFamily="var(--font-body)" fill="#71717A">sorted by score</text>

        {/* Lead row 1 — Hot (92) */}
        <g className="why-list-row-1">
          <rect x="52" y="54" width="376" height="50" rx="6" fill="#27272A" />
          <circle cx="78" cy="79" r="12" fill="#3F3F46" />
          <text x="72" y="83" fontSize="10" fontFamily="var(--font-body)" fill="#FFFFFF" fontWeight="600">JD</text>
          <text x="98" y="73" fontSize="12" fontFamily="var(--font-body)" fill="#FFFFFF" fontWeight="600">John Davis</text>
          <text x="98" y="88" fontSize="9" fontFamily="var(--font-body)" fill="#A1A1AA">Kitchen remodel, this month</text>
          {/* Score */}
          <text x="320" y="76" fontSize="18" fontFamily="var(--font-mono)" fill="#16A34A" fontWeight="700">92</text>
          {/* Hot badge */}
          <rect x="350" y="66" width="38" height="18" rx="9" fill="#DC2626" opacity="0.15" />
          <text x="358" y="79" fontSize="9" fontFamily="var(--font-body)" fill="#DC2626" fontWeight="600">Hot</text>
          {/* Alert icon pinging */}
          <g className="why-list-alert">
            <circle cx="406" cy="75" r="8" fill="#2563EB" opacity="0.15" />
            <rect x="402" y="69" width="8" height="6" rx="1.5" fill="#2563EB" />
            <polygon points="402,75 406,79 410,75" fill="#2563EB" />
            <circle cx="406" cy="75" r="12" fill="none" stroke="#2563EB" opacity="0.3" className="why-list-ping" />
          </g>
        </g>

        {/* Lead row 2 — Warm (67) */}
        <g className="why-list-row-2">
          <rect x="52" y="112" width="376" height="50" rx="6" fill="#1C1C1F" />
          <circle cx="78" cy="137" r="12" fill="#3F3F46" />
          <text x="72" y="141" fontSize="10" fontFamily="var(--font-body)" fill="#FFFFFF" fontWeight="600">SP</text>
          <text x="98" y="131" fontSize="12" fontFamily="var(--font-body)" fill="#FFFFFF" fontWeight="500">Sarah Park</text>
          <text x="98" y="146" fontSize="9" fontFamily="var(--font-body)" fill="#A1A1AA">Bathroom, next quarter</text>
          <text x="320" y="134" fontSize="18" fontFamily="var(--font-mono)" fill="#CA8A04" fontWeight="700">67</text>
          <rect x="350" y="124" width="46" height="18" rx="9" fill="#CA8A04" opacity="0.12" />
          <text x="356" y="137" fontSize="9" fontFamily="var(--font-body)" fill="#CA8A04" fontWeight="600">Warm</text>
        </g>

        {/* Lead row 3 — Cold (34) */}
        <g className="why-list-row-3">
          <rect x="52" y="170" width="376" height="50" rx="6" fill="#1C1C1F" />
          <circle cx="78" cy="195" r="12" fill="#3F3F46" />
          <text x="72" y="199" fontSize="10" fontFamily="var(--font-body)" fill="#FFFFFF" fontWeight="600">MR</text>
          <text x="98" y="189" fontSize="12" fontFamily="var(--font-body)" fill="#FFFFFF" fontWeight="500">Mike Ross</text>
          <text x="98" y="204" fontSize="9" fontFamily="var(--font-body)" fill="#A1A1AA">General inquiry, no timeline</text>
          <text x="320" y="192" fontSize="18" fontFamily="var(--font-mono)" fill="#94A3B8" fontWeight="700">34</text>
          <rect x="350" y="182" width="42" height="18" rx="9" fill="#94A3B8" opacity="0.12" />
          <text x="358" y="195" fontSize="9" fontFamily="var(--font-body)" fill="#94A3B8" fontWeight="600">Cold</text>
        </g>
      </svg>
    </div>
  );
}

/* ── Solution 3: Automated Nurture ── */
export function SolutionNurtureIllustration(): React.ReactElement {
  return (
    <div className="step-illustration" aria-hidden="true">
      <svg viewBox="0 0 480 240" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto">
        {/* Timeline line */}
        <line x1="60" y1="120" x2="420" y2="120" stroke="#27272A" strokeWidth="2" />

        {/* Step 1: Day 1 email */}
        <g className="why-nurture-step-1">
          <circle cx="100" cy="120" r="16" fill="#18181B" stroke="#27272A" strokeWidth="2" />
          {/* Email icon */}
          <rect x="91" y="114" width="18" height="12" rx="2" fill="none" stroke="#94A3B8" strokeWidth="1.5" />
          <polyline points="91,114 100,121 109,114" fill="none" stroke="#94A3B8" strokeWidth="1.5" strokeLinecap="round" />
          <text x="100" y="155" fontSize="9" fontFamily="var(--font-body)" fill="#A1A1AA" fontWeight="500" textAnchor="middle">Day 1</text>
          <text x="100" y="168" fontSize="8" fontFamily="var(--font-body)" fill="#71717A" textAnchor="middle">Welcome</text>
        </g>

        {/* Connector 1 — dashes animate */}
        <line x1="116" y1="120" x2="224" y2="120" stroke="#27272A" strokeWidth="2" strokeDasharray="6 4" className="why-nurture-conn-1" />

        {/* Step 2: Day 3 follow-up */}
        <g className="why-nurture-step-2">
          <circle cx="240" cy="120" r="16" fill="#18181B" stroke="#27272A" strokeWidth="2" />
          {/* Follow-up icon */}
          <rect x="231" y="114" width="18" height="12" rx="2" fill="none" stroke="#CA8A04" strokeWidth="1.5" />
          <polyline points="231,114 240,121 249,114" fill="none" stroke="#CA8A04" strokeWidth="1.5" strokeLinecap="round" />
          <text x="240" y="155" fontSize="9" fontFamily="var(--font-body)" fill="#A1A1AA" fontWeight="500" textAnchor="middle">Day 3</text>
          <text x="240" y="168" fontSize="8" fontFamily="var(--font-body)" fill="#71717A" textAnchor="middle">Follow-up</text>
        </g>

        {/* Connector 2 */}
        <line x1="256" y1="120" x2="364" y2="120" stroke="#27272A" strokeWidth="2" strokeDasharray="6 4" className="why-nurture-conn-2" />

        {/* Step 3: Day 7 case study */}
        <g className="why-nurture-step-3">
          <circle cx="380" cy="120" r="16" fill="#18181B" stroke="#27272A" strokeWidth="2" />
          {/* Star / value icon */}
          <rect x="371" y="114" width="18" height="12" rx="2" fill="none" stroke="#16A34A" strokeWidth="1.5" />
          <polyline points="371,114 380,121 389,114" fill="none" stroke="#16A34A" strokeWidth="1.5" strokeLinecap="round" />
          <text x="380" y="155" fontSize="9" fontFamily="var(--font-body)" fill="#A1A1AA" fontWeight="500" textAnchor="middle">Day 7</text>
          <text x="380" y="168" fontSize="8" fontFamily="var(--font-body)" fill="#71717A" textAnchor="middle">Case study</text>
        </g>

        {/* Badge transition: Cold -> Warm above the timeline */}
        <g className="why-nurture-badge-cold">
          <rect x="60" y="52" width="50" height="22" rx="11" fill="#94A3B8" opacity="0.12" />
          <text x="72" y="67" fontSize="10" fontFamily="var(--font-body)" fill="#94A3B8" fontWeight="600">Cold</text>
        </g>

        {/* Arrow from cold to warm */}
        <g className="why-nurture-arrow">
          <line x1="118" y1="63" x2="190" y2="63" stroke="#27272A" strokeWidth="1.5" strokeDasharray="4 3" />
          <polygon points="190,59 198,63 190,67" fill="#27272A" />
        </g>

        <g className="why-nurture-badge-warm">
          <rect x="206" y="52" width="60" height="22" rx="11" fill="#CA8A04" opacity="0.15" />
          <text x="218" y="67" fontSize="10" fontFamily="var(--font-body)" fill="#CA8A04" fontWeight="600">Warm</text>
        </g>

        {/* Arrow from warm to hot */}
        <g className="why-nurture-arrow-2">
          <line x1="274" y1="63" x2="338" y2="63" stroke="#27272A" strokeWidth="1.5" strokeDasharray="4 3" />
          <polygon points="338,59 346,63 338,67" fill="#27272A" />
        </g>

        <g className="why-nurture-badge-hot">
          <rect x="354" y="52" width="50" height="22" rx="11" fill="#DC2626" opacity="0.15" />
          <text x="368" y="67" fontSize="10" fontFamily="var(--font-body)" fill="#DC2626" fontWeight="600">Hot</text>
        </g>

        {/* Bottom label */}
        <g className="why-nurture-label">
          <rect x="140" y="192" width="200" height="28" rx="6" fill="#18181B" stroke="#27272A" strokeWidth="1" />
          <text x="240" y="210" fontSize="10" fontFamily="var(--font-body)" fill="#A1A1AA" fontWeight="500" textAnchor="middle">Automated. No manual follow-up.</text>
        </g>
      </svg>
    </div>
  );
}
