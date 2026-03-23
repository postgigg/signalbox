/**
 * SVG illustration of the multi-client agency dashboard.
 * Shows client tabs, stat cards, scored lead list, share button, and white-label badge.
 */
export function ClientDashboard(): React.ReactElement {
  return (
    <svg
      viewBox="0 0 480 340"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full h-auto"
      role="img"
      aria-label="Agency dashboard showing client tabs, lead scores, and a share analytics button"
    >
      <defs>
        <clipPath id="db-clip"><rect width="480" height="340" rx="8" /></clipPath>
      </defs>

      <g clipPath="url(#db-clip)">
        {/* Background */}
        <rect width="480" height="340" fill="#FFFFFF" />

        {/* Chrome bar */}
        <rect width="480" height="36" fill="#F8FAFC" />
        <line x1="0" y1="36" x2="480" y2="36" stroke="#E2E8F0" />
        <circle cx="16" cy="18" r="4" fill="#E2E8F0" />
        <circle cx="30" cy="18" r="4" fill="#E2E8F0" />
        <circle cx="44" cy="18" r="4" fill="#E2E8F0" />
        <rect x="120" y="10" width="240" height="16" rx="4" fill="#F1F5F9" />
        <text x="240" y="22" textAnchor="middle" fill="#94A3B8" fontSize="8" fontFamily="monospace">app.hawkleads.io/dashboard</text>

        {/* Client tabs */}
        <rect x="16" y="48" width="68" height="24" rx="4" fill="#0F172A" />
        <text x="50" y="64" textAnchor="middle" fill="#FFFFFF" fontSize="9" fontWeight="600" fontFamily="system-ui, sans-serif">Acme Co</text>
        <rect x="92" y="48" width="76" height="24" rx="4" stroke="#E2E8F0" fill="transparent" />
        <text x="130" y="64" textAnchor="middle" fill="#64748B" fontSize="9" fontFamily="system-ui, sans-serif">Smith Legal</text>
        <rect x="176" y="48" width="84" height="24" rx="4" stroke="#E2E8F0" fill="transparent" />
        <text x="218" y="64" textAnchor="middle" fill="#64748B" fontSize="9" fontFamily="system-ui, sans-serif">Peak Roofing</text>
        <rect x="268" y="48" width="30" height="24" rx="4" stroke="#E2E8F0" fill="transparent" />
        <text x="283" y="64" textAnchor="middle" fill="#94A3B8" fontSize="9" fontFamily="system-ui, sans-serif">+7</text>

        {/* Stat cards */}
        <rect x="16" y="86" width="144" height="52" rx="6" stroke="#E2E8F0" fill="#FFFFFF" />
        <text x="28" y="104" fill="#64748B" fontSize="9" fontFamily="system-ui, sans-serif">Submissions</text>
        <text x="28" y="126" fill="#0F172A" fontSize="22" fontWeight="700" fontFamily="system-ui, sans-serif">847</text>

        <rect x="168" y="86" width="144" height="52" rx="6" stroke="#E2E8F0" fill="#FFFFFF" />
        <text x="180" y="104" fill="#64748B" fontSize="9" fontFamily="system-ui, sans-serif">Conversion</text>
        <text x="180" y="126" fill="#2563EB" fontSize="22" fontWeight="700" fontFamily="system-ui, sans-serif">34.2%</text>

        <rect x="320" y="86" width="144" height="52" rx="6" stroke="#E2E8F0" fill="#FFFFFF" />
        <text x="332" y="104" fill="#64748B" fontSize="9" fontFamily="system-ui, sans-serif">Hot Leads</text>
        <text x="332" y="126" fill="#DC2626" fontSize="22" fontWeight="700" fontFamily="system-ui, sans-serif">12</text>

        {/* Lead list header */}
        <rect x="16" y="150" width="448" height="22" rx="4" fill="#F8FAFC" />
        <text x="48" y="165" fill="#64748B" fontSize="8" fontWeight="600" fontFamily="system-ui, sans-serif">Name</text>
        <text x="210" y="165" fill="#64748B" fontSize="8" fontWeight="600" fontFamily="system-ui, sans-serif">Score</text>
        <text x="400" y="165" fill="#64748B" fontSize="8" fontWeight="600" fontFamily="system-ui, sans-serif">Tier</text>

        {/* Row 1 — Hot */}
        <line x1="16" y1="176" x2="464" y2="176" stroke="#F1F5F9" />
        <circle cx="34" cy="192" r="10" fill="#FEE2E2" />
        <text x="34" y="196" textAnchor="middle" fill="#DC2626" fontSize="9" fontWeight="600" fontFamily="system-ui, sans-serif">SM</text>
        <text x="52" y="196" fill="#0F172A" fontSize="10" fontFamily="system-ui, sans-serif">Sarah Mitchell</text>
        <rect x="210" y="186" width="120" height="8" rx="4" fill="#F1F5F9" />
        <rect x="210" y="186" width="102" height="8" rx="4" fill="#DC2626" opacity="0.7" />
        <text x="340" y="195" fill="#64748B" fontSize="8" fontFamily="system-ui, sans-serif">85</text>
        <rect x="392" y="184" width="34" height="16" rx="8" fill="#FEE2E2" />
        <text x="409" y="196" textAnchor="middle" fill="#DC2626" fontSize="8" fontWeight="600" fontFamily="system-ui, sans-serif">HOT</text>

        {/* Row 2 — Warm */}
        <line x1="16" y1="210" x2="464" y2="210" stroke="#F1F5F9" />
        <circle cx="34" cy="226" r="10" fill="#FEF9C3" />
        <text x="34" y="230" textAnchor="middle" fill="#CA8A04" fontSize="9" fontWeight="600" fontFamily="system-ui, sans-serif">JP</text>
        <text x="52" y="230" fill="#0F172A" fontSize="10" fontFamily="system-ui, sans-serif">James Park</text>
        <rect x="210" y="220" width="120" height="8" rx="4" fill="#F1F5F9" />
        <rect x="210" y="220" width="66" height="8" rx="4" fill="#CA8A04" opacity="0.7" />
        <text x="340" y="229" fill="#64748B" fontSize="8" fontFamily="system-ui, sans-serif">55</text>
        <rect x="388" y="218" width="46" height="16" rx="8" fill="#FEF9C3" />
        <text x="411" y="230" textAnchor="middle" fill="#CA8A04" fontSize="8" fontWeight="600" fontFamily="system-ui, sans-serif">WARM</text>

        {/* Row 3 — Cold */}
        <line x1="16" y1="244" x2="464" y2="244" stroke="#F1F5F9" />
        <circle cx="34" cy="260" r="10" fill="#F1F5F9" />
        <text x="34" y="264" textAnchor="middle" fill="#94A3B8" fontSize="9" fontWeight="600" fontFamily="system-ui, sans-serif">LR</text>
        <text x="52" y="264" fill="#0F172A" fontSize="10" fontFamily="system-ui, sans-serif">Lisa Reynolds</text>
        <rect x="210" y="254" width="120" height="8" rx="4" fill="#F1F5F9" />
        <rect x="210" y="254" width="36" height="8" rx="4" fill="#94A3B8" opacity="0.5" />
        <text x="340" y="263" fill="#64748B" fontSize="8" fontFamily="system-ui, sans-serif">30</text>
        <rect x="390" y="252" width="42" height="16" rx="8" fill="#F1F5F9" />
        <text x="411" y="264" textAnchor="middle" fill="#94A3B8" fontSize="8" fontWeight="600" fontFamily="system-ui, sans-serif">COLD</text>

        {/* Bottom bar */}
        <line x1="16" y1="280" x2="464" y2="280" stroke="#E2E8F0" />

        {/* Share analytics button */}
        <rect x="16" y="294" width="128" height="30" rx="6" fill="#2563EB" />
        <text x="80" y="313" textAnchor="middle" fill="#FFFFFF" fontSize="10" fontWeight="600" fontFamily="system-ui, sans-serif">Share Analytics</text>

        {/* White-label badge */}
        <rect x="154" y="294" width="96" height="30" rx="6" stroke="#E2E8F0" fill="transparent" />
        <text x="202" y="313" textAnchor="middle" fill="#94A3B8" fontSize="9" fontFamily="system-ui, sans-serif">Your Brand</text>
      </g>

      {/* Frame border */}
      <rect width="480" height="340" rx="8" fill="none" stroke="#E2E8F0" />
    </svg>
  );
}
