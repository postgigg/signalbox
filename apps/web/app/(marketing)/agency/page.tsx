'use client';

import Link from 'next/link';

import { useInViewAnimations } from '@/lib/use-in-view';

const AGENCY_PROBLEMS = [
  {
    problem: 'Clients ask "what am I paying you for?"',
    solution: 'Send them a live analytics link. Submissions, conversion rates, tier breakdowns. Updated in real time. No login required.',
  },
  {
    problem: 'You manage 10 clients with 10 different tools',
    solution: 'One dashboard. Every client in one place. Switch between accounts in two clicks. See who needs attention.',
  },
  {
    problem: 'Your team wastes hours building lead reports',
    solution: 'Shared analytics links generate themselves. Password-protect them or leave them open. Send the URL and move on.',
  },
  {
    problem: 'Clients want to know you are driving quality, not just volume',
    solution: 'Every lead is scored 0 to 100. Show clients the score breakdown. Prove that your campaigns attract $10k+ buyers, not tire-kickers.',
  },
] as const;

const AGENCY_FEATURES = [
  { title: '25 widgets', body: 'One per client site. Or five per client. You decide.' },
  { title: 'Unlimited submissions', body: 'No caps. No overage fees. Scale without worrying about limits.' },
  { title: 'White-label branding', body: 'Remove HawkLeads branding. Your clients see your brand, not ours.' },
  { title: 'Shared analytics links', body: 'Generate read-only dashboards for each client. Password-optional. Expiry dates supported.' },
  { title: 'Lead routing', body: 'Auto-assign leads to the right person on your client\'s team based on score or answers.' },
  { title: 'Multi-client dashboard', body: 'Organize widgets by client account. Switch contexts instantly.' },
  { title: 'A/B testing', body: 'Test different qualifying questions across client sites. Show them which wording converts better.' },
  { title: 'Priority support', body: '4-hour response time during business hours. Your clients are never waiting on us.' },
] as const;

export default function AgencyPage(): React.ReactElement {
  useInViewAnimations();

  return (
    <div>
      {/* Hero */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-content mx-auto">
          <div className="max-w-2xl animate-on-enter">
            <p className="text-sm font-body font-medium text-signal uppercase tracking-wide">For agencies</p>
            <h1 className="mt-3 font-display text-5xl font-semibold text-ink leading-tight">
              Your clients hired you to get results. Now you can prove it.
            </h1>
            <p className="mt-6 text-lg text-stone leading-relaxed">
              Install HawkLeads on every client site. Score their leads automatically.
              Send them a live analytics link instead of a PDF report.
              Justify your retainer with data they can see in real time.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row items-start gap-3">
              <Link href="/signup?plan=agency" className="btn-primary-lg">
                Start Agency Trial
              </Link>
              <Link href="/pricing" className="btn-secondary self-center">
                Compare plans
              </Link>
            </div>
            <p className="mt-3 text-sm text-stone-light">
              14 days free. 25 widgets. Unlimited submissions. No credit card.
            </p>
          </div>
        </div>
      </section>

      {/* The Agency Problem */}
      <section className="py-20 px-6 bg-surface-alt border-y border-border">
        <div className="max-w-content mx-auto">
          <h2 className="font-display text-3xl font-semibold text-ink animate-on-enter">
            The problems you already have.
          </h2>
          <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-6">
            {AGENCY_PROBLEMS.map((item, index) => (
              <div key={item.problem} className={`card animate-on-enter stagger-${String(index + 1)}`}>
                <p className="font-body text-sm font-semibold text-danger">{item.problem}</p>
                <p className="mt-3 text-sm text-stone leading-relaxed">{item.solution}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ROI Section */}
      <section className="py-20 px-6">
        <div className="max-w-content mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="animate-on-enter">
            <h2 className="font-display text-3xl font-semibold text-ink">
              The math is simple.
            </h2>
            <p className="mt-4 text-base text-stone leading-relaxed">
              HawkLeads Agency is $249/month. You manage 10 clients.
              That is $24.90 per client per month for scored leads, live analytics,
              and a retention tool that makes your reporting automatic.
            </p>
            <p className="mt-3 text-base text-stone leading-relaxed">
              If one client stays an extra month because of the analytics you show them,
              the tool has paid for itself for the year.
            </p>
          </div>
          <div className="grid grid-cols-3 gap-4 text-center animate-slide-right">
            <div className="card py-6">
              <span className="font-display text-3xl font-bold text-ink">$249</span>
              <p className="mt-1 text-xs text-stone uppercase tracking-wide">Per month</p>
            </div>
            <div className="card py-6">
              <span className="font-display text-3xl font-bold text-signal">25</span>
              <p className="mt-1 text-xs text-stone uppercase tracking-wide">Widgets</p>
            </div>
            <div className="card py-6">
              <span className="font-display text-3xl font-bold text-ink">$0</span>
              <p className="mt-1 text-xs text-stone uppercase tracking-wide">Per submission</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 px-6 bg-surface-alt border-y border-border">
        <div className="max-w-content mx-auto">
          <h2 className="font-display text-3xl font-semibold text-ink animate-on-enter">
            Everything on the Agency plan.
          </h2>
          <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {AGENCY_FEATURES.map((feature, index) => (
              <div key={feature.title} className={`card p-4 animate-on-enter stagger-${String((index % 4) + 1)}`}>
                <h3 className="font-body text-sm font-semibold text-ink">{feature.title}</h3>
                <p className="mt-1 text-xs text-stone leading-relaxed">{feature.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works for agencies */}
      <section className="py-20 px-6">
        <div className="max-w-content mx-auto">
          <h2 className="font-display text-3xl font-semibold text-ink animate-on-enter">
            How agencies use HawkLeads.
          </h2>
          <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="animate-on-enter stagger-1">
              <div className="w-8 h-8 rounded-md bg-ink flex items-center justify-center">
                <span className="font-mono text-sm font-bold text-white">1</span>
              </div>
              <h3 className="mt-3 font-body text-base font-semibold text-ink">Install on client sites</h3>
              <p className="mt-2 text-sm text-stone leading-relaxed">
                Two lines of JavaScript per site. Takes 5 minutes. Works on WordPress, Shopify,
                Webflow, Squarespace, and plain HTML.
              </p>
            </div>
            <div className="animate-on-enter stagger-2">
              <div className="w-8 h-8 rounded-md bg-ink flex items-center justify-center">
                <span className="font-mono text-sm font-bold text-white">2</span>
              </div>
              <h3 className="mt-3 font-body text-base font-semibold text-ink">Leads get scored automatically</h3>
              <p className="mt-2 text-sm text-stone leading-relaxed">
                Every submission is scored 0 to 100. Hot leads trigger instant alerts to your
                client. Their team knows exactly who to call first.
              </p>
            </div>
            <div className="animate-on-enter stagger-3">
              <div className="w-8 h-8 rounded-md bg-ink flex items-center justify-center">
                <span className="font-mono text-sm font-bold text-white">3</span>
              </div>
              <h3 className="mt-3 font-body text-base font-semibold text-ink">Share results, keep clients</h3>
              <p className="mt-2 text-sm text-stone leading-relaxed">
                Generate a shared analytics link for each client. They see submissions,
                conversion rates, and tier breakdowns in real time. No login needed.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-black py-24 px-6">
        <div className="max-w-content mx-auto text-center animate-on-enter">
          <h2 className="font-display text-4xl font-semibold text-white">
            Stop building reports. Start showing results.
          </h2>
          <p className="mt-4 text-base text-stone-light max-w-lg mx-auto">
            Your clients want proof that your marketing works.
            Give them a live dashboard instead of a monthly PDF.
          </p>
          <div className="mt-8">
            <Link
              href="/signup?plan=agency"
              className="inline-flex items-center justify-center rounded-md bg-white text-ink font-body font-medium text-base h-12 px-6 transition-all duration-fast hover:bg-paper"
            >
              Start Agency Trial
            </Link>
          </div>
          <p className="mt-4 text-sm text-stone-light">
            14 days free. No credit card. Cancel anytime.
          </p>
        </div>
      </section>
    </div>
  );
}
