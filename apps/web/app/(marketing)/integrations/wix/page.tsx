'use client';

import Link from 'next/link';
import { useState } from 'react';

import { useInViewAnimations } from '@/lib/use-in-view';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const WIX_APP_MARKET_URL = 'https://www.wix.com/app-market/hawkleads';

const STEPS = [
  {
    title: 'Install from the Wix App Market',
    body: 'One click. No code to paste. The widget appears automatically on your Wix site.',
  },
  {
    title: 'Pick a template or build your own flow',
    body: 'Choose qualifying questions. Set score weights. Two minutes to configure.',
  },
  {
    title: 'Leads arrive scored and sorted',
    body: 'Every submission gets a 0 to 100 score. Hot leads trigger instant alerts.',
  },
] as const;

const FEATURES = [
  { title: 'Lead scoring (0-100)', body: 'Every submission scored automatically based on answers and engagement.' },
  { title: 'Instant email alerts', body: 'Hot leads trigger an email with the score, answers, and contact info.' },
  { title: 'Dashboard with sorted call list', body: 'Open your dashboard. See leads ranked by score. Call the best ones first.' },
  { title: 'Custom branding', body: 'Your colors, your fonts. The widget matches your Wix site design.' },
  { title: 'Works inside Wix Editor', body: 'No code to paste. Install from the App Market and configure visually.' },
  { title: '30-day free trial', body: 'Try it with no commitment. No credit card required to start.' },
] as const;

interface FaqItem {
  readonly question: string;
  readonly answer: string;
}

const FAQ_ITEMS: readonly FaqItem[] = [
  {
    question: 'Does it work with Wix Editor and Wix Studio?',
    answer: 'Yes. The HawkLeads app installs on any Wix site regardless of editor.',
  },
  {
    question: 'Will it slow down my Wix site?',
    answer: 'No. The widget loads asynchronously and weighs under 25KB. It runs inside an isolated Shadow DOM.',
  },
  {
    question: 'Can I customize how it looks?',
    answer: 'Fully. Your colors, fonts, button styles, and position. It matches your Wix site design.',
  },
  {
    question: 'What happens after someone submits?',
    answer: 'You get a score, their answers, and contact info in your dashboard. Hot leads trigger an instant email. Webhooks fire to your CRM.',
  },
] as const;

// ---------------------------------------------------------------------------
// FAQ Accordion Item
// ---------------------------------------------------------------------------

interface FaqAccordionItemProps {
  readonly item: FaqItem;
  readonly isOpen: boolean;
  readonly onToggle: () => void;
}

function FaqAccordionItem({ item, isOpen, onToggle }: FaqAccordionItemProps): React.ReactElement {
  return (
    <div className="border-b border-border">
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center justify-between py-4 text-left font-body text-sm font-medium text-ink transition-colors duration-fast hover:text-signal focus:outline-none focus:ring-2 focus:ring-signal focus:ring-offset-2 rounded-sm"
      >
        <span>{item.question}</span>
        <svg
          className={`w-4 h-4 flex-shrink-0 ml-4 text-stone transition-transform duration-fast ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      <div
        className={`overflow-hidden transition-all duration-200 ${isOpen ? 'max-h-40 pb-4' : 'max-h-0'}`}
      >
        <p className="text-sm text-stone leading-relaxed">{item.answer}</p>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function WixIntegrationPage(): React.ReactElement {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  useInViewAnimations();

  function handleFaqToggle(index: number): void {
    setOpenFaq((prev) => (prev === index ? null : index));
  }

  return (
    <div>
      {/* ── Hero ── */}
      <section className="pt-32 pb-24 px-6">
        <div className="max-w-content mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div className="animate-on-enter">
            <p className="text-sm font-body font-medium text-signal uppercase tracking-wide">
              Wix Integration
            </p>
            <h1 className="mt-3 font-display text-5xl font-semibold text-ink leading-tight">
              HawkLeads for Wix
            </h1>
            <p className="mt-6 text-lg text-stone leading-relaxed max-w-[520px]">
              Score every lead on your Wix site. Install from the Wix App Market in one click.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row items-start gap-3">
              <a
                href={WIX_APP_MARKET_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary-lg"
              >
                Install on Wix
              </a>
              <a href="#how-it-works" className="btn-secondary self-center">
                See how it works
              </a>
            </div>
            <p className="mt-3 text-sm text-stone-light">
              30 days free. No credit card. No code needed.
            </p>
          </div>
          <div className="hidden lg:block animate-slide-right">
            <div className="border border-border rounded-md overflow-hidden bg-surface">
              {/* Wix Editor mockup */}
              <div className="flex items-center gap-1.5 px-4 py-2.5 border-b border-border bg-surface-alt">
                <span className="w-2.5 h-2.5 rounded-full bg-danger/60" />
                <span className="w-2.5 h-2.5 rounded-full bg-warning/60" />
                <span className="w-2.5 h-2.5 rounded-full bg-success/60" />
                <span className="ml-2 text-xs text-stone font-mono">Wix Editor</span>
              </div>
              <div className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 rounded-md bg-ink flex items-center justify-center">
                    <span className="font-mono text-xs font-bold text-white">W</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-ink">HawkLeads Widget</p>
                    <p className="text-xs text-stone">Active on this site</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between py-2 px-3 border border-border rounded-sm">
                    <span className="text-xs text-stone">Status</span>
                    <span className="text-xs font-medium text-success">Connected</span>
                  </div>
                  <div className="flex items-center justify-between py-2 px-3 border border-border rounded-sm">
                    <span className="text-xs text-stone">Widget</span>
                    <span className="text-xs font-medium text-ink">Plumbing Qualifier</span>
                  </div>
                  <div className="flex items-center justify-between py-2 px-3 border border-border rounded-sm">
                    <span className="text-xs text-stone">Leads this week</span>
                    <span className="text-xs font-medium text-ink">14</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section id="how-it-works" className="py-20 px-6 bg-surface-alt border-y border-border">
        <div className="max-w-content mx-auto">
          <h2 className="font-display text-3xl font-semibold text-ink animate-on-enter">
            How it works.
          </h2>
          <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-8">
            {STEPS.map((step, index) => (
              <div key={step.title} className={`animate-on-enter stagger-${String(index + 1)}`}>
                <div className="w-10 h-10 rounded-md bg-ink flex items-center justify-center">
                  <span className="font-mono text-sm font-bold text-white">{String(index + 1)}</span>
                </div>
                <h3 className="mt-4 font-body text-base font-semibold text-ink">{step.title}</h3>
                <p className="mt-2 text-sm text-stone leading-relaxed">{step.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── What Wix Users Get ── */}
      <section className="py-20 px-6">
        <div className="max-w-content mx-auto">
          <h2 className="font-display text-3xl font-semibold text-ink animate-on-enter">
            What Wix users get.
          </h2>
          <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {FEATURES.map((feature, index) => (
              <div
                key={feature.title}
                className={`card p-5 animate-on-enter stagger-${String((index % 3) + 1)}`}
              >
                <span className="inline-block w-2 h-2 rounded-full bg-signal mb-3" />
                <h3 className="font-body text-sm font-semibold text-ink">{feature.title}</h3>
                <p className="mt-1 text-xs text-stone leading-relaxed">{feature.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Before / After ── */}
      <section className="py-20 px-6 bg-surface-alt border-y border-border">
        <div className="max-w-content mx-auto">
          <h2 className="font-display text-3xl font-semibold text-ink animate-on-enter">
            Before and after.
          </h2>
          <div className="mt-10 overflow-x-auto animate-on-enter stagger-2">
            <table className="w-full text-sm border border-border rounded-md">
              <thead>
                <tr className="bg-surface-alt border-b border-border">
                  <th className="text-left py-3 px-5 font-body font-medium text-stone w-1/2">Without HawkLeads</th>
                  <th className="text-left py-3 px-5 font-body font-medium text-ink w-1/2">With HawkLeads</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-border">
                  <td className="py-3 px-5 text-stone">Wix form sends you an email. Every lead looks the same.</td>
                  <td className="py-3 px-5 text-ink font-medium">HawkLeads scores every visitor. You know who to call first.</td>
                </tr>
                <tr className="border-b border-border">
                  <td className="py-3 px-5 text-stone">No context about budget, timeline, or urgency.</td>
                  <td className="py-3 px-5 text-ink font-medium">Every lead arrives with answers and a 0 to 100 score.</td>
                </tr>
                <tr className="border-b border-border last:border-b-0">
                  <td className="py-3 px-5 text-stone">You call every lead in the order they submitted.</td>
                  <td className="py-3 px-5 text-ink font-medium">Your dashboard sorts leads by score. Hot leads get called first.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="py-20 px-6">
        <div className="max-w-content mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="animate-on-enter">
            <h2 className="font-display text-3xl font-semibold text-ink">
              Common questions from Wix users.
            </h2>
            <p className="mt-3 text-base text-stone">
              If yours is not here, reach out at support@hawkleads.io.
            </p>
          </div>
          <div className="animate-on-enter stagger-2">
            {FAQ_ITEMS.map((item, index) => (
              <FaqAccordionItem
                key={item.question}
                item={item}
                isOpen={openFaq === index}
                onToggle={() => handleFaqToggle(index)}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section className="bg-black py-24 px-6">
        <div className="max-w-content mx-auto text-center animate-on-enter">
          <h2 className="font-display text-4xl font-semibold text-white">
            Start scoring your Wix leads today.
          </h2>
          <p className="mt-4 text-base text-stone-light max-w-lg mx-auto">
            One-click install. Every lead scored 0 to 100. Hot leads trigger instant alerts.
            30 days free.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <a
              href={WIX_APP_MARKET_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center rounded-md bg-white text-ink font-body font-medium text-base h-12 px-6 transition-all duration-fast hover:bg-paper focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-ink"
            >
              Install on Wix
            </a>
            <Link
              href="/pricing"
              className="inline-flex items-center justify-center rounded-md border border-white/20 text-white/80 font-body font-medium text-sm h-12 px-5 transition-all duration-fast hover:border-white/40 hover:text-white focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-ink"
            >
              View Pricing
            </Link>
          </div>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-stone-light">
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
              No code needed
            </span>
          </div>
        </div>
      </section>
    </div>
  );
}
