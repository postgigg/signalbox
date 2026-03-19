import Stripe from 'stripe';

let stripeInstance: Stripe | null = null;

export function getStripe(): Stripe {
  if (stripeInstance) return stripeInstance;

  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    throw new Error('Missing STRIPE_SECRET_KEY environment variable');
  }

  stripeInstance = new Stripe(key, {
    apiVersion: '2024-04-10',
    typescript: true,
  });
  return stripeInstance;
}

/** @deprecated Use getStripe() instead. Kept for backwards compatibility. */
export const stripe = new Proxy({} as Stripe, {
  get(_target, prop) {
    return (getStripe() as Record<string | symbol, unknown>)[prop];
  },
});

export { Stripe };
