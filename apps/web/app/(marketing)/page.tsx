'use client';

import Link from 'next/link';
import { useState, useCallback, useRef } from 'react';

import { useInViewAnimations } from '@/lib/use-in-view';

import { AnthemPlayer } from './_components/AnthemPlayer';
import { ComparisonTable } from './_components/ComparisonTable';
import { HowItWorks } from './_components/HowItWorks';
import { FeaturesSection } from './_components/FeaturesSection';
import { BeforeAfter } from './_components/BeforeAfter';
import { TrustBar } from './_components/TrustSignals';
import { FaqAccordion } from './_components/FaqAccordion';
import { PricingToggle } from './_components/PricingToggle';
import { HeroIllustration } from './_components/HeroIllustration';
import { PLANS, STATS, TEMPLATES_PREVIEW } from './_constants';

export default function LandingPage(): React.ReactElement {
  const [isAnnual, setIsAnnual] = useState(false);
  const ctaSectionRef = useRef<HTMLElement>(null);
  useInViewAnimations();

  const handleBeatDrop = useCallback((): void => {
    const section = ctaSectionRef.current;
    if (!section) return;
    section.classList.add('cta-beat-drop');
    setTimeout(() => {
      section.classList.remove('cta-beat-drop');
    }, 1200);
  }, []);

  return (
    <div>
      {/* ── Hero (dark) ── */}
      <section className="bg-ink pt-28 pb-20 lg:pt-36 lg:pb-28 px-6 relative overflow-hidden">
        <div className="max-w-content mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          <div className="animate-on-enter">
            <p className="text-xs font-body font-semibold uppercase tracking-widest text-signal mb-4">
              Lead scoring for service businesses
            </p>
            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-semibold text-white leading-[1.1] tracking-tight">
              Your competitor is calling your best leads first.
            </h1>
            <p className="mt-6 text-lg text-white/60 leading-relaxed max-w-[520px]">
              Know the budget, timeline, and intent of every lead before you pick up the phone.
              The ones worth $10k get a call in minutes. The rest can wait.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row items-start gap-3">
              <Link
                href="/signup"
                className="inline-flex items-center justify-center rounded-md bg-white text-ink font-body font-semibold text-base h-12 px-7 transition-all duration-fast hover:bg-white/90 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-ink"
              >
                Start Free Trial
              </Link>
              <a
                href="#how-it-works"
                className="inline-flex items-center justify-center rounded-md border border-white/20 text-white/70 font-body font-medium text-sm h-12 px-6 transition-all duration-fast hover:border-white/40 hover:text-white"
              >
                See how it works
              </a>
            </div>
            <p className="mt-4 text-sm text-white/40">
              30 days free. No credit card required.
            </p>
          </div>
          <div className="hidden lg:block">
            <HeroIllustration />
          </div>
        </div>

        {/* Trust marquee inside dark hero */}
        <div className="mt-16">
          <TrustBar />
        </div>
      </section>

      {/* ── Stats (warm light) ── */}
      <section className="py-20 lg:py-28 px-6">
        <div className="max-w-content mx-auto">
          <p className="text-xs font-body font-semibold uppercase tracking-widest text-signal text-center mb-3">
            The lead quality problem
          </p>
          <h2 className="font-display text-3xl lg:text-4xl font-semibold text-ink text-center">
            Most leads are not ready for sales.
          </h2>
          <div className="mt-14 grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8">
            {STATS.map((stat, index) => (
              <div key={stat.number} className={`text-center animate-on-enter stagger-${String(index + 1)}`}>
                <div className="font-display text-6xl lg:text-7xl font-bold text-ink tracking-tight">
                  {stat.number}
                </div>
                <p className="mt-3 text-sm text-stone max-w-[260px] mx-auto leading-relaxed">
                  {stat.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <ComparisonTable />

      {/* ── How It Works (dark) ── */}
      <HowItWorks />

      {/* ── Widget Preview ── */}
      <section className="py-20 lg:py-28 px-6">
        <div className="max-w-content mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          <div className="animate-on-enter">
            <p className="text-xs font-body font-semibold uppercase tracking-widest text-signal mb-3">
              Smart qualification
            </p>
            <h2 className="font-display text-3xl lg:text-4xl font-semibold text-ink leading-tight">
              Visitors qualify themselves.
            </h2>
            <p className="mt-4 text-base text-stone leading-relaxed max-w-[460px]">
              A 30-second tappable flow on your site. Not a form. Visitors tell you their
              budget, timeline, and service needs. You get a score and a call list.
            </p>
            <p className="mt-4 text-sm text-ink font-medium">
              You will get fewer submissions. Every one of them will be worth your time.
            </p>
          </div>
          <div className="animate-slide-right">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/widget-mockup.svg"
              alt="HawkLeads widget on a plumbing website showing a multi-step qualifying flow"
              className="w-full h-auto rounded-lg border border-border"
              width={1200}
              height={720}
            />
          </div>
        </div>
      </section>

      <FeaturesSection />
      <BeforeAfter />

      {/* ── Pricing ── */}
      <section className="py-24 lg:py-32 px-6 bg-surface-alt border-y border-border">
        <div className="max-w-content mx-auto">
          <div className="text-center">
            <p className="text-xs font-body font-semibold uppercase tracking-widest text-signal mb-3">
              Pricing
            </p>
            <h2 className="font-display text-3xl lg:text-4xl font-semibold text-ink">
              Simple, transparent pricing.
            </h2>
            <p className="mt-3 text-base text-stone">
              30-day free trial on every plan. No credit card required.
            </p>
            <PricingToggle
              isAnnual={isAnnual}
              onToggle={() => setIsAnnual((prev) => !prev)}
            />
          </div>
          <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {PLANS.map((plan, index) => (
              <div
                key={plan.name}
                className={`card flex flex-col animate-on-enter stagger-${String(index + 1)} ${
                  plan.highlighted ? 'border-signal border-2 relative' : ''
                }`}
              >
                {plan.highlighted && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-signal text-white text-xs font-body font-semibold px-3 py-0.5 rounded-sm">
                    Most Popular
                  </span>
                )}
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
                      <svg className="w-4 h-4 text-signal flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                      {feature}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/signup"
                  className={`mt-6 w-full text-center ${plan.highlighted ? 'btn-signal' : 'btn-secondary'}`}
                >
                  Start Free Trial
                </Link>
              </div>
            ))}
          </div>
          <p className="mt-8 text-center text-sm text-stone">
            One extra closed deal per month pays for a full year of HawkLeads.
          </p>
          <p className="mt-2 text-center text-sm text-stone-light">
            <Link href="/pricing" className="underline hover:text-ink transition-colors duration-fast">
              Compare all plan features
            </Link>
          </p>
        </div>
      </section>

      {/* ── Templates ── */}
      <section className="py-24 lg:py-28 px-6">
        <div className="max-w-content mx-auto">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-body font-semibold uppercase tracking-widest text-signal mb-3">
                Templates
              </p>
              <h2 className="font-display text-3xl lg:text-4xl font-semibold text-ink">
                Go live in 2 minutes.
              </h2>
            </div>
            <Link
              href="/templates"
              className="text-sm text-signal font-medium hover:text-signal-hover transition-colors duration-fast whitespace-nowrap"
            >
              See all templates
            </Link>
          </div>
          <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-6">
            {TEMPLATES_PREVIEW.map((template, index) => (
              <Link
                key={template.name}
                href="/templates"
                className={`card-interactive block animate-on-enter stagger-${String(index + 1)}`}
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

      {/* ── FAQ (warm light) ── */}
      <section className="py-24 lg:py-28 px-6 bg-surface-alt border-y border-border">
        <div className="max-w-content mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
          <div>
            <p className="text-xs font-body font-semibold uppercase tracking-widest text-signal mb-3">
              FAQ
            </p>
            <h2 className="font-display text-3xl lg:text-4xl font-semibold text-ink">
              Common questions.
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

      {/* ── Final CTA (dark) ── */}
      <section ref={ctaSectionRef} className="bg-ink py-24 lg:py-32 px-6 relative overflow-hidden">
        <div className="cta-flash-overlay" />
        <div className="cta-bolt-container">
          <svg className="cta-bolt-svg" viewBox="0 0 1400 800" fill="none" preserveAspectRatio="none">
            <path className="cta-bolt-path" d="M-50 380 L200 370 L280 340 L350 390 L500 360 L580 320 L650 380 L800 350 L900 310 L1000 370 L1100 340 L1200 380 L1450 360" stroke="#2563EB" strokeWidth="3" strokeLinecap="round" fill="none" />
            <path className="cta-bolt-path-glow" d="M-50 380 L200 370 L280 340 L350 390 L500 360 L580 320 L650 380 L800 350 L900 310 L1000 370 L1100 340 L1200 380 L1450 360" stroke="#60A5FA" strokeWidth="8" strokeLinecap="round" fill="none" opacity="0.4" />
          </svg>
        </div>
        <div className="cta-shockwave" />
        <div className="max-w-content mx-auto animate-on-enter">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            <div>
              <p className="text-xs font-body font-semibold uppercase tracking-widest text-signal mb-4">
                Get started today
              </p>
              <h2 className="font-display text-4xl lg:text-5xl font-semibold text-white leading-tight tracking-tight">
                Every hour you wait, someone else closes the deal.
              </h2>
              <p className="mt-6 text-lg text-white/50 leading-relaxed max-w-[440px]">
                Your next $10,000 client is on your website right now.
                The only question is whether you call them before your competitor does.
              </p>
              <div className="mt-10 flex flex-col sm:flex-row items-start gap-3">
                <Link
                  href="/signup"
                  className="inline-flex items-center justify-center rounded-md bg-white text-ink font-body font-semibold text-base h-12 px-7 transition-all duration-fast hover:bg-white/90 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-ink"
                >
                  Start scoring your leads
                </Link>
                <a
                  href="#how-it-works"
                  className="inline-flex items-center justify-center rounded-md border border-white/20 text-white/70 font-body font-medium text-sm h-12 px-5 transition-all duration-fast hover:border-white/40 hover:text-white"
                >
                  See how it works
                </a>
              </div>
              <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-white/40">
                <span className="flex items-center gap-1.5">
                  <svg className="w-3.5 h-3.5 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  2-minute setup
                </span>
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
              </div>
            </div>

            <div className="flex items-center justify-center animate-slide-right">
              <AnthemPlayer onBeatDrop={handleBeatDrop} />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
