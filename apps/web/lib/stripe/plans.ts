import { PLANS } from '../constants';

import type { PlanConfig } from '../constants';

// ---------------------------------------------------------------------------
// Stripe plan resolution
// ---------------------------------------------------------------------------

export type BillingInterval = 'monthly' | 'yearly';

export interface StripePlanInfo {
  plan: PlanConfig;
  interval: BillingInterval;
  priceId: string;
  amount: number;
}

/**
 * Resolve a Stripe price ID to a plan config and billing interval.
 * Returns null if the price ID does not match any known plan.
 */
export function resolvePriceId(priceId: string): StripePlanInfo | null {
  for (const plan of Object.values(PLANS)) {
    if (plan.stripePriceIdMonthly === priceId) {
      return {
        plan,
        interval: 'monthly',
        priceId,
        amount: plan.priceMonthly,
      };
    }
    if (plan.stripePriceIdYearly === priceId) {
      return {
        plan,
        interval: 'yearly',
        priceId,
        amount: plan.priceYearly,
      };
    }
  }
  return null;
}

/**
 * Get the Stripe price ID for a given plan and billing interval.
 * Returns null if the plan does not exist or has no price configured.
 */
export function getPriceId(
  planId: string,
  interval: BillingInterval
): string | null {
  const plan = PLANS[planId];
  if (!plan) return null;

  const priceId =
    interval === 'monthly'
      ? plan.stripePriceIdMonthly
      : plan.stripePriceIdYearly;

  return priceId || null;
}

/**
 * Build the line items array for a Stripe Checkout session.
 */
export function buildCheckoutLineItems(
  planId: string,
  interval: BillingInterval
): Array<{ price: string; quantity: number }> {
  const priceId = getPriceId(planId, interval);
  if (!priceId) {
    throw new Error(`No Stripe price ID found for plan "${planId}" (${interval})`);
  }

  return [{ price: priceId, quantity: 1 }];
}

/**
 * Determine whether a plan change is an upgrade, downgrade, or same.
 */
export function comparePlans(
  currentPlanId: string,
  newPlanId: string
): 'upgrade' | 'downgrade' | 'same' {
  const order: Record<string, number> = {
    trial: 0,
    starter: 1,
    pro: 2,
    agency: 3,
  };

  const currentOrder = order[currentPlanId] ?? 0;
  const newOrder = order[newPlanId] ?? 0;

  if (newOrder > currentOrder) return 'upgrade';
  if (newOrder < currentOrder) return 'downgrade';
  return 'same';
}
