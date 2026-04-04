import { INDUSTRIES } from '../_constants';

const ICON_MAP: Record<string, string> = {
  Plumbing: 'M12 3v18m-6-6h12M6 9a6 6 0 0112 0',
  Roofing: 'M3 21h18M3 21l9-15 9 15M7 14h10',
  Electricians: 'M13 2L3 14h9l-1 8 10-12h-9l1-8z',
  HVAC: 'M12 3v1m0 16v1m8.66-13.66l-.71.71M4.05 19.95l-.71.71M21 12h-1M4 12H3m16.95 7.95l-.71-.71M4.76 4.76l-.71-.71M16 12a4 4 0 11-8 0 4 4 0 018 0z',
  Landscaping: 'M12 19V6M5 12c0-3.87 3.13-7 7-7s7 3.13 7 7M8 21h8',
  'Pest Control': 'M12 2a4 4 0 014 4v2H8V6a4 4 0 014-4zM8 8l-4 4m12-4l4 4M6 14h12M8 14v6m8-6v6',
  Solar: 'M12 3v1m0 16v1m8.66-13.66l-.71.71M4.05 19.95l-.71.71M21 12h-1M4 12H3m16.95 7.95l-.71-.71M4.76 4.76l-.71-.71M16 12a4 4 0 11-8 0 4 4 0 018 0z',
  'Law Firms': 'M3 6l9-3 9 3M3 6v12l9 3 9-3V6M3 6l9 3 9-3',
  'Real Estate': 'M3 21h18M3 21V10l9-7 9 7v11M9 21v-6h6v6',
  Insurance: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z',
  'Marketing Agencies': 'M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z',
  'Med Spas': 'M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z',
  Dental: 'M12 4a4 4 0 014 4c0 2-1 3-2 4s-2 3-2 5m0 0c0-2-1-3-2-5s-2-2-2-4a4 4 0 018 0',
  'Auto Body': 'M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0zM3 11l2-6h14l2 6M3 11h18v4H3v-4z',
  'Financial Advisors': 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
  'Home Remodeling': 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0H5m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5h6v5',
  'Cleaning Services': 'M5 3v18m0 0h14M5 21l7-7m7-11v7l-7 7M12 3h7',
  Photography: 'M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9zm9 3a3 3 0 110 6 3 3 0 010-6z',
  Architecture: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m0-10h14M9 3v18m6-18v18',
  Accounting: 'M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z',
};

const DEFAULT_ICON = 'M13 10V3L4 14h7v7l9-11h-7z';

function IndustryPill({ name }: { readonly name: string }): React.ReactElement {
  const iconPath = ICON_MAP[name] ?? DEFAULT_ICON;

  return (
    <div className="flex items-center gap-2.5 px-5 py-2.5 rounded-md border border-zinc-800 bg-zinc-900/60 whitespace-nowrap flex-shrink-0">
      <svg
        className="w-4 h-4 text-zinc-400 flex-shrink-0"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d={iconPath} />
      </svg>
      <span className="text-sm font-body font-medium text-zinc-300">{name}</span>
    </div>
  );
}

export function IndustryCarousel(): React.ReactElement {
  // Double the list so the second copy scrolls in seamlessly
  const items = [...INDUSTRIES, ...INDUSTRIES];

  return (
    <section className="bg-black py-16 px-6 overflow-hidden">
      <div className="max-w-content mx-auto mb-8 text-center">
        <p className="text-xs font-body font-semibold uppercase tracking-[0.15em] text-zinc-500 mb-4">
          Built for
        </p>
        <h2 className="font-display text-3xl font-semibold text-white">
          Every service business that lives and dies by leads.
        </h2>
      </div>

      {/* Row 1: scrolls left */}
      <div className="relative">
        <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-black to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-black to-transparent z-10 pointer-events-none" />
        <div className="flex gap-3 animate-marquee-left">
          {items.map((name, i) => (
            <IndustryPill key={`l-${String(i)}`} name={name} />
          ))}
        </div>
      </div>

      {/* Row 2: scrolls right, offset start */}
      <div className="relative mt-3">
        <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-black to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-black to-transparent z-10 pointer-events-none" />
        <div className="flex gap-3 animate-marquee-right">
          {[...items.slice(10), ...items.slice(0, 10)].map((name, i) => (
            <IndustryPill key={`r-${String(i)}`} name={name} />
          ))}
        </div>
      </div>
    </section>
  );
}
