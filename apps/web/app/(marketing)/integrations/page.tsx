'use client';

import Link from 'next/link';

import { useInViewAnimations } from '@/lib/use-in-view';

// ---------------------------------------------------------------------------
// Data
// ---------------------------------------------------------------------------

const PLATFORMS = [
  {
    name: 'Wix',
    href: '/integrations/wix',
    description: 'One-click install from the Wix App Market.',
    icon: 'W',
  },
  {
    name: 'WordPress',
    href: '/integrations#wordpress',
    description: 'Lightweight plugin. Works with any theme.',
    icon: 'WP',
  },
  {
    name: 'Shopify',
    href: '/integrations/shopify',
    description: 'One-click install from the Shopify App Store.',
    icon: 'S',
  },
  {
    name: 'Squarespace',
    href: '/integrations#squarespace',
    description: 'Paste into a code block. Done.',
    icon: 'Sq',
  },
  {
    name: 'Webflow',
    href: '/integrations#webflow',
    description: 'Embed in any Webflow page or template.',
    icon: 'Wf',
  },
  {
    name: 'HTML / Custom',
    href: '/integrations#html',
    description: 'Two lines of JavaScript. Any website.',
    icon: '</>',
  },
] as const;

const CRM_INTEGRATIONS = [
  {
    name: 'Zapier',
    description: 'Connect to 6,000+ apps. Trigger a Zap on every submission.',
  },
  {
    name: 'Make',
    description: 'Visual automation scenarios. Map fields, filter by score.',
  },
  {
    name: 'Salesforce',
    description: 'Push scored leads directly into Salesforce via webhook.',
  },
  {
    name: 'HubSpot',
    description: 'Create contacts with score and tier data automatically.',
  },
] as const;

const WEBHOOK_FEATURES = [
  {
    title: 'Signed payloads',
    body: 'Every webhook includes an HMAC-SHA256 signature. Verify the sender before processing.',
  },
  {
    title: 'Full context in every payload',
    body: 'Lead score, tier, all answers, contact info, timestamp, and widget ID. Everything your CRM needs in one POST.',
  },
  {
    title: 'Retry on failure',
    body: 'If your endpoint returns an error, HawkLeads retries with exponential backoff. No data lost.',
  },
  {
    title: 'Filter by tier',
    body: 'Only send hot leads to your CRM. Route warm leads to a drip sequence. Ignore cold.',
  },
] as const;

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function IntegrationsPage(): React.ReactElement {
  useInViewAnimations();

  return (
    <div>
      {/* ── Hero ── */}
      <section className="bg-black pt-32 pb-20 px-6">
        <div className="max-w-prose mx-auto text-center animate-on-enter">
          <p className="text-xs font-body font-semibold uppercase tracking-[0.15em] text-zinc-500 mb-4">
            INTEGRATIONS
          </p>
          <h1 className="font-display text-5xl font-semibold text-white leading-tight">
            Works with everything you already use.
          </h1>
          <p className="mt-6 text-lg text-zinc-400 leading-relaxed font-body">
            Two lines of code. Any website platform. Webhooks for any CRM.
          </p>
        </div>
      </section>

      {/* ── Platform Grid (light section) ── */}
      <section className="py-20 px-6 bg-white border-y border-zinc-200">
        <div className="max-w-content mx-auto">
          <p className="text-xs font-body font-semibold uppercase tracking-[0.15em] text-stone text-center mb-4 animate-on-enter">
            PLATFORMS
          </p>
          <h2 className="font-display text-3xl font-semibold text-ink text-center animate-on-enter">
            Every major website platform.
          </h2>
          <p className="mt-3 text-base text-stone text-center font-body animate-on-enter">
            Install in under two minutes. No developer required.
          </p>
          <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {PLATFORMS.map((platform, index) => (
              <Link
                key={platform.name}
                href={platform.href}
                className={`block border border-zinc-200 rounded-md p-5 transition-all duration-150 hover:shadow-md animate-on-enter stagger-${String((index % 3) + 1)}`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-md bg-ink flex items-center justify-center flex-shrink-0">
                    <span className="font-mono text-xs font-bold text-white">{platform.icon}</span>
                  </div>
                  <div>
                    <h3 className="font-body text-base font-semibold text-ink">{platform.name}</h3>
                    <p className="mt-0.5 text-sm text-stone font-body">{platform.description}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Connect to Any CRM + Webhook (dark section) ── */}
      <section className="bg-black py-20 px-6">
        <div className="max-w-content mx-auto">
          <div className="max-w-prose animate-on-enter">
            <p className="text-xs font-body font-semibold uppercase tracking-[0.15em] text-zinc-500 mb-4">
              CRM AND WEBHOOKS
            </p>
            <h2 className="font-display text-3xl font-semibold text-white">
              Connect to any CRM.
            </h2>
            <p className="mt-4 text-base text-zinc-400 leading-relaxed font-body">
              HawkLeads fires a webhook on every submission. Connect it to Zapier, Make,
              or send data directly to Salesforce, HubSpot, or any system that accepts HTTP requests.
            </p>
          </div>
          <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {CRM_INTEGRATIONS.map((crm, index) => (
              <div
                key={crm.name}
                className={`bg-zinc-900 border border-zinc-800 rounded-md p-5 animate-on-enter stagger-${String((index % 4) + 1)}`}
              >
                <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 mb-3" />
                <h3 className="font-body text-sm font-semibold text-white">{crm.name}</h3>
                <p className="mt-1 text-xs text-zinc-400 leading-relaxed font-body">{crm.description}</p>
              </div>
            ))}
          </div>

          {/* Webhook features */}
          <div className="mt-16 max-w-prose animate-on-enter">
            <h2 className="font-display text-3xl font-semibold text-white">
              Webhook-first architecture.
            </h2>
            <p className="mt-4 text-base text-zinc-400 leading-relaxed font-body">
              Every submission fires a signed webhook to any URL you configure.
              No polling. No third-party middleware required. Your data arrives
              the moment a visitor submits.
            </p>
          </div>
          <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 gap-6">
            {WEBHOOK_FEATURES.map((feature, index) => (
              <div
                key={feature.title}
                className={`bg-zinc-900 border border-zinc-800 rounded-md p-5 animate-on-enter stagger-${String((index % 2) + 1)}`}
              >
                <h3 className="font-body text-base font-semibold text-white">{feature.title}</h3>
                <p className="mt-2 text-sm text-zinc-400 leading-relaxed font-body">{feature.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Embed Code Preview (light section) ── */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-content mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="animate-on-enter">
            <p className="text-xs font-body font-semibold uppercase tracking-[0.15em] text-stone mb-4">
              EMBED CODE
            </p>
            <h2 className="font-display text-3xl font-semibold text-ink">
              Two lines. That is the whole install.
            </h2>
            <p className="mt-4 text-base text-stone leading-relaxed font-body">
              Paste the config and script tag into your site. The widget loads asynchronously,
              weighs under 25KB, and runs inside an isolated Shadow DOM. It will not interfere
              with your styles or scripts.
            </p>
            <p className="mt-3 text-sm text-stone/70 font-body">
              Works on any website that supports custom HTML. Wix, WordPress, Shopify, Squarespace,
              Webflow, or a static HTML file.
            </p>
          </div>
          <div className="animate-slide-right">
            <div className="rounded-md overflow-hidden bg-zinc-950 border border-zinc-800">
              <div className="flex items-center gap-1.5 px-4 py-2.5 border-b border-zinc-800">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
                <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/60" />
                <span className="w-2.5 h-2.5 rounded-full bg-green-500/60" />
                <span className="ml-2 text-xs text-zinc-500 font-mono">your-website.html</span>
              </div>
              <div className="p-4 text-sm font-mono leading-relaxed">
                <p className="text-zinc-500">&lt;!-- HawkLeads Widget --&gt;</p>
                <p className="text-zinc-300">
                  <span className="text-emerald-400">&lt;script&gt;</span>
                  <span className="text-zinc-300">{'HawkLeadsConfig={key:"YOUR_KEY"}'}</span>
                  <span className="text-emerald-400">&lt;/script&gt;</span>
                </p>
                <p className="text-zinc-300">
                  <span className="text-emerald-400">&lt;script </span>
                  <span className="text-zinc-500">src=</span>
                  <span className="text-amber-300">{'"https://hawkleads.io/widget/sb.js"'}</span>
                  <span className="text-emerald-400"> async&gt;&lt;/script&gt;</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA (dark section) ── */}
      <section className="bg-black py-24 px-6">
        <div className="max-w-content mx-auto text-center animate-on-enter">
          <h2 className="font-display text-4xl font-semibold text-white">
            Start scoring leads on your platform today.
          </h2>
          <p className="mt-4 text-base text-zinc-500 max-w-lg mx-auto font-body">
            Two minutes to install. Every lead scored 0 to 100.
            Hot leads trigger instant alerts. Your CRM stays in sync.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/signup"
              className="inline-flex items-center justify-center rounded-md bg-white text-black font-body font-medium text-base h-12 px-7 transition-colors duration-150 hover:bg-zinc-100 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-black"
            >
              Start Free Trial
            </Link>
            <Link
              href="/pricing"
              className="inline-flex items-center justify-center rounded-md border border-zinc-700 text-zinc-400 font-body font-medium text-sm h-12 px-5 transition-colors duration-150 hover:border-zinc-500 hover:text-white focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-black"
            >
              View Pricing
            </Link>
          </div>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-zinc-500 font-body">
            <span className="flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              30-day free trial
            </span>
            <span className="flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              No credit card
            </span>
            <span className="flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
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
