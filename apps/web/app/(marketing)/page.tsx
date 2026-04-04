'use client';

import Link from 'next/link';
import { useState, useCallback, useRef } from 'react';

import { useInViewAnimations } from '@/lib/use-in-view';

import { AnthemPlayer } from './_components/AnthemPlayer';
import { HowItWorks } from './_components/HowItWorks';
import { FeaturesSection } from './_components/FeaturesSection';
import { TrustSignals } from './_components/TrustSignals';
import { FaqAccordion } from './_components/FaqAccordion';
import { PricingToggle } from './_components/PricingToggle';
import { HeroIllustration } from './_components/HeroIllustration';
import { STATS, PLANS, COMPARISON_ROWS, TEMPLATES_PREVIEW } from './_constants';

export default function LandingPage(): React.ReactElement {
  const [isAnnual, setIsAnnual] = useState(false);
  const ctaSectionRef = useRef<HTMLElement>(null);
  useInViewAnimations();

  const handleBeatDrop = useCallback((): void => {
    const section = ctaSectionRef.current;
    if (!section) return;
    section.classList.add('cta-beat-drop');
    setTimeout(() => { section.classList.remove('cta-beat-drop'); }, 1200);
  }, []);

  return (
    <div>
      {/* ── Hero ── */}
      <section className="bg-black pt-36 pb-20 px-6">
        <div className="max-w-content mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div className="animate-on-enter">
            <p className="text-xs font-body font-semibold uppercase tracking-[0.15em] text-zinc-500 mb-5">
              Lead scoring for service businesses
            </p>
            <h1 className="font-display text-5xl lg:text-6xl font-semibold text-white leading-[1.08]">
              Your competitor is calling your best leads first.
            </h1>
            <p className="mt-6 text-lg text-zinc-400 leading-relaxed max-w-[520px]">
              Know the budget, timeline, and intent of every lead before you pick up the phone.
              The ones worth $10k get a call in minutes. The rest can wait.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row items-start gap-3">
              <Link href="/signup" className="inline-flex items-center justify-center rounded-md bg-white text-black font-body font-medium text-base h-12 px-7 transition-all duration-fast hover:bg-zinc-100 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-black">
                Start Free Trial
              </Link>
              <a href="#how-it-works" className="inline-flex items-center justify-center rounded-md border border-zinc-700 text-zinc-300 font-body font-medium text-sm h-12 px-6 transition-all duration-fast hover:border-zinc-500 hover:text-white">
                See how it works
              </a>
            </div>
            <p className="mt-4 text-sm text-zinc-600">30 days free. No credit card.</p>
          </div>
          <div className="hidden lg:block animate-slide-right">
            <HeroIllustration />
          </div>
        </div>
      </section>

      {/* ── Stats ── */}
      <section className="bg-black pb-24 px-6">
        <div className="max-w-content mx-auto">
          <div className="border-t border-zinc-800 pt-16" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-6 text-center">
            {STATS.map((stat, index) => (
              <div key={stat.number} className={`animate-on-enter stagger-${String(index + 1)}`}>
                <div className="font-display text-5xl font-bold text-white">{stat.number}</div>
                <p className="mt-3 text-sm text-zinc-500 max-w-[260px] mx-auto">{stat.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <HowItWorks />

      {/* ── Widget Preview ── */}
      <section className="bg-black py-24 px-6">
        <div className="max-w-content mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="animate-on-enter">
            <p className="text-xs font-body font-semibold uppercase tracking-[0.15em] text-zinc-500 mb-4">How it feels</p>
            <h2 className="font-display text-3xl font-semibold text-white">Visitors qualify themselves.</h2>
            <p className="mt-4 text-base text-zinc-400 leading-relaxed max-w-[460px]">
              A 30-second tappable flow on your site. Not a form. Visitors tell you their
              budget, timeline, and service needs. You get a score and a call list.
            </p>
            <p className="mt-3 text-sm text-zinc-300 font-medium">
              Fewer submissions. Every one worth your time.
            </p>
          </div>
          <div className="animate-slide-right">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/widget-mockup.svg" alt="HawkLeads widget on a plumbing website showing a multi-step qualifying flow" className="w-full h-auto rounded-lg border border-zinc-800" width={1200} height={720} />
          </div>
        </div>
      </section>

      <FeaturesSection />

      {/* ── Comparison ── */}
      <section className="bg-black py-24 px-6">
        <div className="max-w-content mx-auto">
          <p className="text-xs font-body font-semibold uppercase tracking-[0.15em] text-zinc-500 mb-4">Why not just a form</p>
          <h2 className="font-display text-3xl font-semibold text-white">Forms collect names. HawkLeads scores intent.</h2>
          <div className="mt-10 overflow-x-auto">
            <table className="w-full text-sm rounded-md overflow-hidden">
              <thead>
                <tr className="bg-zinc-900">
                  <th className="text-left py-3.5 px-5 font-body font-medium text-zinc-500">Regular contact forms</th>
                  <th className="text-left py-3.5 px-5 font-body font-medium text-white">HawkLeads</th>
                </tr>
              </thead>
              <tbody>
                {COMPARISON_ROWS.map((row) => (
                  <tr key={row.form} className="border-t border-zinc-800">
                    <td className="py-3.5 px-5 text-zinc-500">{row.form}</td>
                    <td className="py-3.5 px-5 text-zinc-200 font-medium">{row.hawkleads}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ── Pricing ── */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-content mx-auto">
          <div className="text-center">
            <p className="text-xs font-body font-semibold uppercase tracking-[0.15em] text-stone mb-4">Pricing</p>
            <h2 className="font-display text-3xl font-semibold text-ink">Simple pricing. Cancel anytime.</h2>
            <p className="mt-3 text-base text-stone">30-day free trial on every plan. No credit card required.</p>
            <PricingToggle isAnnual={isAnnual} onToggle={() => setIsAnnual((prev) => !prev)} />
          </div>
          <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {PLANS.map((plan, index) => (
              <div key={plan.name} className={`bg-white border rounded-md p-5 flex flex-col animate-on-enter stagger-${String(index + 1)} ${plan.highlighted ? 'border-ink border-2 ring-1 ring-ink/5' : 'border-border'}`}>
                <h3 className="font-display text-xl font-semibold text-ink">{plan.name}</h3>
                <p className="mt-1 text-sm text-stone">{plan.description}</p>
                <div className="mt-4">
                  <span className="font-display text-4xl font-bold text-ink">${isAnnual ? plan.annualPrice : plan.monthlyPrice}</span>
                  <span className="text-sm text-stone">/mo</span>
                  {isAnnual && <span className="ml-2 text-xs text-stone-light">billed annually</span>}
                </div>
                <ul className="mt-5 space-y-2 flex-1">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2 text-sm text-stone">
                      <svg className="w-4 h-4 text-ink flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                      {feature}
                    </li>
                  ))}
                </ul>
                <Link href="/signup" className={`mt-6 w-full text-center text-sm ${plan.highlighted ? 'btn-primary' : 'btn-secondary'}`}>Start Free Trial</Link>
              </div>
            ))}
          </div>
          <p className="mt-8 text-center text-sm text-stone">
            One extra closed deal per month pays for a full year.{' '}
            <Link href="/pricing" className="underline hover:text-ink transition-colors duration-fast">Compare all features</Link>
          </p>
        </div>
      </section>

      {/* ── Templates ── */}
      <section className="bg-black py-24 px-6">
        <div className="max-w-content mx-auto">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-body font-semibold uppercase tracking-[0.15em] text-zinc-500 mb-4">Templates</p>
              <h2 className="font-display text-3xl font-semibold text-white">Start with a template. Go live in two minutes.</h2>
            </div>
            <Link href="/templates" className="text-sm text-zinc-400 font-medium hover:text-white transition-colors duration-fast whitespace-nowrap">See all</Link>
          </div>
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-5">
            {TEMPLATES_PREVIEW.map((template, index) => (
              <Link key={template.name} href="/templates" className={`block rounded-md border border-zinc-800 bg-zinc-900 p-5 transition-colors duration-fast hover:border-zinc-700 animate-on-enter stagger-${String(index + 1)}`}>
                <h3 className="font-body text-base font-semibold text-white">{template.name}</h3>
                <p className="mt-1 text-sm text-zinc-400">{template.steps} steps</p>
                <p className="mt-2 text-xs text-zinc-600">{template.topics}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-content mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div>
            <p className="text-xs font-body font-semibold uppercase tracking-[0.15em] text-stone mb-4">FAQ</p>
            <h2 className="font-display text-3xl font-semibold text-ink">Questions.</h2>
            <p className="mt-3 text-base text-stone">If yours is not here, reach out. We respond quickly.</p>
          </div>
          <FaqAccordion />
        </div>
      </section>

      <TrustSignals />

      {/* ── CTA ── */}
      <section ref={ctaSectionRef} className="bg-black py-24 px-6 relative overflow-hidden">
        <div className="cta-flash-overlay" />
        <div className="cta-bolt-container">
          <svg className="cta-bolt-svg" viewBox="0 0 1400 800" fill="none" preserveAspectRatio="none">
            <path className="cta-bolt-path" d="M-50 380 L200 370 L280 340 L350 390 L500 360 L580 320 L650 380 L800 350 L900 310 L1000 370 L1100 340 L1200 380 L1450 360" stroke="#2563EB" strokeWidth="3" strokeLinecap="round" fill="none" />
            <path className="cta-bolt-path-glow" d="M-50 380 L200 370 L280 340 L350 390 L500 360 L580 320 L650 380 L800 350 L900 310 L1000 370 L1100 340 L1200 380 L1450 360" stroke="#60A5FA" strokeWidth="8" strokeLinecap="round" fill="none" opacity="0.4" />
          </svg>
        </div>
        <div className="cta-shockwave" />
        <div className="max-w-content mx-auto animate-on-enter">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div>
              <h2 className="font-display text-4xl font-semibold text-white">Every hour you wait, someone else closes the deal.</h2>
              <p className="mt-4 text-base text-zinc-400 leading-relaxed max-w-[440px]">
                Your next $10,000 client is on your website right now.
                The only question is whether you call them before your competitor does.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row items-start gap-3">
                <Link href="/signup" className="inline-flex items-center justify-center rounded-md bg-white text-black font-body font-medium text-base h-12 px-7 transition-all duration-fast hover:bg-zinc-100 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-black">Start scoring your leads</Link>
                <a href="#how-it-works" className="inline-flex items-center justify-center rounded-md border border-zinc-700 text-zinc-300 font-body font-medium text-sm h-12 px-5 transition-all duration-fast hover:border-zinc-500 hover:text-white">See how it works</a>
              </div>
              <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-zinc-500">
                {['2-minute setup', '30-day free trial', 'No credit card'].map((item) => (
                  <span key={item} className="flex items-center gap-1.5">
                    <svg className="w-3.5 h-3.5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                    {item}
                  </span>
                ))}
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
