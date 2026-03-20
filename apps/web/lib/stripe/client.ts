import Stripe from 'stripe';

let stripeInstance: Stripe | null = null;

/**
 * Returns a singleton Stripe client configured with the secret key.
 * Uses API version 2024-04-10 for stability.
 */
export function getStripe(): Stripe {
  if (stripeInstance) return stripeInstance;

  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    throw new Error('Missing STRIPE_SECRET_KEY environment variable');
  }

  stripeInstance = new Stripe(secretKey, {
    apiVersion: '2024-04-10',
    typescript: true,
    appInfo: {
      name: 'HawkLeads',
      version: '0.1.0',
      url: 'https://hawkleads.io',
    },
  });

  return stripeInstance;
}

/**
 * Construct a Stripe webhook event from the raw body and signature.
 * Throws if verification fails.
 */
export function constructWebhookEvent(
  body: string | Buffer,
  signature: string
): Stripe.Event {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    throw new Error('Missing STRIPE_WEBHOOK_SECRET environment variable');
  }

  return getStripe().webhooks.constructEvent(body, signature, webhookSecret);
}
