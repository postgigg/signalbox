/**
 * Setup Stripe Products and Prices for HawkLeads.
 *
 * Run with:
 *   STRIPE_SECRET_KEY=sk_live_xxx npx tsx scripts/setup-stripe-products.ts
 *
 * Or for test mode:
 *   STRIPE_SECRET_KEY=sk_test_xxx npx tsx scripts/setup-stripe-products.ts
 *
 * This creates 3 products (Starter, Pro, Agency) with monthly + annual prices.
 * After running, copy the printed price IDs into your Netlify env vars.
 */

import Stripe from 'stripe';

const key = process.env.STRIPE_SECRET_KEY;
if (!key) {
  console.error('Missing STRIPE_SECRET_KEY environment variable.');
  console.error('Usage: STRIPE_SECRET_KEY=sk_live_xxx npx tsx scripts/setup-stripe-products.ts');
  process.exit(1);
}

const stripe = new Stripe(key, { apiVersion: '2024-12-18.acacia' });

interface PlanDef {
  name: string;
  description: string;
  monthlyPriceCents: number;
  yearlyPriceCents: number;
  envMonthly: string;
  envYearly: string;
  metadata: Record<string, string>;
}

const PLANS: PlanDef[] = [
  {
    name: 'HawkLeads Starter',
    description: '1 widget, 500 submissions/month, 3 team members',
    monthlyPriceCents: 9900,
    yearlyPriceCents: 99000,
    envMonthly: 'STRIPE_PRICE_STARTER_MONTHLY',
    envYearly: 'STRIPE_PRICE_STARTER_YEARLY',
    metadata: { plan: 'starter' },
  },
  {
    name: 'HawkLeads Pro',
    description: '5 widgets, 2000 submissions/month, 10 team members, lead routing, A/B testing',
    monthlyPriceCents: 14900,
    yearlyPriceCents: 149000,
    envMonthly: 'STRIPE_PRICE_PRO_MONTHLY',
    envYearly: 'STRIPE_PRICE_PRO_YEARLY',
    metadata: { plan: 'pro' },
  },
  {
    name: 'HawkLeads Agency',
    description: '25 widgets, unlimited submissions, 25 team members, shared analytics, white-label',
    monthlyPriceCents: 24900,
    yearlyPriceCents: 249000,
    envMonthly: 'STRIPE_PRICE_AGENCY_MONTHLY',
    envYearly: 'STRIPE_PRICE_AGENCY_YEARLY',
    metadata: { plan: 'agency' },
  },
];

async function main(): Promise<void> {
  console.log('Creating Stripe products and prices...\n');
  console.log('=== Copy these into your Netlify environment variables ===\n');

  for (const plan of PLANS) {
    // Create the product
    const product = await stripe.products.create({
      name: plan.name,
      description: plan.description,
      metadata: plan.metadata,
    });

    // Create monthly price
    const monthlyPrice = await stripe.prices.create({
      product: product.id,
      unit_amount: plan.monthlyPriceCents,
      currency: 'usd',
      recurring: { interval: 'month' },
      metadata: { ...plan.metadata, interval: 'monthly' },
    });

    // Create yearly price
    const yearlyPrice = await stripe.prices.create({
      product: product.id,
      unit_amount: plan.yearlyPriceCents,
      currency: 'usd',
      recurring: { interval: 'year' },
      metadata: { ...plan.metadata, interval: 'yearly' },
    });

    console.log(`${plan.envMonthly}=${monthlyPrice.id}`);
    console.log(`${plan.envYearly}=${yearlyPrice.id}`);
    console.log('');
  }

  console.log('=== Done. Add these to Netlify > Site settings > Environment variables ===');
}

main().catch((err) => {
  console.error('Failed:', err);
  process.exit(1);
});
