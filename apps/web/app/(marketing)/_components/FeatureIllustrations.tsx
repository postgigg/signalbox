/**
 * Hand-crafted SVG illustrations with CSS animations for the eight
 * "What you get" features. Each depicts the literal feature.
 *
 * 1. Lead scoring — a semicircular gauge that sweeps to 87, with tier labels
 * 2. Instant alerts — an email notification card sliding up with lead details
 * 3. Conversion analytics — a funnel with shrinking bars and a drop-off marker
 * 4. Custom branding — a widget shell with color swatches that swap in
 * 5. Lead routing — leads flow down paths to assigned team member avatars
 * 6. A/B testing — side-by-side variants with a winner badge
 * 7. Integrations — webhook chain connecting service icons
 * 8. Shared analytics — a dashboard card behind a share/lock overlay
 *
 * CSS-only animations. No libraries. Respects prefers-reduced-motion.
 */

export function LeadScoringIllustration(): React.ReactElement {
  return (
    <div className="step-illustration" aria-hidden="true">
      <svg
        viewBox="0 0 280 140"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-auto"
      >
        {/* Gauge background arc */}
        <path
          d="M56 98 A64 64 0 0 1 184 98"
          stroke="#F1F5F9"
          strokeWidth="10"
          strokeLinecap="round"
          fill="none"
        />

        {/* Gauge fill arc — sweeps in */}
        <path
          d="M56 98 A64 64 0 0 1 184 98"
          stroke="#2563EB"
          strokeWidth="10"
          strokeLinecap="round"
          fill="none"
          strokeDasharray="201"
          strokeDashoffset="201"
          className="feat-score-arc"
        />

        {/* Needle — rotates to position */}
        <g className="feat-score-needle" style={{ transformOrigin: '120px 98px' }}>
          <line x1="120" y1="98" x2="120" y2="46" stroke="#0F172A" strokeWidth="2" strokeLinecap="round" />
          <circle cx="120" cy="98" r="3" fill="#0F172A" />
        </g>

        {/* Score number — below gauge, clear of needle */}
        <g className="feat-score-number">
          <text
            x="120"
            y="120"
            fontSize="22"
            fontFamily="var(--font-mono)"
            fill="#0F172A"
            fontWeight="700"
            textAnchor="middle"
          >
            87
          </text>
          <text
            x="120"
            y="134"
            fontSize="9"
            fontFamily="var(--font-body)"
            fill="#94A3B8"
            textAnchor="middle"
          >
            out of 100
          </text>
        </g>

        {/* Tier labels on the right */}
        <g className="feat-score-tiers">
          <rect x="200" y="22" width="64" height="22" rx="6" fill="#FEF2F2" />
          <circle cx="212" cy="33" r="4" fill="#DC2626" />
          <text x="220" y="37" fontSize="8" fontFamily="var(--font-body)" fill="#DC2626" fontWeight="600">Hot 70+</text>

          <rect x="200" y="50" width="68" height="22" rx="6" fill="#FEFCE8" />
          <circle cx="212" cy="61" r="4" fill="#CA8A04" />
          <text x="220" y="65" fontSize="8" fontFamily="var(--font-body)" fill="#CA8A04" fontWeight="600">Warm 40+</text>

          <rect x="200" y="78" width="64" height="22" rx="6" fill="#F8FAFC" />
          <circle cx="212" cy="89" r="4" fill="#94A3B8" />
          <text x="220" y="93" fontSize="8" fontFamily="var(--font-body)" fill="#94A3B8" fontWeight="600">Cold 0-39</text>
        </g>
      </svg>
    </div>
  );
}

export function InstantAlertsIllustration(): React.ReactElement {
  return (
    <div className="step-illustration" aria-hidden="true">
      <svg
        viewBox="0 0 280 140"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-auto"
      >
        {/* Phone/inbox outline */}
        <rect x="24" y="10" width="120" height="120" rx="8" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="1.5" />
        <rect x="24" y="10" width="120" height="24" rx="8" fill="#F8FAFC" />
        <rect x="24" y="32" width="120" height="1" fill="#E2E8F0" />
        <text x="36" y="26" fontSize="8" fontFamily="var(--font-body)" fill="#64748B" fontWeight="500">Inbox</text>
        <circle cx="130" cy="22" r="3" fill="#E2E8F0" />

        {/* Existing email rows (static, faded) */}
        <rect x="32" y="40" width="104" height="20" rx="3" fill="#FFFFFF" />
        <rect x="38" y="45" width="48" height="4" rx="2" fill="#E2E8F0" />
        <rect x="38" y="53" width="72" height="3" rx="1.5" fill="#F1F5F9" />

        <rect x="32" y="64" width="104" height="20" rx="3" fill="#FFFFFF" />
        <rect x="38" y="69" width="40" height="4" rx="2" fill="#E2E8F0" />
        <rect x="38" y="77" width="64" height="3" rx="1.5" fill="#F1F5F9" />

        {/* New alert email — slides up from below */}
        <g className="feat-alert-email">
          <rect x="32" y="88" width="104" height="36" rx="4" fill="#EFF6FF" stroke="#2563EB" strokeWidth="1" />
          {/* Unread dot */}
          <circle cx="41" cy="98" r="3" fill="#2563EB" />
          {/* Subject line */}
          <text x="48" y="100" fontSize="7" fontFamily="var(--font-body)" fill="#0F172A" fontWeight="600">Hot lead: Sarah M.</text>
          {/* Preview */}
          <text x="38" y="112" fontSize="6.5" fontFamily="var(--font-body)" fill="#64748B">Score 92 / Budget: $10k+ / Urgent</text>
          {/* Time */}
          <text x="112" y="100" fontSize="6" fontFamily="var(--font-body)" fill="#2563EB" fontWeight="500">now</text>
        </g>

        {/* Expanded alert card on the right — pops in */}
        <g className="feat-alert-card">
          <rect x="160" y="16" width="108" height="108" rx="8" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="1.5" />

          {/* Header */}
          <rect x="160" y="16" width="108" height="26" rx="8" fill="#FEF2F2" />
          <rect x="160" y="38" width="108" height="1" fill="#E2E8F0" />
          <rect x="170" y="24" width="8" height="12" rx="4" fill="#DC2626" />
          <text x="182" y="33" fontSize="8" fontFamily="var(--font-body)" fill="#DC2626" fontWeight="600">Hot Lead Alert</text>

          {/* Score badge */}
          <rect x="170" y="48" width="32" height="18" rx="6" fill="#FEF2F2" />
          <text x="178" y="60" fontSize="10" fontFamily="var(--font-mono)" fill="#DC2626" fontWeight="700">92</text>

          {/* Detail lines */}
          <text x="210" y="55" fontSize="7" fontFamily="var(--font-body)" fill="#64748B">Sarah Mitchell</text>
          <text x="210" y="63" fontSize="6" fontFamily="var(--font-body)" fill="#94A3B8">sarah@acme.co</text>

          {/* Answer summary */}
          <rect x="170" y="74" width="88" height="4" rx="2" fill="#E2E8F0" />
          <rect x="170" y="82" width="72" height="4" rx="2" fill="#F1F5F9" />
          <rect x="170" y="90" width="80" height="4" rx="2" fill="#F1F5F9" />

          {/* CTA button */}
          <rect x="170" y="102" width="52" height="16" rx="4" fill="#0F172A" />
          <text x="181" y="113" fontSize="7" fontFamily="var(--font-body)" fill="#FFFFFF" fontWeight="500">Respond</text>
        </g>

        {/* Timer: "3s ago" badge */}
        <g className="feat-alert-timer">
          <rect x="224" y="102" width="34" height="16" rx="4" fill="#EFF6FF" />
          <text x="231" y="113" fontSize="7" fontFamily="var(--font-mono)" fill="#2563EB" fontWeight="500">3s</text>
        </g>
      </svg>
    </div>
  );
}

export function ConversionAnalyticsIllustration(): React.ReactElement {
  return (
    <div className="step-illustration" aria-hidden="true">
      <svg
        viewBox="0 0 280 140"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-auto"
      >
        {/* Chart frame */}
        <rect x="16" y="8" width="248" height="124" rx="8" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="1.5" />
        <text x="28" y="26" fontSize="9" fontFamily="var(--font-body)" fill="#64748B" fontWeight="500">Conversion funnel</text>

        {/* Funnel bars — each grows from left, each narrower */}
        {/* Impressions */}
        <text x="28" y="38" fontSize="6.5" fontFamily="var(--font-body)" fill="#94A3B8">Impressions</text>
        <g className="feat-funnel-bar-1">
          <rect x="28" y="40" width="140" height="14" rx="3" fill="#2563EB" opacity="0.15" />
          <rect x="28" y="40" width="140" height="14" rx="3" fill="#2563EB" opacity="0.25" className="feat-funnel-fill-1" />
          <text x="174" y="51" fontSize="8" fontFamily="var(--font-mono)" fill="#0F172A" fontWeight="600">2,847</text>
        </g>

        {/* Widget opens */}
        <text x="28" y="64" fontSize="6.5" fontFamily="var(--font-body)" fill="#94A3B8">Widget opens</text>
        <g className="feat-funnel-bar-2">
          <rect x="28" y="66" width="140" height="14" rx="3" fill="#2563EB" opacity="0.15" />
          <rect x="28" y="66" width="98" height="14" rx="3" fill="#2563EB" opacity="0.4" className="feat-funnel-fill-2" />
          <text x="174" y="77" fontSize="8" fontFamily="var(--font-mono)" fill="#0F172A" fontWeight="600">1,993</text>
        </g>

        {/* Completions */}
        <text x="28" y="90" fontSize="6.5" fontFamily="var(--font-body)" fill="#94A3B8">Completions</text>
        <g className="feat-funnel-bar-3">
          <rect x="28" y="92" width="140" height="14" rx="3" fill="#2563EB" opacity="0.15" />
          <rect x="28" y="92" width="38" height="14" rx="3" fill="#2563EB" opacity="0.65" className="feat-funnel-fill-3" />
          <text x="174" y="103" fontSize="8" fontFamily="var(--font-mono)" fill="#0F172A" fontWeight="600">541</text>
        </g>

        {/* Drop-off badges — right column, clearly separated */}
        <g className="feat-funnel-dropoff">
          <rect x="218" y="44" width="36" height="14" rx="7" fill="#FEFCE8" />
          <text x="228" y="54" fontSize="7" fontFamily="var(--font-mono)" fill="#CA8A04" fontWeight="600" textAnchor="middle">-30%</text>

          <rect x="218" y="70" width="36" height="14" rx="7" fill="#FEF2F2" />
          <text x="228" y="80" fontSize="7" fontFamily="var(--font-mono)" fill="#DC2626" fontWeight="600" textAnchor="middle">-73%</text>
        </g>

        {/* Conversion rate badge — bottom right */}
        <g className="feat-funnel-rate">
          <rect x="186" y="110" width="68" height="16" rx="6" fill="#F0FDF4" />
          <text x="194" y="121" fontSize="8" fontFamily="var(--font-mono)" fill="#16A34A" fontWeight="600">19% conv.</text>
        </g>
      </svg>
    </div>
  );
}

export function CustomBrandingIllustration(): React.ReactElement {
  return (
    <div className="step-illustration" aria-hidden="true">
      <svg
        viewBox="0 0 280 140"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-auto"
      >
        {/* Website background mockup */}
        <rect x="16" y="8" width="152" height="124" rx="8" fill="#FAFAFA" stroke="#E2E8F0" strokeWidth="1.5" />
        {/* Nav bar */}
        <rect x="16" y="8" width="152" height="20" rx="8" fill="#FFFFFF" />
        <rect x="16" y="26" width="152" height="1" fill="#E2E8F0" />
        <rect x="26" y="14" width="36" height="8" rx="2" fill="#E2E8F0" />
        <rect x="72" y="15" width="20" height="6" rx="2" fill="#F1F5F9" />
        <rect x="98" y="15" width="20" height="6" rx="2" fill="#F1F5F9" />
        <rect x="124" y="15" width="20" height="6" rx="2" fill="#F1F5F9" />

        {/* Page content lines */}
        <rect x="26" y="36" width="80" height="6" rx="2" fill="#E2E8F0" />
        <rect x="26" y="48" width="120" height="4" rx="2" fill="#F1F5F9" />
        <rect x="26" y="56" width="100" height="4" rx="2" fill="#F1F5F9" />

        {/* Widget preview embedded on the page — the widget shell */}
        <g className="feat-brand-widget">
          <rect x="26" y="70" width="132" height="54" rx="6" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="1.5" />

          {/* Widget header bar — color changes */}
          <rect x="26" y="70" width="132" height="18" rx="6" className="feat-brand-header" fill="#0F172A" />
          <rect x="26" y="82" width="132" height="6" fill="#0F172A" className="feat-brand-header" />
          <text x="36" y="82" fontSize="7" fontFamily="var(--font-body)" fill="#FFFFFF" fontWeight="500">What service do you need?</text>

          {/* Option buttons — color matches */}
          <rect x="34" y="94" width="54" height="14" rx="4" fill="#F8FAFC" stroke="#E2E8F0" strokeWidth="1" />
          <text x="46" y="104" fontSize="6.5" fontFamily="var(--font-body)" fill="#0F172A">Plumbing</text>

          <rect x="96" y="94" width="54" height="14" rx="4" className="feat-brand-btn" fill="#EFF6FF" stroke="#2563EB" strokeWidth="1" />
          <text x="108" y="104" fontSize="6.5" fontFamily="var(--font-body)" fill="#2563EB" className="feat-brand-btn-text">Electrical</text>

          {/* Progress dots */}
          <circle cx="72" cy="118" r="2" className="feat-brand-dot" fill="#2563EB" />
          <circle cx="80" cy="118" r="2" fill="#E2E8F0" />
          <circle cx="88" cy="118" r="2" fill="#E2E8F0" />
        </g>

        {/* Customization panel on the right */}
        <g className="feat-brand-panel">
          <rect x="184" y="8" width="80" height="124" rx="8" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="1.5" />
          <text x="196" y="26" fontSize="8" fontFamily="var(--font-body)" fill="#64748B" fontWeight="500">Theme</text>

          {/* Color swatches */}
          <text x="196" y="42" fontSize="6.5" fontFamily="var(--font-body)" fill="#94A3B8">Primary</text>
          <g className="feat-brand-swatch-row">
            <rect x="196" y="46" width="14" height="14" rx="3" fill="#0F172A" stroke="#CBD5E1" strokeWidth="1" />
            <rect x="214" y="46" width="14" height="14" rx="3" fill="#2563EB" stroke="#CBD5E1" strokeWidth="1" />
            <rect x="232" y="46" width="14" height="14" rx="3" fill="#16A34A" stroke="#CBD5E1" strokeWidth="1" />
            {/* Active indicator */}
            <rect x="196" y="46" width="14" height="14" rx="3" fill="none" stroke="#0F172A" strokeWidth="2" className="feat-brand-active-1" />
          </g>

          {/* Font selector */}
          <text x="196" y="76" fontSize="6.5" fontFamily="var(--font-body)" fill="#94A3B8">Font</text>
          <rect x="196" y="80" width="56" height="16" rx="4" fill="#F8FAFC" stroke="#E2E8F0" strokeWidth="1" />
          <text x="204" y="91" fontSize="7" fontFamily="var(--font-body)" fill="#0F172A">Inter</text>
          <path d="M244 87 L247 90 L250 87" stroke="#94A3B8" strokeWidth="1" strokeLinecap="round" />

          {/* Radius selector */}
          <text x="196" y="110" fontSize="6.5" fontFamily="var(--font-body)" fill="#94A3B8">Corners</text>
          <g className="feat-brand-radius">
            <rect x="196" y="114" width="18" height="12" rx="2" fill="#F8FAFC" stroke="#0F172A" strokeWidth="1.5" />
            <text x="201" y="123" fontSize="6" fontFamily="var(--font-mono)" fill="#0F172A">6px</text>
            <rect x="218" y="114" width="18" height="12" rx="6" fill="#F8FAFC" stroke="#E2E8F0" strokeWidth="1" />
            <text x="221" y="123" fontSize="6" fontFamily="var(--font-mono)" fill="#94A3B8">full</text>
          </g>
        </g>

        {/* "Your brand" label that pops in */}
        <g className="feat-brand-label">
          <rect x="62" y="126" width="60" height="14" rx="7" fill="#0F172A" />
          <text x="72" y="136" fontSize="7" fontFamily="var(--font-body)" fill="#FFFFFF" fontWeight="500">Your brand</text>
        </g>
      </svg>
    </div>
  );
}

/* ── Feature 5: Lead Routing ── */
export function LeadRoutingIllustration(): React.ReactElement {
  return (
    <div className="step-illustration" aria-hidden="true">
      <svg
        viewBox="0 0 280 140"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-auto"
      >
        {/* Card frame */}
        <rect x="16" y="8" width="248" height="124" rx="8" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="1.5" />
        <text x="28" y="26" fontSize="9" fontFamily="var(--font-body)" fill="#64748B" fontWeight="500">Auto-assign</text>

        {/* Incoming lead on left */}
        <g className="feat-route-lead">
          <rect x="28" y="38" width="56" height="44" rx="6" fill="#FEF2F2" stroke="#FECACA" strokeWidth="1" />
          <circle cx="56" cy="52" r="8" fill="#DC2626" opacity="0.15" />
          <text x="52" y="55" fontSize="8" fontFamily="var(--font-body)" fill="#DC2626" fontWeight="700">S</text>
          <text x="38" y="70" fontSize="7" fontFamily="var(--font-body)" fill="#0F172A" fontWeight="500">Sarah M.</text>
          <rect x="36" y="74" width="22" height="5" rx="2.5" fill="#DC2626" opacity="0.2" />
          <text x="39" y="78" fontSize="4.5" fontFamily="var(--font-body)" fill="#DC2626" fontWeight="600">HOT</text>
        </g>

        {/* Routing arrows — branch out with flowing dashes */}
        <g className="feat-route-arrows">
          {/* Arrow to top member (active — dashes flow) */}
          <path d="M84 50 L120 50 L140 36" stroke="#2563EB" strokeWidth="1.5" strokeLinecap="round" fill="none" strokeDasharray="6 3" className="feat-route-dash-active" />
          <circle cx="140" cy="36" r="2" fill="#2563EB" />
          {/* Arrow to middle member (inactive — slow flow) */}
          <path d="M84 56 L120 56 L140 66" stroke="#CBD5E1" strokeWidth="1.5" strokeLinecap="round" fill="none" strokeDasharray="4 3" className="feat-route-dash-idle-1" />
          {/* Arrow to bottom member (inactive — slow flow) */}
          <path d="M84 62 L120 62 L140 96" stroke="#CBD5E1" strokeWidth="1.5" strokeLinecap="round" fill="none" strokeDasharray="4 3" className="feat-route-dash-idle-2" />
        </g>

        {/* Rule badge in center */}
        <g className="feat-route-rule">
          <rect x="96" y="84" width="48" height="16" rx="4" fill="#EFF6FF" stroke="#2563EB" strokeWidth="1" />
          <text x="104" y="95" fontSize="6" fontFamily="var(--font-body)" fill="#2563EB" fontWeight="600">Hot → Sarah</text>
        </g>

        {/* Team members on right */}
        <g className="feat-route-member-1">
          <rect x="152" y="24" width="100" height="24" rx="6" fill="#EFF6FF" stroke="#2563EB" strokeWidth="1.5" />
          <circle cx="166" cy="36" r="7" fill="#2563EB" opacity="0.15" />
          <text x="163" y="39" fontSize="7" fontFamily="var(--font-body)" fill="#2563EB" fontWeight="600">S</text>
          <text x="178" y="34" fontSize="7" fontFamily="var(--font-body)" fill="#0F172A" fontWeight="500">Sarah K.</text>
          <text x="178" y="42" fontSize="5.5" fontFamily="var(--font-body)" fill="#2563EB">Assigned</text>
        </g>
        <g className="feat-route-member-2">
          <rect x="152" y="56" width="100" height="24" rx="6" fill="#F8FAFC" stroke="#E2E8F0" strokeWidth="1" />
          <circle cx="166" cy="68" r="7" fill="#E2E8F0" />
          <text x="163" y="71" fontSize="7" fontFamily="var(--font-body)" fill="#94A3B8" fontWeight="600">J</text>
          <text x="178" y="66" fontSize="7" fontFamily="var(--font-body)" fill="#64748B">James R.</text>
          <text x="178" y="74" fontSize="5.5" fontFamily="var(--font-body)" fill="#94A3B8">Warm leads</text>
        </g>
        <g className="feat-route-member-3">
          <rect x="152" y="88" width="100" height="24" rx="6" fill="#F8FAFC" stroke="#E2E8F0" strokeWidth="1" />
          <circle cx="166" cy="100" r="7" fill="#E2E8F0" />
          <text x="163" y="103" fontSize="7" fontFamily="var(--font-body)" fill="#94A3B8" fontWeight="600">A</text>
          <text x="178" y="98" fontSize="7" fontFamily="var(--font-body)" fill="#64748B">Amy T.</text>
          <text x="178" y="106" fontSize="5.5" fontFamily="var(--font-body)" fill="#94A3B8">Cold leads</text>
        </g>
      </svg>
    </div>
  );
}

/* ── Feature 6: A/B Testing ── */
export function AbTestingIllustration(): React.ReactElement {
  return (
    <div className="step-illustration" aria-hidden="true">
      <svg
        viewBox="0 0 280 140"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-auto"
      >
        {/* Card frame */}
        <rect x="16" y="8" width="248" height="124" rx="8" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="1.5" />
        <text x="28" y="26" fontSize="9" fontFamily="var(--font-body)" fill="#64748B" fontWeight="500">Split test results</text>

        {/* Variant A card */}
        <g className="feat-ab-variant-a">
          <rect x="28" y="34" width="108" height="56" rx="6" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="1.5" />
          <rect x="28" y="34" width="108" height="16" rx="6" fill="#F8FAFC" />
          <rect x="28" y="48" width="108" height="1" fill="#E2E8F0" />
          <text x="38" y="45" fontSize="7" fontFamily="var(--font-body)" fill="#0F172A" fontWeight="600">Variant A</text>
          <text x="112" y="45" fontSize="7" fontFamily="var(--font-mono)" fill="#64748B">50%</text>

          {/* Bar chart */}
          <rect x="38" y="58" width="88" height="6" rx="3" fill="#F1F5F9" />
          <rect x="38" y="58" width="52" height="6" rx="3" fill="#2563EB" opacity="0.4" className="feat-ab-bar-a" />
          <text x="38" y="74" fontSize="7" fontFamily="var(--font-mono)" fill="#64748B">12.4%</text>
          <text x="68" y="74" fontSize="6" fontFamily="var(--font-body)" fill="#94A3B8">conversion</text>

          <text x="38" y="84" fontSize="6.5" fontFamily="var(--font-body)" fill="#94A3B8">847 impressions</text>
        </g>

        {/* Variant B card — winner */}
        <g className="feat-ab-variant-b">
          <rect x="144" y="34" width="108" height="56" rx="6" fill="#FFFFFF" stroke="#16A34A" strokeWidth="1.5" />
          <rect x="144" y="34" width="108" height="16" rx="6" fill="#F0FDF4" />
          <rect x="144" y="48" width="108" height="1" fill="#DCFCE7" />
          <text x="154" y="45" fontSize="7" fontFamily="var(--font-body)" fill="#0F172A" fontWeight="600">Variant B</text>
          <text x="228" y="45" fontSize="7" fontFamily="var(--font-mono)" fill="#64748B">50%</text>

          {/* Bar chart — longer */}
          <rect x="154" y="58" width="88" height="6" rx="3" fill="#F1F5F9" />
          <rect x="154" y="58" width="72" height="6" rx="3" fill="#16A34A" opacity="0.5" className="feat-ab-bar-b" />
          <text x="154" y="74" fontSize="7" fontFamily="var(--font-mono)" fill="#16A34A" fontWeight="600">18.7%</text>
          <text x="184" y="74" fontSize="6" fontFamily="var(--font-body)" fill="#94A3B8">conversion</text>

          <text x="154" y="84" fontSize="6.5" fontFamily="var(--font-body)" fill="#94A3B8">831 impressions</text>
        </g>

        {/* VS divider */}
        <g className="feat-ab-vs">
          <circle cx="140" cy="62" r="10" fill="#F8FAFC" stroke="#E2E8F0" strokeWidth="1" />
          <text x="134" y="65" fontSize="7" fontFamily="var(--font-body)" fill="#94A3B8" fontWeight="600">vs</text>
        </g>

        {/* Significance badge — pops in */}
        <g className="feat-ab-winner">
          <rect x="80" y="98" width="120" height="22" rx="6" fill="#F0FDF4" stroke="#16A34A" strokeWidth="1" />
          <circle cx="96" cy="109" r="5" fill="#16A34A" />
          <path d="M93.5 109 L95 110.5 L98.5 107" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          <text x="106" y="112" fontSize="7" fontFamily="var(--font-body)" fill="#16A34A" fontWeight="600">B wins (p=0.02)</text>
        </g>
      </svg>
    </div>
  );
}

/* ── Feature 7: Drip Sequences ── */
export function DripSequencesIllustration(): React.ReactElement {
  return (
    <div className="step-illustration" aria-hidden="true">
      <svg
        viewBox="0 0 280 140"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-auto"
      >
        {/* Card frame */}
        <rect x="16" y="8" width="248" height="124" rx="8" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="1.5" />
        <text x="28" y="26" fontSize="9" fontFamily="var(--font-body)" fill="#64748B" fontWeight="500">Drip sequence</text>

        {/* Lead card on the left */}
        <g className="feat-drip-lead">
          <rect x="28" y="36" width="56" height="36" rx="6" fill="#FFFBEB" stroke="#FDE68A" strokeWidth="1" />
          <circle cx="56" cy="48" r="7" fill="#CA8A04" opacity="0.15" />
          <text x="53" y="51" fontSize="7" fontFamily="var(--font-body)" fill="#CA8A04" fontWeight="700">M</text>
          <text x="38" y="64" fontSize="6.5" fontFamily="var(--font-body)" fill="#0F172A" fontWeight="500">Mark T.</text>
          <rect x="36" y="56" width="26" height="5" rx="2.5" fill="#CA8A04" opacity="0.2" />
          <text x="39" y="60" fontSize="4.5" fontFamily="var(--font-body)" fill="#CA8A04" fontWeight="600">WARM</text>
        </g>

        {/* Arrow from lead to sequence */}
        <g className="feat-drip-arrow">
          <path d="M84 54 L104 54" stroke="#2563EB" strokeWidth="1.5" strokeLinecap="round" strokeDasharray="4 3" className="feat-drip-dash" />
          <polygon points="104,50 112,54 104,58" fill="#2563EB" />
        </g>

        {/* Step 1 — email envelope with "24h" */}
        <g className="feat-drip-step-1">
          <rect x="116" y="32" width="60" height="20" rx="4" fill="#EFF6FF" stroke="#2563EB" strokeWidth="1" />
          {/* Envelope icon */}
          <rect x="122" y="38" width="10" height="8" rx="1.5" fill="none" stroke="#2563EB" strokeWidth="1" />
          <path d="M122 38 L127 42 L132 38" fill="none" stroke="#2563EB" strokeWidth="0.8" />
          <text x="136" y="45" fontSize="7" fontFamily="var(--font-body)" fill="#2563EB" fontWeight="600">24h</text>
          <text x="156" y="45" fontSize="6" fontFamily="var(--font-body)" fill="#64748B">Step 1</text>
        </g>

        {/* Connector line step 1 to 2 */}
        <g className="feat-drip-conn-1">
          <line x1="146" y1="52" x2="146" y2="60" stroke="#E2E8F0" strokeWidth="1.5" />
        </g>

        {/* Step 2 — email with "72h" */}
        <g className="feat-drip-step-2">
          <rect x="116" y="60" width="60" height="20" rx="4" fill="#EFF6FF" stroke="#2563EB" strokeWidth="1" />
          <rect x="122" y="66" width="10" height="8" rx="1.5" fill="none" stroke="#2563EB" strokeWidth="1" />
          <path d="M122 66 L127 70 L132 66" fill="none" stroke="#2563EB" strokeWidth="0.8" />
          <text x="136" y="73" fontSize="7" fontFamily="var(--font-body)" fill="#2563EB" fontWeight="600">72h</text>
          <text x="156" y="73" fontSize="6" fontFamily="var(--font-body)" fill="#64748B">Step 2</text>
        </g>

        {/* Connector line step 2 to 3 */}
        <g className="feat-drip-conn-2">
          <line x1="146" y1="80" x2="146" y2="88" stroke="#E2E8F0" strokeWidth="1.5" />
        </g>

        {/* Step 3 — email with "7d" */}
        <g className="feat-drip-step-3">
          <rect x="116" y="88" width="60" height="20" rx="4" fill="#EFF6FF" stroke="#2563EB" strokeWidth="1" />
          <rect x="122" y="94" width="10" height="8" rx="1.5" fill="none" stroke="#2563EB" strokeWidth="1" />
          <path d="M122 94 L127 98 L132 94" fill="none" stroke="#2563EB" strokeWidth="0.8" />
          <text x="136" y="101" fontSize="7" fontFamily="var(--font-body)" fill="#2563EB" fontWeight="600">7d</text>
          <text x="152" y="101" fontSize="6" fontFamily="var(--font-body)" fill="#64748B">Step 3</text>
        </g>

        {/* Status panel on right */}
        <g className="feat-drip-status">
          <rect x="192" y="32" width="60" height="22" rx="4" fill="#F0FDF4" stroke="#BBF7D0" strokeWidth="1" />
          <circle cx="204" cy="43" r="3" fill="#16A34A" />
          <text x="210" y="46" fontSize="6.5" fontFamily="var(--font-body)" fill="#16A34A" fontWeight="600">Sent</text>

          <rect x="192" y="60" width="60" height="22" rx="4" fill="#F0FDF4" stroke="#BBF7D0" strokeWidth="1" />
          <circle cx="204" cy="71" r="3" fill="#16A34A" />
          <text x="210" y="74" fontSize="6.5" fontFamily="var(--font-body)" fill="#16A34A" fontWeight="600">Sent</text>

          <rect x="192" y="88" width="60" height="22" rx="4" fill="#F8FAFC" stroke="#E2E8F0" strokeWidth="1" />
          <circle cx="204" cy="99" r="3" fill="#94A3B8" />
          <text x="210" y="102" fontSize="6.5" fontFamily="var(--font-body)" fill="#94A3B8" fontWeight="500">Pending</text>
        </g>

        {/* Auto-pause badge — pops in */}
        <g className="feat-drip-pause">
          <rect x="72" y="112" width="108" height="16" rx="4" fill="#FFFBEB" stroke="#FDE68A" strokeWidth="1" />
          <text x="82" y="123" fontSize="6.5" fontFamily="var(--font-body)" fill="#CA8A04" fontWeight="600">Auto-pauses on contact</text>
        </g>
      </svg>
    </div>
  );
}

/* ── Feature 8: Integrations ── */
export function IntegrationsIllustration(): React.ReactElement {
  return (
    <div className="step-illustration" aria-hidden="true">
      <svg
        viewBox="0 0 280 140"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-auto"
      >
        {/* Card frame */}
        <rect x="16" y="8" width="248" height="124" rx="8" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="1.5" />
        <text x="28" y="26" fontSize="9" fontFamily="var(--font-body)" fill="#64748B" fontWeight="500">Webhook delivery</text>

        {/* HawkLeads source on left */}
        <g className="feat-int-source">
          <rect x="28" y="40" width="56" height="28" rx="6" fill="#0F172A" />
          <text x="37" y="57" fontSize="7" fontFamily="var(--font-body)" fill="#FFFFFF" fontWeight="500">HawkLeads</text>
        </g>

        {/* Animated connection line — dashes flow right */}
        <g className="feat-int-line">
          <line x1="84" y1="54" x2="148" y2="54" stroke="#2563EB" strokeWidth="1.5" strokeDasharray="6 3" className="feat-int-dash" />
          <circle cx="116" cy="54" r="3" fill="#2563EB" className="feat-int-pulse" />
        </g>

        {/* Destination services stacked on right */}
        <g className="feat-int-dest-1">
          <rect x="152" y="32" width="100" height="18" rx="4" fill="#F8FAFC" stroke="#E2E8F0" strokeWidth="1" />
          <circle cx="164" cy="41" r="4" fill="#FF4F00" opacity="0.2" />
          <text x="172" y="44" fontSize="6.5" fontFamily="var(--font-body)" fill="#0F172A">Zapier</text>
          <rect x="220" y="36" width="24" height="10" rx="5" fill="#F0FDF4" />
          <text x="225" y="43" fontSize="5" fontFamily="var(--font-mono)" fill="#16A34A" fontWeight="600">200</text>
        </g>
        <g className="feat-int-dest-2">
          <rect x="152" y="54" width="100" height="18" rx="4" fill="#F8FAFC" stroke="#E2E8F0" strokeWidth="1" />
          <circle cx="164" cy="63" r="4" fill="#2563EB" opacity="0.2" />
          <text x="172" y="66" fontSize="6.5" fontFamily="var(--font-body)" fill="#0F172A">Make</text>
          <rect x="220" y="58" width="24" height="10" rx="5" fill="#F0FDF4" />
          <text x="225" y="65" fontSize="5" fontFamily="var(--font-mono)" fill="#16A34A" fontWeight="600">200</text>
        </g>
        <g className="feat-int-dest-3">
          <rect x="152" y="76" width="100" height="18" rx="4" fill="#F8FAFC" stroke="#E2E8F0" strokeWidth="1" />
          <circle cx="164" cy="85" r="4" fill="#64748B" opacity="0.2" />
          <text x="172" y="88" fontSize="6.5" fontFamily="var(--font-body)" fill="#0F172A">Custom CRM</text>
          <rect x="220" y="80" width="24" height="10" rx="5" fill="#F0FDF4" />
          <text x="225" y="87" fontSize="5" fontFamily="var(--font-mono)" fill="#16A34A" fontWeight="600">200</text>
        </g>

        {/* Event log row — slides up */}
        <g className="feat-int-log">
          <rect x="28" y="102" width="224" height="22" rx="4" fill="#F8FAFC" stroke="#E2E8F0" strokeWidth="1" />
          <circle cx="40" cy="113" r="3" fill="#16A34A" />
          <text x="48" y="116" fontSize="6" fontFamily="var(--font-mono)" fill="#0F172A">submission.created</text>
          <text x="148" y="116" fontSize="6" fontFamily="var(--font-body)" fill="#16A34A">Delivered</text>
          <text x="196" y="116" fontSize="6" fontFamily="var(--font-mono)" fill="#94A3B8">42ms</text>
          <text x="224" y="116" fontSize="6" fontFamily="var(--font-body)" fill="#94A3B8">just now</text>
        </g>

        {/* Event payload — the JSON snippet */}
        <g className="feat-int-payload">
          <rect x="28" y="72" width="56" height="24" rx="4" fill="#1E293B" />
          <text x="34" y="82" fontSize="5" fontFamily="var(--font-mono)" fill="#94A3B8">{"{"}&quot;event&quot;:</text>
          <text x="34" y="90" fontSize="5" fontFamily="var(--font-mono)" fill="#2563EB">&quot;submission&quot;{"}"}</text>
        </g>
      </svg>
    </div>
  );
}

/* ── Feature 8: Shared Analytics ── */
export function SharedAnalyticsIllustration(): React.ReactElement {
  return (
    <div className="step-illustration" aria-hidden="true">
      <svg
        viewBox="0 0 280 140"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-auto"
      >
        {/* Card frame */}
        <rect x="16" y="8" width="248" height="124" rx="8" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="1.5" />
        <text x="28" y="26" fontSize="9" fontFamily="var(--font-body)" fill="#64748B" fontWeight="500">Client report</text>

        {/* Mini chart bars — grow up */}
        <g className="feat-share-chart">
          <rect x="32" y="88" width="16" height="24" rx="2" fill="#2563EB" opacity="0.15" />
          <rect x="32" y="88" width="16" height="24" rx="2" fill="#2563EB" opacity="0.3" className="feat-share-bar-1" />
          <rect x="54" y="76" width="16" height="36" rx="2" fill="#2563EB" opacity="0.15" />
          <rect x="54" y="76" width="16" height="36" rx="2" fill="#2563EB" opacity="0.4" className="feat-share-bar-2" />
          <rect x="76" y="64" width="16" height="48" rx="2" fill="#2563EB" opacity="0.15" />
          <rect x="76" y="64" width="16" height="48" rx="2" fill="#2563EB" opacity="0.6" className="feat-share-bar-3" />
          <rect x="98" y="70" width="16" height="42" rx="2" fill="#2563EB" opacity="0.15" />
          <rect x="98" y="70" width="16" height="42" rx="2" fill="#2563EB" opacity="0.5" className="feat-share-bar-4" />
          <rect x="120" y="56" width="16" height="56" rx="2" fill="#2563EB" opacity="0.15" />
          <rect x="120" y="56" width="16" height="56" rx="2" fill="#2563EB" opacity="0.7" className="feat-share-bar-5" />
          {/* X axis */}
          <line x1="28" y1="112" x2="140" y2="112" stroke="#E2E8F0" strokeWidth="1" />
        </g>

        {/* Stat cards on right */}
        <g className="feat-share-stats">
          <rect x="152" y="34" width="100" height="26" rx="6" fill="#F8FAFC" stroke="#E2E8F0" strokeWidth="1" />
          <text x="162" y="44" fontSize="6" fontFamily="var(--font-body)" fill="#94A3B8">Submissions</text>
          <text x="162" y="54" fontSize="12" fontFamily="var(--font-mono)" fill="#0F172A" fontWeight="700">1,247</text>

          <rect x="152" y="66" width="100" height="26" rx="6" fill="#F8FAFC" stroke="#E2E8F0" strokeWidth="1" />
          <text x="162" y="76" fontSize="6" fontFamily="var(--font-body)" fill="#94A3B8">Conversion</text>
          <text x="162" y="86" fontSize="12" fontFamily="var(--font-mono)" fill="#16A34A" fontWeight="700">18.3%</text>
        </g>

        {/* Share button — pops in with lock icon */}
        <g className="feat-share-overlay">
          <rect x="152" y="98" width="100" height="26" rx="6" fill="#0F172A" />

          {/* Lock icon */}
          <rect x="165" y="109" width="7" height="6" rx="1.5" fill="none" stroke="#FFFFFF" strokeWidth="1.2" />
          <path
            d="M166.5 109 v-1.5 a 2 2 0 0 1 4 0 v1.5"
            fill="none"
            stroke="#FFFFFF"
            strokeWidth="1.2"
            strokeLinecap="round"
          />

          {/* Text */}
          <text x="178" y="114" fontSize="7" fontFamily="var(--font-body)" fill="#FFFFFF" fontWeight="500">
            Share link
          </text>

          {/* Arrow icon */}
          <path
            d="M236 106 l4 5 l-4 5"
            fill="none"
            stroke="#FFFFFF"
            strokeWidth="1.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity="0.5"
          />
        </g>

        {/* Tier mini badges */}
        <g className="feat-share-tiers">
          <rect x="32" y="36" width="32" height="14" rx="7" fill="#FEF2F2" />
          <text x="40" y="46" fontSize="6" fontFamily="var(--font-body)" fill="#DC2626" fontWeight="600">342</text>
          <rect x="68" y="36" width="32" height="14" rx="7" fill="#FFFBEB" />
          <text x="76" y="46" fontSize="6" fontFamily="var(--font-body)" fill="#CA8A04" fontWeight="600">589</text>
          <rect x="104" y="36" width="32" height="14" rx="7" fill="#EFF6FF" />
          <text x="112" y="46" fontSize="6" fontFamily="var(--font-body)" fill="#2563EB" fontWeight="600">316</text>
        </g>
      </svg>
    </div>
  );
}
