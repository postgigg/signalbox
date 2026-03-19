'use client';

import Link from 'next/link';
import { useState } from 'react';

import { useInViewAnimations } from '@/lib/use-in-view';

import { StatsSection } from './_components/StatsSection';
import { ComparisonTable } from './_components/ComparisonTable';
import { HowItWorks } from './_components/HowItWorks';
import { IndustryHooks } from './_components/IndustryHooks';
import { FeaturesSection } from './_components/FeaturesSection';
import { BeforeAfter } from './_components/BeforeAfter';
import { TrustSignals } from './_components/TrustSignals';
import { FaqAccordion } from './_components/FaqAccordion';
import { PricingToggle } from './_components/PricingToggle';
import { PLANS, TEMPLATES_PREVIEW } from './_constants';

export default function LandingPage(): React.ReactElement {
  const [isAnnual, setIsAnnual] = useState(false);
  useInViewAnimations();

  return (
    <div>
      {/* ── Hero ── */}
      <section className="pt-32 pb-24 px-6">
        <div className="max-w-content mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div className="animate-on-enter">
            <h1 className="font-display text-5xl font-semibold text-ink leading-tight">
              Stop losing deals to slower follow-up.
            </h1>
            <p className="mt-6 text-lg text-stone leading-relaxed max-w-[520px]">
              Automatically score every lead and know exactly who to call first.
              Set up in 5 minutes.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row items-start gap-3">
              <Link href="/signup" className="btn-primary-lg">
                Start Free Trial
              </Link>
              <a href="#how-it-works" className="btn-secondary self-center">
                See how it works
              </a>
            </div>
            <p className="mt-3 text-sm text-stone-light">
              14 days free. No credit card.
            </p>
          </div>
          <div className="hidden lg:block animate-slide-right">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/hero-dashboard.svg"
              alt="SignalBox dashboard showing a scored lead list with hot, warm, and cold tiers"
              className="w-full h-auto rounded-lg border border-border shadow-lg"
              width={560}
              height={400}
            />
          </div>
        </div>
      </section>

      <StatsSection />
      <ComparisonTable />
      <HowItWorks />

      {/* ── Visual Break: Widget Preview ── */}
      <section className="py-20 px-6">
        <div className="max-w-content mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="animate-on-enter">
            <h2 className="font-display text-3xl font-semibold text-ink">
              What your visitors see.
            </h2>
            <p className="mt-4 text-base text-stone leading-relaxed max-w-[460px]">
              A short, tappable flow. Not a form. Visitors tell you their budget,
              timeline, and service needs without thinking twice.
            </p>
            <p className="mt-3 text-sm text-stone-light">
              Every answer feeds into a lead score you see instantly in your dashboard.
            </p>
          </div>
          <div className="animate-slide-right">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/widget-mockup.svg"
              alt="SignalBox widget on a plumbing website showing a multi-step qualifying flow"
              className="w-full h-auto rounded-lg border border-border"
              width={1200}
              height={720}
            />
          </div>
        </div>
      </section>

      <IndustryHooks />
      <FeaturesSection />
      <BeforeAfter />

      {/* ── Pricing ── */}
      <section className="py-24 px-6 bg-surface-alt border-y border-border">
        <div className="max-w-content mx-auto">
          <div className="text-center">
            <h2 className="font-display text-3xl font-semibold text-ink">
              Simple pricing.
            </h2>
            <p className="mt-3 text-base text-stone">
              14-day free trial on every plan. No credit card required.
            </p>
            <PricingToggle
              isAnnual={isAnnual}
              onToggle={() => setIsAnnual((prev) => !prev)}
            />
          </div>
          <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6">
            {PLANS.map((plan, index) => (
              <div
                key={plan.name}
                className={`card flex flex-col animate-on-enter stagger-${index + 1} ${
                  plan.highlighted ? 'border-signal border-2' : ''
                }`}
              >
                <div>
                  <h3 className="font-display text-xl font-semibold text-ink">
                    {plan.name}
                  </h3>
                  <p className="mt-1 text-sm text-stone">{plan.description}</p>
                  <p className="mt-1 text-xs text-stone-light">{plan.bestFor}</p>
                </div>
                <div className="mt-4">
                  <span className="font-display text-4xl font-bold text-ink">
                    ${isAnnual ? plan.annualPrice : plan.monthlyPrice}
                  </span>
                  <span className="text-sm text-stone">/mo</span>
                  {isAnnual && (
                    <span className="ml-2 text-xs text-stone-light">billed annually</span>
                  )}
                </div>
                <ul className="mt-5 space-y-2 flex-1">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2 text-sm text-stone">
                      <svg
                        className="w-4 h-4 text-signal flex-shrink-0 mt-0.5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      {feature}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/signup"
                  className={`mt-6 w-full text-center ${
                    plan.highlighted ? 'btn-signal' : 'btn-secondary'
                  }`}
                >
                  Start Free Trial
                </Link>
              </div>
            ))}
          </div>
          <p className="mt-6 text-center text-sm text-stone">
            Close just one extra deal per month and SignalBox pays for itself.
          </p>
          <p className="mt-2 text-center text-sm text-stone-light">
            <Link href="/pricing" className="underline hover:text-ink transition-colors duration-fast">
              Compare all plan features
            </Link>
          </p>
        </div>
      </section>

      {/* ── Templates ── */}
      <section className="py-24 px-6">
        <div className="max-w-content mx-auto">
          <div className="flex items-end justify-between gap-4">
            <h2 className="font-display text-3xl font-semibold text-ink">
              Pre-built templates.
            </h2>
            <Link
              href="/templates"
              className="text-sm text-signal font-medium hover:text-signal-hover transition-colors duration-fast whitespace-nowrap"
            >
              See all templates
            </Link>
          </div>
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-6">
            {TEMPLATES_PREVIEW.map((template, index) => (
              <Link
                key={template.name}
                href="/templates"
                className={`card-interactive block animate-on-enter stagger-${index + 1}`}
              >
                <h3 className="font-body text-base font-semibold text-ink">
                  {template.name}
                </h3>
                <p className="mt-1 text-sm text-stone">
                  {template.steps} steps
                </p>
                <p className="mt-2 text-xs text-stone-light">{template.topics}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="py-24 px-6 bg-surface-alt border-y border-border">
        <div className="max-w-content mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div>
            <h2 className="font-display text-3xl font-semibold text-ink">
              Questions.
            </h2>
            <p className="mt-3 text-base text-stone">
              If yours is not here, reach out. We respond quickly.
            </p>
          </div>
          <div>
            <FaqAccordion />
          </div>
        </div>
      </section>

      <TrustSignals />

      {/* ── Guarantee ── */}
      <section className="py-20 px-6">
        <div className="max-w-content mx-auto animate-on-enter">
          <div className="card border-2 border-signal p-8 sm:p-12 text-center max-w-[720px] mx-auto">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-pill bg-signal-light mb-6">
              <svg className="w-8 h-8 text-signal" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
              </svg>
            </div>
            <h2 className="font-display text-3xl font-semibold text-ink">
              The 5 Hot Leads Guarantee
            </h2>
            <p className="mt-4 text-base text-stone leading-relaxed max-w-[520px] mx-auto">
              If SignalBox does not identify at least 5 hot leads in your first 30 days,
              we will extend your subscription by 6 months. Free. No questions asked.
            </p>
            <p className="mt-2 text-sm text-signal font-medium">
              That is $600 in value, on us.
            </p>
            <div className="mt-8">
              <Link href="/signup" className="btn-primary-lg">
                Start Free Trial (Zero Risk)
              </Link>
            </div>
            <p className="mt-3 text-xs text-stone">
              14-day trial included. Guarantee applies to all paid plans.
            </p>
          </div>
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section className="bg-ink py-24 px-6">
        <div className="max-w-content mx-auto animate-on-enter">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div>
              <h2 className="font-display text-4xl font-semibold text-white">
                Stop guessing. Start closing.
              </h2>
              <p className="mt-4 text-base text-stone-light leading-relaxed max-w-[440px]">
                Your next hot lead is already on your site.
                The only question is whether you call them first.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row items-start gap-3">
                <Link
                  href="/signup"
                  className="inline-flex items-center justify-center rounded-md bg-white text-ink font-body font-medium text-base h-12 px-6 transition-all duration-fast hover:bg-paper focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-ink"
                >
                  Start scoring your leads
                </Link>
                <a
                  href="#how-it-works"
                  className="inline-flex items-center justify-center rounded-md border border-white/20 text-white/80 font-body font-medium text-sm h-12 px-5 transition-all duration-fast hover:border-white/40 hover:text-white focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-ink"
                >
                  See how it works
                </a>
              </div>
              <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-stone-light">
                <span className="flex items-center gap-1.5">
                  <svg className="w-3.5 h-3.5 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  5-minute setup
                </span>
                <span className="flex items-center gap-1.5">
                  <svg className="w-3.5 h-3.5 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  14-day free trial
                </span>
                <span className="flex items-center gap-1.5">
                  <svg className="w-3.5 h-3.5 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  No credit card
                </span>
              </div>
            </div>

            {/* Mini dashboard preview */}
            <div className="hidden lg:block animate-slide-right" aria-hidden="true">
              <div className="step-illustration">
                <svg
                  viewBox="0 0 280 180"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-full h-auto"
                >
                  {/* Card frame */}
                  <rect x="16" y="8" width="248" height="164" rx="8" fill="#1E293B" stroke="#334155" strokeWidth="1" />
                  <rect x="16" y="8" width="248" height="24" rx="8" fill="#1E293B" />
                  <rect x="16" y="30" width="248" height="1" fill="#334155" />

                  {/* Header */}
                  <text x="28" y="24" fontSize="9" fontFamily="var(--font-body)" fill="#94A3B8" fontWeight="500">Call list</text>
                  <text x="212" y="24" fontSize="8" fontFamily="var(--font-body)" fill="#475569">Score</text>

                  {/* Row 1 — HOT 92 */}
                  <g className="cta-row-1">
                    <rect x="24" y="38" width="232" height="28" rx="4" fill="#1E293B" />
                    <circle cx="40" cy="52" r="8" fill="#DC2626" opacity="0.15" />
                    <text x="37" y="55" fontSize="8" fontFamily="var(--font-body)" fill="#DC2626" fontWeight="600">S</text>
                    <rect x="56" y="47" width="60" height="5" rx="2.5" fill="#E2E8F0" opacity="0.6" />
                    <rect x="56" y="55" width="40" height="3.5" rx="1.75" fill="#334155" />
                    <rect x="130" y="47" width="28" height="13" rx="6.5" fill="#DC2626" opacity="0.15" />
                    <text x="137" y="56" fontSize="7" fontFamily="var(--font-body)" fill="#DC2626" fontWeight="600">Hot</text>
                    <rect x="208" y="48" width="40" height="8" rx="4" fill="#334155" />
                    <rect x="208" y="48" width="36" height="8" rx="4" fill="#DC2626" className="cta-bar-1" />
                    <text x="215" y="55" fontSize="7" fontFamily="var(--font-mono)" fill="#FFFFFF" fontWeight="600">92</text>
                  </g>

                  {/* Row 2 — HOT 85 */}
                  <g className="cta-row-2">
                    <rect x="24" y="70" width="232" height="28" rx="4" fill="#1E293B" />
                    <circle cx="40" cy="84" r="8" fill="#DC2626" opacity="0.15" />
                    <text x="37" y="87" fontSize="8" fontFamily="var(--font-body)" fill="#DC2626" fontWeight="600">R</text>
                    <rect x="56" y="79" width="52" height="5" rx="2.5" fill="#E2E8F0" opacity="0.6" />
                    <rect x="56" y="87" width="36" height="3.5" rx="1.75" fill="#334155" />
                    <rect x="130" y="79" width="28" height="13" rx="6.5" fill="#DC2626" opacity="0.15" />
                    <text x="137" y="88" fontSize="7" fontFamily="var(--font-body)" fill="#DC2626" fontWeight="600">Hot</text>
                    <rect x="208" y="80" width="40" height="8" rx="4" fill="#334155" />
                    <rect x="208" y="80" width="30" height="8" rx="4" fill="#DC2626" opacity="0.8" className="cta-bar-2" />
                    <text x="214" y="87" fontSize="7" fontFamily="var(--font-mono)" fill="#FFFFFF" fontWeight="600">85</text>
                  </g>

                  {/* Row 3 — WARM 64 */}
                  <g className="cta-row-3">
                    <rect x="24" y="102" width="232" height="28" rx="4" fill="#1E293B" />
                    <circle cx="40" cy="116" r="8" fill="#CA8A04" opacity="0.15" />
                    <text x="36" y="119" fontSize="8" fontFamily="var(--font-body)" fill="#CA8A04" fontWeight="600">M</text>
                    <rect x="56" y="111" width="48" height="5" rx="2.5" fill="#E2E8F0" opacity="0.6" />
                    <rect x="56" y="119" width="32" height="3.5" rx="1.75" fill="#334155" />
                    <rect x="130" y="111" width="36" height="13" rx="6.5" fill="#CA8A04" opacity="0.15" />
                    <text x="134" y="120" fontSize="7" fontFamily="var(--font-body)" fill="#CA8A04" fontWeight="600">Warm</text>
                    <rect x="208" y="112" width="40" height="8" rx="4" fill="#334155" />
                    <rect x="208" y="112" width="22" height="8" rx="4" fill="#CA8A04" className="cta-bar-3" />
                    <text x="212" y="119" fontSize="7" fontFamily="var(--font-mono)" fill="#FFFFFF" fontWeight="600">64</text>
                  </g>

                  {/* Row 4 — COLD 18 */}
                  <g className="cta-row-4">
                    <rect x="24" y="134" width="232" height="28" rx="4" fill="#1E293B" />
                    <circle cx="40" cy="148" r="8" fill="#94A3B8" opacity="0.1" />
                    <text x="37" y="151" fontSize="8" fontFamily="var(--font-body)" fill="#64748B" fontWeight="600">J</text>
                    <rect x="56" y="143" width="44" height="5" rx="2.5" fill="#E2E8F0" opacity="0.4" />
                    <rect x="56" y="151" width="28" height="3.5" rx="1.75" fill="#334155" />
                    <rect x="130" y="143" width="30" height="13" rx="6.5" fill="#94A3B8" opacity="0.1" />
                    <text x="136" y="152" fontSize="7" fontFamily="var(--font-body)" fill="#64748B" fontWeight="600">Cold</text>
                    <rect x="208" y="144" width="40" height="8" rx="4" fill="#334155" />
                    <rect x="208" y="144" width="8" height="8" rx="4" fill="#64748B" className="cta-bar-4" />
                    <text x="210" y="151" fontSize="7" fontFamily="var(--font-mono)" fill="#FFFFFF" fontWeight="600">18</text>
                  </g>
                </svg>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Built by ── */}
      <div className="bg-ink border-t border-white/5 py-6 px-6 text-center">
        <p className="text-sm text-stone-light font-body">
          Built by a human, with a little help from AI.
        </p>
      </div>
    </div>
  );
}
