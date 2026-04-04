'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

const PLAN_FEATURES = [
  { feature: 'Widgets', free: '1', starter: '1', pro: '5', agency: '25' },
  { feature: 'Submissions/month', free: '10', starter: '500', pro: '2,000', agency: 'Unlimited' },
  { feature: 'Team members', free: '1', starter: '3', pro: '10', agency: '25' },
  { feature: 'Lead scoring (form)', free: true, starter: true, pro: true, agency: true },
  { feature: 'Engagement scoring', free: false, starter: false, pro: true, agency: true },
  { feature: 'Email alerts', free: true, starter: true, pro: true, agency: true },
  { feature: 'Flow templates', free: true, starter: true, pro: true, agency: true },
  { feature: 'Basic analytics', free: false, starter: true, pro: true, agency: true },
  { feature: 'Webhook integrations', free: false, starter: true, pro: true, agency: true },
  { feature: 'Custom branding', free: false, starter: true, pro: true, agency: true },
  { feature: 'Advanced analytics', free: false, starter: false, pro: true, agency: true },
  { feature: 'Lead routing rules', free: false, starter: false, pro: true, agency: true },
  { feature: 'A/B testing', free: false, starter: false, pro: true, agency: true },
  { feature: 'Drip email sequences', free: false, starter: false, pro: true, agency: true },
  { feature: 'API access', free: false, starter: false, pro: true, agency: true },
  { feature: 'Remove branding', free: false, starter: false, pro: true, agency: true },
  { feature: 'Shared analytics links', free: false, starter: false, pro: false, agency: true },
  { feature: 'White-label', free: false, starter: false, pro: false, agency: true },
  { feature: 'Priority support', free: false, starter: false, pro: false, agency: true },
] as const;

const PRICING_FAQ = [
  {
    question: 'What counts as a submission?',
    answer:
      'A submission is a completed flow. If a visitor starts the flow but does not finish, it is not counted. Only full completions with contact info count toward your monthly limit.',
  },
  {
    question: 'Can I change plans later?',
    answer:
      'Yes. You can upgrade or downgrade at any time from your dashboard. When upgrading, you get immediate access to the higher plan features. When downgrading, the change takes effect at the next billing cycle.',
  },
  {
    question: 'What happens when my trial ends?',
    answer:
      'At the end of your 30-day trial, you can choose a paid plan. If you do not, your widget will stop accepting new submissions and display a fallback contact message instead. Your data is retained for 90 days.',
  },
  {
    question: 'Do you offer refunds?',
    answer:
      'All plans are billed monthly (or annually if you choose). You can cancel at any time and your access continues through the end of the current billing period. We do not offer partial refunds.',
  },
  {
    question: 'Is there a free plan?',
    answer:
      'There is no permanent free plan. The 30-day trial includes full access to Starter plan features with a 50-submission limit. After the trial, you need to choose a paid plan to continue.',
  },
  {
    question: 'Can I get a custom plan for higher volume?',
    answer:
      'Contact us if you need more than 25 widgets or have specific requirements. We can create custom pricing for enterprise needs.',
  },
] as const;

function CheckIcon({ className }: { readonly className?: string }): React.ReactElement {
  return (
    <svg
      className={className ?? 'w-4 h-4 text-signal'}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  );
}

function DashIcon({ className }: { readonly className?: string }): React.ReactElement {
  return (
    <svg
      className={className ?? 'w-4 h-4 text-border-dark'}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M20 12H4" />
    </svg>
  );
}

interface CheckoutResponse {
  url?: string;
  type?: string;
  error?: string;
}

export default function PricingPage(): React.ReactElement {
  const router = useRouter();
  const [isAnnual, setIsAnnual] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  useEffect(() => {
    async function checkAuth(): Promise<void> {
      try {
        const { createBrowserClient } = await import('@supabase/ssr');
        const supabase = createBrowserClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL ?? '',
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ''
        );
        const { data: { user } } = await supabase.auth.getUser();
        setIsLoggedIn(user !== null);
      } catch {
        setIsLoggedIn(false);
      }
    }
    void checkAuth();
  }, []);

  async function handlePlanSelect(planId: string): Promise<void> {
    if (!isLoggedIn) {
      router.push(`/signup?plan=${planId}`);
      return;
    }

    setCheckoutError(null);
    setCheckoutLoading(planId);

    try {
      const res = await fetch('/api/v1/billing/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planId,
          interval: isAnnual ? 'yearly' : 'monthly',
        }),
      });

      const data: CheckoutResponse = await res.json() as CheckoutResponse;

      if (data.error) {
        setCheckoutError(data.error);
        setCheckoutLoading(null);
        return;
      }

      if (data.url) {
        window.location.href = data.url;
        return;
      }

      setCheckoutError('Failed to start checkout. Please try again.');
    } catch {
      setCheckoutError('Something went wrong. Please try again.');
    } finally {
      setCheckoutLoading(null);
    }
  }

  const starterPrice = isAnnual ? 82 : 99;
  const proPrice = isAnnual ? 124 : 149;
  const agencyPrice = isAnnual ? 207 : 249;

  return (
    <div>
      {/* Hero */}
      <section className="bg-black pt-32 pb-16 px-6">
        <div className="max-w-content mx-auto text-center">
          <p className="text-xs font-body font-semibold uppercase tracking-[0.15em] text-zinc-500 mb-4">
            PRICING
          </p>
          <h1 className="font-display text-5xl font-semibold text-white">
            Simple, honest pricing.
          </h1>
          <p className="mt-4 text-lg text-zinc-400 max-w-prose mx-auto font-body">
            Every plan includes a 30-day free trial. No credit card required. Cancel
            anytime.
          </p>

          {/* Toggle */}
          <div className="flex items-center justify-center gap-3 mt-6">
            <span
              className={`text-sm font-body ${
                isAnnual ? 'text-zinc-500' : 'text-white font-medium'
              }`}
            >
              Monthly
            </span>
            <button
              type="button"
              onClick={() => setIsAnnual((prev) => !prev)}
              className={`relative w-11 h-6 rounded-pill transition-colors duration-fast ${
                isAnnual ? 'bg-signal' : 'bg-zinc-600'
              }`}
              role="switch"
              aria-checked={isAnnual}
              aria-label="Toggle annual billing"
            >
              <span
                className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-pill bg-white transition-transform duration-fast ${
                  isAnnual ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
            <span
              className={`text-sm font-body ${
                isAnnual ? 'text-white font-medium' : 'text-zinc-500'
              }`}
            >
              Annual
              <span className="ml-1 text-xs text-signal font-medium">Save 17%</span>
            </span>
          </div>
        </div>
      </section>

      {/* Plan Cards (light) */}
      <section className="bg-white py-16 px-6">
        <div className="max-w-content mx-auto">
          {checkoutError !== null && (
            <div className="mb-6">
              <div className="p-3 rounded-sm bg-danger-light text-danger text-sm border border-danger/20 text-center">
                {checkoutError}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Free */}
            <div className="border border-border rounded-md p-5 bg-surface flex flex-col transition-all duration-normal">
              <h2 className="font-display text-xl font-semibold text-ink">Free</h2>
              <p className="mt-1 text-sm text-stone font-body">
                One widget. 10 leads/month.
              </p>
              <p className="mt-1 text-xs text-stone-light font-body">
                Free forever. No credit card.
              </p>
              <div className="mt-4 relative h-12 overflow-hidden">
                <div className="animate-price-slide">
                  <span className="font-display text-4xl font-bold text-ink">
                    $0
                  </span>
                  <span className="text-sm text-stone font-body">/mo</span>
                </div>
              </div>
              <ul className="mt-4 space-y-2 flex-1">
                <li className="flex items-center gap-2 text-sm text-stone font-body"><CheckIcon /> Lead scoring (form answers)</li>
                <li className="flex items-center gap-2 text-sm text-stone font-body"><CheckIcon /> Email alerts</li>
                <li className="flex items-center gap-2 text-sm text-stone font-body"><CheckIcon /> 1 team member</li>
              </ul>
              <button
                type="button"
                onClick={() => void handlePlanSelect('free')}
                disabled={checkoutLoading !== null}
                className="btn-secondary mt-6 w-full"
              >
                {isLoggedIn ? 'Select Free' : 'Get Started Free'}
              </button>
            </div>

            {/* Starter */}
            <div className="border border-border rounded-md p-5 bg-surface flex flex-col transition-all duration-normal">
              <h2 className="font-display text-xl font-semibold text-ink">Starter</h2>
              <p className="mt-1 text-sm text-stone font-body">
                One widget. 500 submissions/month.
              </p>
              <p className="mt-1 text-xs text-stone-light font-body">
                Best for solo operators with one site.
              </p>
              <div className="mt-4 relative h-12 overflow-hidden">
                <div
                  key={String(isAnnual)}
                  className="animate-price-slide"
                >
                  <span className="font-display text-4xl font-bold text-ink">
                    ${starterPrice}
                  </span>
                  <span className="text-sm text-stone font-body">/mo</span>
                </div>
                {isAnnual && (
                  <p className="mt-0.5 text-xs text-signal font-medium animate-price-fade font-body">
                    ${99 * 12 - starterPrice * 12} saved per year
                  </p>
                )}
              </div>
              <ul className="mt-4 space-y-2 flex-1">
                <li className="flex items-center gap-2 text-sm text-stone font-body"><CheckIcon /> Lead scoring</li>
                <li className="flex items-center gap-2 text-sm text-stone font-body"><CheckIcon /> Email alerts</li>
                <li className="flex items-center gap-2 text-sm text-stone font-body"><CheckIcon /> Basic analytics</li>
                <li className="flex items-center gap-2 text-sm text-stone font-body"><CheckIcon /> Webhook integrations</li>
              </ul>
              <button
                type="button"
                onClick={() => void handlePlanSelect('starter')}
                disabled={checkoutLoading !== null}
                className="btn-secondary mt-6 w-full"
              >
                {checkoutLoading === 'starter' ? (
                  <span className="inline-flex items-center gap-2">
                    <span className="spinner w-4 h-4" />
                    Loading...
                  </span>
                ) : isLoggedIn ? 'Select Starter' : 'Start Free Trial'}
              </button>
            </div>

            {/* Pro */}
            <div className="border-2 border-signal rounded-md p-5 bg-surface flex flex-col transition-all duration-normal">
              <div className="flex items-center gap-2">
                <h2 className="font-display text-xl font-semibold text-ink">Pro</h2>
                <span className="badge-new text-xs">Most Popular</span>
              </div>
              <p className="mt-1 text-sm text-stone font-body">
                Five widgets. 2,000 submissions/month.
              </p>
              <p className="mt-1 text-xs text-stone-light font-body">
                Best for growing teams with multiple sites.
              </p>
              <div className="mt-4 relative h-12 overflow-hidden">
                <div
                  key={String(isAnnual)}
                  className="animate-price-slide"
                >
                  <span className="font-display text-4xl font-bold text-ink">
                    ${proPrice}
                  </span>
                  <span className="text-sm text-stone font-body">/mo</span>
                </div>
                {isAnnual && (
                  <p className="mt-0.5 text-xs text-signal font-medium animate-price-fade font-body">
                    ${149 * 12 - proPrice * 12} saved per year
                  </p>
                )}
              </div>
              <ul className="mt-4 space-y-2 flex-1">
                <li className="flex items-center gap-2 text-sm text-stone font-body"><CheckIcon /> Everything in Starter</li>
                <li className="flex items-center gap-2 text-sm text-stone font-body"><CheckIcon /> Lead routing rules</li>
                <li className="flex items-center gap-2 text-sm text-stone font-body"><CheckIcon /> A/B testing</li>
                <li className="flex items-center gap-2 text-sm text-stone font-body"><CheckIcon /> Drip email sequences</li>
                <li className="flex items-center gap-2 text-sm text-stone font-body"><CheckIcon /> Advanced analytics</li>
              </ul>
              <button
                type="button"
                onClick={() => void handlePlanSelect('pro')}
                disabled={checkoutLoading !== null}
                className="btn-primary mt-6 w-full"
              >
                {checkoutLoading === 'pro' ? (
                  <span className="inline-flex items-center gap-2">
                    <span className="spinner w-4 h-4" />
                    Loading...
                  </span>
                ) : isLoggedIn ? 'Select Pro' : 'Start Free Trial'}
              </button>
            </div>

            {/* Agency */}
            <div className="border border-border rounded-md p-5 bg-surface flex flex-col transition-all duration-normal">
              <h2 className="font-display text-xl font-semibold text-ink">Agency</h2>
              <p className="mt-1 text-sm text-stone font-body">
                25 widgets. Unlimited submissions.
              </p>
              <p className="mt-1 text-xs text-stone-light font-body">
                Best for agencies managing client accounts.
              </p>
              <div className="mt-4 relative h-12 overflow-hidden">
                <div
                  key={String(isAnnual)}
                  className="animate-price-slide"
                >
                  <span className="font-display text-4xl font-bold text-ink">
                    ${agencyPrice}
                  </span>
                  <span className="text-sm text-stone font-body">/mo</span>
                </div>
                {isAnnual && (
                  <p className="mt-0.5 text-xs text-signal font-medium animate-price-fade font-body">
                    ${249 * 12 - agencyPrice * 12} saved per year
                  </p>
                )}
              </div>
              <ul className="mt-4 space-y-2 flex-1">
                <li className="flex items-center gap-2 text-sm text-stone font-body"><CheckIcon /> Everything in Pro</li>
                <li className="flex items-center gap-2 text-sm text-stone font-body"><CheckIcon /> Shared analytics links</li>
                <li className="flex items-center gap-2 text-sm text-stone font-body"><CheckIcon /> White-label branding</li>
                <li className="flex items-center gap-2 text-sm text-stone font-body"><CheckIcon /> Priority support</li>
              </ul>
              <button
                type="button"
                onClick={() => void handlePlanSelect('agency')}
                disabled={checkoutLoading !== null}
                className="btn-secondary mt-6 w-full"
              >
                {checkoutLoading === 'agency' ? (
                  <span className="inline-flex items-center gap-2">
                    <span className="spinner w-4 h-4" />
                    Loading...
                  </span>
                ) : isLoggedIn ? 'Select Agency' : 'Start Free Trial'}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Guarantee (light) */}
      <section className="bg-white py-10 px-6">
        <div className="max-w-content mx-auto">
          <p className="text-xs font-body font-semibold uppercase tracking-[0.15em] text-stone mb-4">
            OUR GUARANTEE
          </p>
          <div className="border border-border rounded-md overflow-hidden">
            <div className="bg-ink px-6 py-3">
              <p className="text-xs font-body font-semibold text-white/70 uppercase tracking-widest">
                The HawkLeads Guarantee
              </p>
            </div>
            <div className="px-6 py-6 sm:px-8 sm:py-8 grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-6 items-center">
              <div>
                <h3 className="font-display text-xl font-semibold text-ink">
                  5 hot leads in 30 days, or 6 months of Pro free.
                </h3>
                <p className="mt-2 text-sm text-stone leading-relaxed max-w-[480px] font-body">
                  If we do not surface at least 5 hot-tier leads in your first 30 days
                  on a paid plan, we extend your subscription by 6 months of Pro at no charge.
                  $894 in savings. No forms, no approval process, automatic.
                </p>
              </div>
              <div className="flex items-center gap-6 text-center">
                <div>
                  <span className="font-display text-3xl font-bold text-signal">5</span>
                  <p className="text-[10px] text-stone uppercase tracking-wide mt-0.5 font-body">Hot leads</p>
                </div>
                <div className="w-px h-10 bg-border" />
                <div>
                  <span className="font-display text-3xl font-bold text-ink">30</span>
                  <p className="text-[10px] text-stone uppercase tracking-wide mt-0.5 font-body">Days</p>
                </div>
                <div className="w-px h-10 bg-border" />
                <div>
                  <span className="font-display text-3xl font-bold text-ink">$894</span>
                  <p className="text-[10px] text-stone uppercase tracking-wide mt-0.5 font-body">In savings</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Comparison Matrix (dark) */}
      <section className="bg-black py-16 px-6">
        <div className="max-w-content mx-auto">
          <p className="text-xs font-body font-semibold uppercase tracking-[0.15em] text-zinc-500 mb-4 text-center">
            FEATURE COMPARISON
          </p>
          <h2 className="font-display text-2xl font-semibold text-white text-center mb-8">
            Compare plans
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-zinc-900 text-xs uppercase tracking-wide text-zinc-400 font-body font-medium">
                  <th className="text-left py-3 px-4 font-medium">Feature</th>
                  <th className="text-center py-3 px-4 font-medium">Free</th>
                  <th className="text-center py-3 px-4 font-medium">Starter</th>
                  <th className="text-center py-3 px-4 font-medium">Pro</th>
                  <th className="text-center py-3 px-4 font-medium">Agency</th>
                </tr>
              </thead>
              <tbody>
                {PLAN_FEATURES.map((row) => (
                  <tr key={row.feature} className="border-b border-zinc-800 transition-colors duration-fast hover:bg-zinc-900/50">
                    <td className="py-3 px-4 text-white font-medium font-body">{row.feature}</td>
                    <td className="py-3 px-4 text-center">
                      {typeof row.free === 'string' ? (
                        <span className="text-zinc-400 font-body">{row.free}</span>
                      ) : row.free ? (
                        <span className="inline-flex justify-center">
                          <CheckIcon className="w-4 h-4 text-signal" />
                        </span>
                      ) : (
                        <span className="inline-flex justify-center">
                          <DashIcon className="w-4 h-4 text-zinc-700" />
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center">
                      {typeof row.starter === 'string' ? (
                        <span className="text-zinc-400 font-body">{row.starter}</span>
                      ) : row.starter ? (
                        <span className="inline-flex justify-center">
                          <CheckIcon className="w-4 h-4 text-signal" />
                        </span>
                      ) : (
                        <span className="inline-flex justify-center">
                          <DashIcon className="w-4 h-4 text-zinc-700" />
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center">
                      {typeof row.pro === 'string' ? (
                        <span className="text-zinc-400 font-body">{row.pro}</span>
                      ) : row.pro ? (
                        <span className="inline-flex justify-center">
                          <CheckIcon className="w-4 h-4 text-signal" />
                        </span>
                      ) : (
                        <span className="inline-flex justify-center">
                          <DashIcon className="w-4 h-4 text-zinc-700" />
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center">
                      {typeof row.agency === 'string' ? (
                        <span className="text-zinc-400 font-body">{row.agency}</span>
                      ) : row.agency ? (
                        <span className="inline-flex justify-center">
                          <CheckIcon className="w-4 h-4 text-signal" />
                        </span>
                      ) : (
                        <span className="inline-flex justify-center">
                          <DashIcon className="w-4 h-4 text-zinc-700" />
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Pricing FAQ (dark) */}
      <section className="bg-black py-16 px-6">
        <div className="max-w-content mx-auto">
          <p className="text-xs font-body font-semibold uppercase tracking-[0.15em] text-zinc-500 mb-4">
            FAQ
          </p>
          <h2 className="font-display text-2xl font-semibold text-white">
            Pricing questions
          </h2>
          <div className="mt-8 max-w-prose divide-y divide-zinc-800">
            {PRICING_FAQ.map((item, index) => (
              <div key={item.question} className="py-5">
                <button
                  type="button"
                  onClick={() =>
                    setOpenFaq(openFaq === index ? null : index)
                  }
                  className="w-full flex items-center justify-between text-left"
                  aria-expanded={openFaq === index}
                >
                  <span className="font-body text-base font-medium text-white pr-4">
                    {item.question}
                  </span>
                  <svg
                    className={`w-5 h-5 text-zinc-500 flex-shrink-0 transition-transform duration-fast ${
                      openFaq === index ? 'rotate-180' : ''
                    }`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>
                {openFaq === index && (
                  <p className="mt-3 text-sm text-zinc-400 leading-relaxed font-body">
                    {item.answer}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA (dark) */}
      <section className="bg-black py-20 px-6 border-t border-zinc-800">
        <div className="max-w-content mx-auto text-center">
          <p className="text-xs font-body font-semibold uppercase tracking-[0.15em] text-zinc-500 mb-4">
            GET STARTED
          </p>
          <h2 className="font-display text-4xl font-semibold text-white">
            Start closing better leads today.
          </h2>
          <div className="mt-8 flex items-center justify-center gap-4">
            <Link
              href="/signup"
              className="inline-flex items-center justify-center rounded-md bg-white text-black font-body font-medium text-base h-12 px-6 transition-colors duration-fast hover:bg-zinc-200"
            >
              Start Free Trial
            </Link>
            <Link
              href="/demo"
              className="inline-flex items-center justify-center rounded-md border border-zinc-700 text-zinc-300 font-body font-medium text-base h-12 px-6 transition-colors duration-fast hover:border-zinc-500 hover:text-white"
            >
              See a Demo
            </Link>
          </div>
          <p className="mt-4 text-sm text-zinc-500 font-body">
            30 days free. No credit card. Cancel anytime.
          </p>
        </div>
      </section>
    </div>
  );
}
