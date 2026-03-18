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

      {/* ── Final CTA ── */}
      <section className="bg-ink py-24 px-6">
        <div className="max-w-content mx-auto text-center animate-on-enter">
          <h2 className="font-display text-4xl font-semibold text-white">
            Stop guessing. Start closing.
          </h2>
          <div className="mt-8">
            <Link
              href="/signup"
              className="inline-flex items-center justify-center rounded-md bg-white text-ink font-body font-medium text-base h-12 px-6 transition-all duration-fast hover:bg-paper focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-ink"
            >
              Start scoring your leads
            </Link>
          </div>
          <p className="mt-4 text-sm text-stone-light">
            Set up in 5 minutes. 14 days free. No credit card.
          </p>
        </div>
      </section>
    </div>
  );
}
