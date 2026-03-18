'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

const PLAN_FEATURES = [
  { feature: 'Widgets', starter: '1', pro: '5', agency: '25' },
  { feature: 'Submissions/month', starter: '500', pro: '2,000', agency: 'Unlimited' },
  { feature: 'Lead scoring', starter: true, pro: true, agency: true },
  { feature: 'Email alerts', starter: true, pro: true, agency: true },
  { feature: 'Custom branding', starter: true, pro: true, agency: true },
  { feature: 'Flow templates', starter: true, pro: true, agency: true },
  { feature: 'Basic analytics', starter: true, pro: true, agency: true },
  { feature: 'Advanced analytics', starter: false, pro: true, agency: true },
  { feature: 'Slack notifications', starter: false, pro: true, agency: true },
  { feature: 'Webhooks', starter: false, pro: true, agency: true },
  { feature: 'API access', starter: false, pro: true, agency: true },
  { feature: 'Remove branding', starter: false, pro: true, agency: true },
  { feature: 'White-label', starter: false, pro: false, agency: true },
  { feature: 'Multi-client dashboard', starter: false, pro: false, agency: true },
  { feature: 'Priority support', starter: false, pro: false, agency: true },
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
      'At the end of your 14-day trial, you can choose a paid plan. If you do not, your widget will stop accepting new submissions and display a fallback contact message instead. Your data is retained for 90 days.',
  },
  {
    question: 'Do you offer refunds?',
    answer:
      'All plans are billed monthly (or annually if you choose). You can cancel at any time and your access continues through the end of the current billing period. We do not offer partial refunds.',
  },
  {
    question: 'Is there a free plan?',
    answer:
      'There is no permanent free plan. The 14-day trial includes full access to Starter plan features with a 50-submission limit. After the trial, you need to choose a paid plan to continue.',
  },
  {
    question: 'Can I get a custom plan for higher volume?',
    answer:
      'Contact us if you need more than 25 widgets or have specific requirements. We can create custom pricing for enterprise needs.',
  },
] as const;

function CheckIcon(): React.ReactElement {
  return (
    <svg
      className="w-4 h-4 text-signal"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  );
}

function DashIcon(): React.ReactElement {
  return (
    <svg
      className="w-4 h-4 text-border-dark"
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
      {/* Header */}
      <section className="pt-32 pb-16 px-6">
        <div className="max-w-content mx-auto text-center">
          <h1 className="font-display text-5xl font-semibold text-ink">
            Simple, honest pricing.
          </h1>
          <p className="mt-4 text-lg text-stone max-w-prose mx-auto">
            Every plan includes a 14-day free trial. No credit card required. Cancel
            anytime.
          </p>

          {/* Toggle */}
          <div className="flex items-center justify-center gap-3 mt-6">
            <span
              className={`text-sm font-body ${
                isAnnual ? 'text-stone' : 'text-ink font-medium'
              }`}
            >
              Monthly
            </span>
            <button
              type="button"
              onClick={() => setIsAnnual((prev) => !prev)}
              className={`relative w-11 h-6 rounded-pill transition-colors duration-fast ${
                isAnnual ? 'bg-signal' : 'bg-border-dark'
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
                isAnnual ? 'text-ink font-medium' : 'text-stone'
              }`}
            >
              Annual
              <span className="ml-1 text-xs text-signal font-medium">Save 17%</span>
            </span>
          </div>
        </div>
      </section>

      {checkoutError !== null && (
        <div className="max-w-content mx-auto px-6 mb-4">
          <div className="p-3 rounded-sm bg-danger-light text-danger text-sm border border-danger/20 text-center">
            {checkoutError}
          </div>
        </div>
      )}

      {/* Plan Cards */}
      <section className="pb-16 px-6">
        <div className="max-w-content mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Starter */}
          <div className="card flex flex-col">
            <h2 className="font-display text-xl font-semibold text-ink">Starter</h2>
            <p className="mt-1 text-sm text-stone">
              For businesses getting started with lead qualification.
            </p>
            <p className="mt-1 text-xs text-stone-light">
              Best for solo operators with one site.
            </p>
            <div className="mt-4">
              <span className="font-display text-4xl font-bold text-ink">
                ${starterPrice}
              </span>
              <span className="text-sm text-stone">/mo</span>
              {isAnnual && (
                <span className="ml-2 text-xs text-stone-light">billed annually</span>
              )}
            </div>
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
          <div className="card flex flex-col border-signal border-2">
            <div className="flex items-center gap-2">
              <h2 className="font-display text-xl font-semibold text-ink">Pro</h2>
              <span className="badge-new text-xs">Most Popular</span>
            </div>
            <p className="mt-1 text-sm text-stone">
              For growing teams that need more capacity and integrations.
            </p>
            <p className="mt-1 text-xs text-stone-light">
              Best for growing teams that need integrations.
            </p>
            <div className="mt-4">
              <span className="font-display text-4xl font-bold text-ink">
                ${proPrice}
              </span>
              <span className="text-sm text-stone">/mo</span>
              {isAnnual && (
                <span className="ml-2 text-xs text-stone-light">billed annually</span>
              )}
            </div>
            <button
              type="button"
              onClick={() => void handlePlanSelect('pro')}
              disabled={checkoutLoading !== null}
              className="btn-signal mt-6 w-full"
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
          <div className="card flex flex-col">
            <h2 className="font-display text-xl font-semibold text-ink">Agency</h2>
            <p className="mt-1 text-sm text-stone">
              For agencies managing multiple client accounts.
            </p>
            <p className="mt-1 text-xs text-stone-light">
              Best for agencies managing client accounts.
            </p>
            <div className="mt-4">
              <span className="font-display text-4xl font-bold text-ink">
                ${agencyPrice}
              </span>
              <span className="text-sm text-stone">/mo</span>
              {isAnnual && (
                <span className="ml-2 text-xs text-stone-light">billed annually</span>
              )}
            </div>
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
      </section>

      <div className="pb-8 px-6">
        <p className="text-center text-sm text-stone max-w-content mx-auto">
          Close just one extra deal per month and SignalBox pays for itself.
        </p>
      </div>

      {/* Feature Comparison Matrix */}
      <section className="py-16 px-6">
        <div className="max-w-content mx-auto">
          <h2 className="font-display text-2xl font-semibold text-ink text-center mb-8">
            Compare plans
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="table-header">
                  <th className="text-left py-3 px-4 font-medium">Feature</th>
                  <th className="text-center py-3 px-4 font-medium">Starter</th>
                  <th className="text-center py-3 px-4 font-medium">Pro</th>
                  <th className="text-center py-3 px-4 font-medium">Agency</th>
                </tr>
              </thead>
              <tbody>
                {PLAN_FEATURES.map((row) => (
                  <tr key={row.feature} className="table-row">
                    <td className="py-3 px-4 text-ink font-medium">{row.feature}</td>
                    <td className="py-3 px-4 text-center">
                      {typeof row.starter === 'string' ? (
                        <span className="text-stone">{row.starter}</span>
                      ) : row.starter ? (
                        <span className="inline-flex justify-center">
                          <CheckIcon />
                        </span>
                      ) : (
                        <span className="inline-flex justify-center">
                          <DashIcon />
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center">
                      {typeof row.pro === 'string' ? (
                        <span className="text-stone">{row.pro}</span>
                      ) : row.pro ? (
                        <span className="inline-flex justify-center">
                          <CheckIcon />
                        </span>
                      ) : (
                        <span className="inline-flex justify-center">
                          <DashIcon />
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center">
                      {typeof row.agency === 'string' ? (
                        <span className="text-stone">{row.agency}</span>
                      ) : row.agency ? (
                        <span className="inline-flex justify-center">
                          <CheckIcon />
                        </span>
                      ) : (
                        <span className="inline-flex justify-center">
                          <DashIcon />
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

      {/* Pricing FAQ */}
      <section className="py-16 px-6">
        <div className="max-w-content mx-auto">
          <h2 className="font-display text-2xl font-semibold text-ink">
            Pricing questions
          </h2>
          <div className="mt-8 max-w-prose divide-y divide-border">
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
                  <span className="font-body text-base font-medium text-ink pr-4">
                    {item.question}
                  </span>
                  <svg
                    className={`w-5 h-5 text-stone flex-shrink-0 transition-transform duration-fast ${
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
                  <p className="mt-3 text-sm text-stone leading-relaxed">
                    {item.answer}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-ink py-20 px-6">
        <div className="max-w-content mx-auto text-center">
          <h2 className="font-display text-4xl font-semibold text-white">
            Start closing better leads today.
          </h2>
          <div className="mt-8">
            <Link
              href="/signup"
              className="inline-flex items-center justify-center rounded-md bg-white text-ink font-body font-medium text-base h-12 px-6 transition-all duration-fast hover:bg-paper"
            >
              Start Free Trial
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
