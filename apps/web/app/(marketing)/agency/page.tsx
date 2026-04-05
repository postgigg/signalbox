'use client';

import Link from 'next/link';

import { useInViewAnimations } from '@/lib/use-in-view';

import { ClientDashboard } from './_components/ClientDashboard';

// ---------------------------------------------------------------------------
// Data
// ---------------------------------------------------------------------------

const STATS = [
  { value: '25', label: 'Widgets', detail: 'One per client. Or five per client.' },
  { value: '\u221E', label: 'Submissions', detail: 'No caps. No overage fees. Ever.' },
  { value: '$249', label: 'Per month', detail: 'All features included. Flat price.' },
] as const;

const COMPARISONS = [
  {
    without: 'Clients ask "what am I paying you for?"',
    with: 'Live analytics link. Real-time data. No login required.',
  },
  {
    without: '10 clients managed across 10 different tools.',
    with: 'One dashboard. Every client. Switch in two clicks.',
  },
  {
    without: 'Hours wasted building manual lead reports.',
    with: 'Shared links generate themselves. Send the URL. Done.',
  },
  {
    without: 'No way to prove lead quality to clients.',
    with: 'Every lead scored 0 to 100. Tier breakdowns included.',
  },
] as const;

const FEATURES = [
  { title: '25 widgets', body: 'One per client site. Or five per client. You decide.' },
  { title: 'Unlimited submissions', body: 'No caps. No overage fees. Scale without limits.' },
  { title: 'White-label branding', body: 'Remove HawkLeads branding. Clients see your brand.' },
  { title: 'Shared analytics', body: 'Read-only dashboards per client. Password-optional. Expiry dates.' },
  { title: 'Lead routing', body: 'Auto-assign leads based on score, tier, or answers.' },
  { title: 'Multi-client dashboard', body: 'Organize widgets by client. Switch contexts instantly.' },
  { title: 'A/B testing', body: 'Test questions across client sites. Data picks the winner.' },
  { title: 'Booking calendar', body: 'Hot leads book calls directly inside the widget. No external tools needed.' },
  { title: 'Priority support', body: '4-hour response during business hours.' },
] as const;

const STEPS = [
  {
    title: 'Install on client sites',
    body: 'Two lines of JavaScript per site. 2 minutes. Works on WordPress, Shopify, Webflow, Squarespace, and plain HTML.',
  },
  {
    title: 'Leads get scored automatically',
    body: 'Every submission scored 0 to 100. Hot leads trigger instant alerts. Their team knows who to call first.',
  },
  {
    title: 'Share results, keep clients',
    body: 'Generate a shared analytics link per client. Submissions, conversion rates, tier breakdowns. Real time. No login.',
  },
] as const;

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function AgencyPage(): React.ReactElement {
  useInViewAnimations();

  return (
    <div>
      {/* ── Hero (dark) ── */}
      <section className="bg-black pt-32 pb-24 px-6">
        <div className="max-w-content mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div className="animate-on-enter">
            <p className="text-xs font-body font-semibold uppercase tracking-[0.15em] text-zinc-500 mb-4">
              FOR AGENCIES
            </p>
            <h1 className="font-display text-5xl font-semibold text-white leading-tight">
              Your clients hired you to get results. Now you can prove it.
            </h1>
            <p className="mt-6 text-lg font-body text-zinc-400 leading-relaxed max-w-[520px]">
              Install HawkLeads on every client site. Score leads automatically.
              Share live analytics instead of a PDF report.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row items-start gap-3">
              <Link
                href="/signup?plan=agency"
                className="inline-flex items-center justify-center rounded-md bg-white text-black font-body font-medium text-base h-12 px-6 transition-colors duration-fast hover:bg-zinc-100 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-black"
              >
                Start Agency Trial
              </Link>
              <Link
                href="/pricing"
                className="inline-flex items-center justify-center rounded-md border border-zinc-700 text-zinc-300 font-body font-medium text-sm h-10 px-4 transition-colors duration-fast hover:border-zinc-500 hover:text-white focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-black self-center"
              >
                Compare plans
              </Link>
            </div>
            <p className="mt-3 text-sm font-body text-zinc-500">
              30 days free. 25 widgets. Unlimited submissions. No credit card.
            </p>
          </div>
          <div className="hidden lg:block animate-slide-right">
            <ClientDashboard />
          </div>
        </div>
      </section>

      {/* ── Stats (light) ── */}
      <section className="bg-white py-16 px-6 border-b border-border">
        <div className="max-w-content mx-auto grid grid-cols-1 sm:grid-cols-3 gap-8 text-center">
          {STATS.map((stat, index) => (
            <div key={stat.label} className={`animate-on-enter stagger-${String(index + 1)}`}>
              <span className="font-display text-5xl font-bold text-ink">{stat.value}</span>
              <p className="mt-1 text-sm font-body font-semibold text-ink uppercase tracking-wide">{stat.label}</p>
              <p className="mt-1 text-sm font-body text-stone">{stat.detail}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Comparison (dark) ── */}
      <section className="bg-black py-20 px-6">
        <div className="max-w-content mx-auto">
          <p className="text-xs font-body font-semibold uppercase tracking-[0.15em] text-zinc-500 mb-4">
            BEFORE VS. AFTER
          </p>
          <h2 className="font-display text-3xl font-semibold text-white animate-on-enter">
            The agency problem, solved.
          </h2>
          <div className="mt-8 overflow-x-auto animate-on-enter stagger-2">
            <table className="w-full text-sm border border-zinc-800 rounded-md">
              <thead>
                <tr className="bg-zinc-900 border-b border-zinc-800">
                  <th className="text-left py-3 px-5 font-body font-medium text-zinc-500 w-1/2">Without HawkLeads</th>
                  <th className="text-left py-3 px-5 font-body font-medium text-white w-1/2">With Agency Plan</th>
                </tr>
              </thead>
              <tbody>
                {COMPARISONS.map((row) => (
                  <tr key={row.without} className="border-b border-zinc-800 last:border-b-0">
                    <td className="py-3 px-5 font-body text-zinc-500">{row.without}</td>
                    <td className="py-3 px-5 font-body text-white font-medium">{row.with}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ── Features (light) ── */}
      <section className="bg-white py-20 px-6 border-y border-border">
        <div className="max-w-content mx-auto">
          <p className="text-xs font-body font-semibold uppercase tracking-[0.15em] text-stone mb-4">
            WHAT YOU GET
          </p>
          <h2 className="font-display text-3xl font-semibold text-ink animate-on-enter">
            Everything on the Agency plan.
          </h2>
          <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {FEATURES.map((feature, index) => (
              <div
                key={feature.title}
                className={`border border-border rounded-md p-5 animate-on-enter stagger-${String((index % 4) + 1)}`}
              >
                <span className="inline-block w-2 h-2 rounded-full bg-signal mb-3" />
                <h3 className="font-body text-sm font-semibold text-ink">{feature.title}</h3>
                <p className="mt-1 text-xs font-body text-stone leading-relaxed">{feature.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works (dark) ── */}
      <section className="bg-black py-20 px-6">
        <div className="max-w-content mx-auto">
          <p className="text-xs font-body font-semibold uppercase tracking-[0.15em] text-zinc-500 mb-4">
            HOW IT WORKS
          </p>
          <h2 className="font-display text-3xl font-semibold text-white animate-on-enter">
            How agencies use HawkLeads.
          </h2>
          <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-8">
            {STEPS.map((step, index) => (
              <div key={step.title} className={`animate-on-enter stagger-${String(index + 1)}`}>
                <div className="w-10 h-10 rounded-md bg-white flex items-center justify-center">
                  <span className="font-mono text-sm font-bold text-black">{String(index + 1)}</span>
                </div>
                <h3 className="mt-4 font-body text-base font-semibold text-white">{step.title}</h3>
                <p className="mt-2 text-sm font-body text-zinc-400 leading-relaxed">{step.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── ROI (light) ── */}
      <section className="bg-white py-20 px-6 border-y border-border">
        <div className="max-w-content mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="animate-on-enter">
            <p className="text-xs font-body font-semibold uppercase tracking-[0.15em] text-stone mb-4">
              THE MATH
            </p>
            <h2 className="font-display text-3xl font-semibold text-ink">
              The math is simple.
            </h2>
            <p className="mt-4 text-base font-body text-stone leading-relaxed">
              HawkLeads Agency is $249/month. You manage 10 clients.
              That is $24.90 per client per month for scored leads, live analytics,
              and a retention tool that makes your reporting automatic.
            </p>
            <p className="mt-3 text-base font-body text-stone leading-relaxed">
              If one client stays an extra month because of the analytics you show them,
              the tool has paid for itself for the year.
            </p>
          </div>
          <div className="animate-slide-right">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="border border-border rounded-md py-6">
                <span className="font-display text-3xl font-bold text-ink">$249</span>
                <p className="mt-1 text-xs font-body text-stone uppercase tracking-wide">Per month</p>
              </div>
              <div className="border border-border rounded-md py-6">
                <span className="font-display text-3xl font-bold text-signal">25</span>
                <p className="mt-1 text-xs font-body text-stone uppercase tracking-wide">Widgets</p>
              </div>
              <div className="border border-border rounded-md py-6">
                <span className="font-display text-3xl font-bold text-ink">$0</span>
                <p className="mt-1 text-xs font-body text-stone uppercase tracking-wide">Per lead</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA (dark) ── */}
      <section className="bg-black py-24 px-6">
        <div className="max-w-content mx-auto text-center animate-on-enter">
          <p className="text-xs font-body font-semibold uppercase tracking-[0.15em] text-zinc-500 mb-4">
            GET STARTED
          </p>
          <h2 className="font-display text-4xl font-semibold text-white">
            Stop building reports. Start showing results.
          </h2>
          <p className="mt-4 text-base font-body text-zinc-400 max-w-lg mx-auto">
            Your clients want proof that your marketing works.
            Give them a live dashboard instead of a monthly PDF.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/signup?plan=agency"
              className="inline-flex items-center justify-center rounded-md bg-white text-black font-body font-medium text-base h-12 px-6 transition-colors duration-fast hover:bg-zinc-100 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-black"
            >
              Start Agency Trial
            </Link>
            <Link
              href="/pricing"
              className="inline-flex items-center justify-center rounded-md border border-zinc-700 text-zinc-300 font-body font-medium text-sm h-12 px-5 transition-colors duration-fast hover:border-zinc-500 hover:text-white focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-black"
            >
              Compare all plans
            </Link>
          </div>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm font-body text-zinc-500">
            <span className="flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              30-day free trial
            </span>
            <span className="flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              No credit card
            </span>
            <span className="flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              Cancel anytime
            </span>
          </div>
        </div>
      </section>
    </div>
  );
}
