import type Stripe from 'stripe';

import { createAdminClient } from '../supabase/admin';
import { resolvePriceId } from './plans';

// ---------------------------------------------------------------------------
// Event handler map
// ---------------------------------------------------------------------------

type WebhookHandler = (event: Stripe.Event) => Promise<void>;

const handlers: Record<string, WebhookHandler> = {
  'checkout.session.completed': handleCheckoutSessionCompleted,
  'customer.subscription.updated': handleSubscriptionUpdated,
  'customer.subscription.deleted': handleSubscriptionDeleted,
  'invoice.payment_failed': handleInvoicePaymentFailed,
  'invoice.paid': handleInvoicePaid,
};

/**
 * Route a Stripe webhook event to the appropriate handler.
 * Returns true if the event was handled, false otherwise.
 */
export async function handleStripeWebhook(
  event: Stripe.Event
): Promise<boolean> {
  const handler = handlers[event.type];
  if (!handler) return false;
  await handler(event);
  return true;
}

// ---------------------------------------------------------------------------
// checkout.session.completed
// ---------------------------------------------------------------------------

async function handleCheckoutSessionCompleted(
  event: Stripe.Event
): Promise<void> {
  const session = event.data.object as Stripe.Checkout.Session;

  const customerId =
    typeof session.customer === 'string'
      ? session.customer
      : session.customer?.id;
  const subscriptionId =
    typeof session.subscription === 'string'
      ? session.subscription
      : session.subscription?.id;

  if (!customerId || !subscriptionId) return;

  const accountId = session.metadata?.account_id;
  if (!accountId) return;

  // Resolve the plan from the subscription items
  const priceId = session.metadata?.price_id;
  const planInfo = priceId ? resolvePriceId(priceId) : null;

  const supabase = createAdminClient();

  const { error } = await supabase
    .from('accounts')
    .update({
      stripe_customer_id: customerId,
      stripe_subscription_id: subscriptionId,
      plan: planInfo?.plan.id ?? 'starter',
      subscription_status: 'active',
    })
    .eq('id', accountId);

  if (error) {
    throw new Error(
      `Failed to update account after checkout: ${error.message}`
    );
  }
}

// ---------------------------------------------------------------------------
// customer.subscription.updated
// ---------------------------------------------------------------------------

async function handleSubscriptionUpdated(
  event: Stripe.Event
): Promise<void> {
  const subscription = event.data.object as Stripe.Subscription;
  const customerId =
    typeof subscription.customer === 'string'
      ? subscription.customer
      : subscription.customer.id;

  const supabase = createAdminClient();

  // Look up the account by Stripe customer ID
  const { data: account, error: lookupError } = await supabase
    .from('accounts')
    .select('id')
    .eq('stripe_customer_id', customerId)
    .single();

  if (lookupError || !account) return;

  // Resolve the new plan from the first subscription item
  const firstItem = subscription.items.data[0];
  const priceId = firstItem?.price?.id;
  const planInfo = priceId ? resolvePriceId(priceId) : null;

  // Map Stripe status to our subscription_status enum
  const statusMap: Record<string, string> = {
    active: 'active',
    past_due: 'past_due',
    canceled: 'canceled',
    unpaid: 'unpaid',
    trialing: 'trialing',
    incomplete: 'past_due',
    incomplete_expired: 'canceled',
    paused: 'canceled',
  };

  const subscriptionStatus =
    statusMap[subscription.status] ?? 'active';

  const updatePayload: Record<string, string> = {
    subscription_status: subscriptionStatus,
  };

  if (planInfo) {
    updatePayload['plan'] = planInfo.plan.id;
  }

  const { error } = await supabase
    .from('accounts')
    .update(updatePayload)
    .eq('id', account.id);

  if (error) {
    throw new Error(
      `Failed to update subscription: ${error.message}`
    );
  }
}

// ---------------------------------------------------------------------------
// customer.subscription.deleted
// ---------------------------------------------------------------------------

async function handleSubscriptionDeleted(
  event: Stripe.Event
): Promise<void> {
  const subscription = event.data.object as Stripe.Subscription;
  const customerId =
    typeof subscription.customer === 'string'
      ? subscription.customer
      : subscription.customer.id;

  const supabase = createAdminClient();

  const { data: account, error: lookupError } = await supabase
    .from('accounts')
    .select('id')
    .eq('stripe_customer_id', customerId)
    .single();

  if (lookupError || !account) return;

  const { error } = await supabase
    .from('accounts')
    .update({
      subscription_status: 'canceled',
      plan: 'trial',
      stripe_subscription_id: null,
    })
    .eq('id', account.id);

  if (error) {
    throw new Error(
      `Failed to handle subscription deletion: ${error.message}`
    );
  }
}

// ---------------------------------------------------------------------------
// invoice.payment_failed
// ---------------------------------------------------------------------------

async function handleInvoicePaymentFailed(
  event: Stripe.Event
): Promise<void> {
  const invoice = event.data.object as Stripe.Invoice;
  const customerId =
    typeof invoice.customer === 'string'
      ? invoice.customer
      : invoice.customer?.id;

  if (!customerId) return;

  const supabase = createAdminClient();

  const { data: account, error: lookupError } = await supabase
    .from('accounts')
    .select('id, notification_email')
    .eq('stripe_customer_id', customerId)
    .single();

  if (lookupError || !account) return;

  // Mark the account subscription as past_due
  const { error } = await supabase
    .from('accounts')
    .update({ subscription_status: 'past_due' })
    .eq('id', account.id);

  if (error) {
    throw new Error(
      `Failed to update account after payment failure: ${error.message}`
    );
  }
}

// ---------------------------------------------------------------------------
// invoice.paid
// ---------------------------------------------------------------------------

async function handleInvoicePaid(event: Stripe.Event): Promise<void> {
  const invoice = event.data.object as Stripe.Invoice;
  const customerId =
    typeof invoice.customer === 'string'
      ? invoice.customer
      : invoice.customer?.id;

  if (!customerId) return;

  const supabase = createAdminClient();

  const { data: account, error: lookupError } = await supabase
    .from('accounts')
    .select('id, lifetime_revenue')
    .eq('stripe_customer_id', customerId)
    .single();

  if (lookupError || !account) return;

  // Convert Stripe amount from cents to dollars
  const amountPaid = (invoice.amount_paid ?? 0) / 100;
  const currentRevenue = account.lifetime_revenue ?? 0;

  const { error } = await supabase
    .from('accounts')
    .update({
      subscription_status: 'active',
      lifetime_revenue: currentRevenue + amountPaid,
    })
    .eq('id', account.id);

  if (error) {
    throw new Error(
      `Failed to update account after invoice paid: ${error.message}`
    );
  }
}
