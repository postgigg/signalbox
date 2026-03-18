import { NextRequest, NextResponse } from 'next/server';
import { stripe, Stripe } from '@/lib/stripe';
import { createAdminClient } from '@/lib/supabase/admin';
import { sendPaymentFailedEmail } from '@/lib/email';
import { PLANS } from '@/lib/constants';
import type { Plan } from '@/lib/supabase/types';

export const runtime = 'nodejs';

function getWebhookSecret(): string {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) {
    throw new Error('Missing STRIPE_WEBHOOK_SECRET environment variable');
  }
  return secret;
}

/** Map a Stripe price ID to a SignalBox plan */
function planFromPriceId(priceId: string): Plan | null {
  for (const [planId, config] of Object.entries(PLANS)) {
    if (
      config.stripePriceIdMonthly === priceId ||
      config.stripePriceIdYearly === priceId
    ) {
      return planId as Plan;
    }
  }
  return null;
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature');

  if (!signature) {
    return NextResponse.json(
      { error: 'Missing stripe-signature header' },
      { status: 400 },
    );
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, getWebhookSecret());
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Signature verification failed';
    return NextResponse.json(
      { error: `Webhook Error: ${message}` },
      { status: 400 },
    );
  }

  const admin = createAdminClient();

  // Idempotency: skip duplicate events
  const { error: idempotencyError } = await admin
    .from('stripe_events')
    .insert({ event_id: event.id, event_type: event.type });

  if (idempotencyError) {
    // Duplicate event (unique constraint violation) — acknowledge without reprocessing
    return NextResponse.json({ received: true });
  }

  try {
  switch (event.type) {
    // -----------------------------------------------------------------
    // checkout.session.completed
    // -----------------------------------------------------------------
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session;

      const customerId =
        typeof session.customer === 'string'
          ? session.customer
          : session.customer?.id;
      const subscriptionId =
        typeof session.subscription === 'string'
          ? session.subscription
          : session.subscription?.id;
      const accountId = session.metadata?.['account_id'];

      if (!accountId || !customerId || !subscriptionId) {
        break;
      }

      // Fetch subscription to determine the plan
      const subscription = await stripe.subscriptions.retrieve(subscriptionId);
      const priceId = subscription.items.data[0]?.price.id;
      const plan = priceId ? planFromPriceId(priceId) : null;

      if (!plan && priceId) {
        console.error(`[stripe-webhook] Unknown price ID: ${priceId} for account ${accountId}`);
      }

      await admin
        .from('accounts')
        .update({
          stripe_customer_id: customerId,
          stripe_subscription_id: subscriptionId,
          plan: plan ?? 'starter',
          subscription_status: 'active',
          trial_ends_at: null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', accountId);

      break;
    }

    // -----------------------------------------------------------------
    // customer.subscription.updated
    // -----------------------------------------------------------------
    case 'customer.subscription.updated': {
      const subscription = event.data.object as Stripe.Subscription;
      const customerId =
        typeof subscription.customer === 'string'
          ? subscription.customer
          : subscription.customer.id;

      const { data: account } = await admin
        .from('accounts')
        .select('id')
        .eq('stripe_customer_id', customerId)
        .single();

      if (!account) break;

      const priceId = subscription.items.data[0]?.price.id;
      const plan = priceId ? planFromPriceId(priceId) : null;

      if (!plan && priceId) {
        console.error(`[stripe-webhook] Unknown price ID on subscription update: ${priceId}`);
      }

      const statusMap: Record<string, string> = {
        active: 'active',
        past_due: 'past_due',
        canceled: 'canceled',
        unpaid: 'unpaid',
        trialing: 'trialing',
        incomplete: 'past_due',
        incomplete_expired: 'canceled',
        paused: 'past_due',
      };

      const mappedStatus = statusMap[subscription.status] ?? 'active';

      const updates: Record<string, unknown> = {
        subscription_status: mappedStatus,
        updated_at: new Date().toISOString(),
      };

      if (plan) {
        updates['plan'] = plan;
      }

      await admin.from('accounts').update(updates).eq('id', account.id);

      break;
    }

    // -----------------------------------------------------------------
    // customer.subscription.deleted
    // -----------------------------------------------------------------
    case 'customer.subscription.deleted': {
      const subscription = event.data.object as Stripe.Subscription;
      const customerId =
        typeof subscription.customer === 'string'
          ? subscription.customer
          : subscription.customer.id;

      await admin
        .from('accounts')
        .update({
          subscription_status: 'canceled',
          updated_at: new Date().toISOString(),
        })
        .eq('stripe_customer_id', customerId);

      break;
    }

    // -----------------------------------------------------------------
    // invoice.payment_failed
    // -----------------------------------------------------------------
    case 'invoice.payment_failed': {
      const invoice = event.data.object as Stripe.Invoice;
      const customerId =
        typeof invoice.customer === 'string'
          ? invoice.customer
          : invoice.customer?.id;

      if (!customerId) break;

      const { data: account } = await admin
        .from('accounts')
        .select('id, name, notification_email')
        .eq('stripe_customer_id', customerId)
        .single();

      if (!account) break;

      await admin
        .from('accounts')
        .update({
          subscription_status: 'past_due',
          updated_at: new Date().toISOString(),
        })
        .eq('id', account.id);

      // Send payment failed email
      if (account.notification_email) {
        sendPaymentFailedEmail({
          to: account.notification_email,
          accountName: account.name,
        }).catch(() => {
          // Email delivery failure — non-blocking
        });
      }

      break;
    }

    // -----------------------------------------------------------------
    // invoice.paid
    // -----------------------------------------------------------------
    case 'invoice.paid': {
      const invoice = event.data.object as Stripe.Invoice;
      const customerId =
        typeof invoice.customer === 'string'
          ? invoice.customer
          : invoice.customer?.id;

      if (!customerId) break;

      const amountPaid = invoice.amount_paid / 100; // cents to dollars

      const { data: account } = await admin
        .from('accounts')
        .select('id, lifetime_revenue')
        .eq('stripe_customer_id', customerId)
        .single();

      if (!account) break;

      const newLifetimeRevenue = (account.lifetime_revenue ?? 0) + amountPaid;

      await admin
        .from('accounts')
        .update({
          subscription_status: 'active',
          lifetime_revenue: newLifetimeRevenue,
          updated_at: new Date().toISOString(),
        })
        .eq('id', account.id);

      break;
    }

    default:
      // Unhandled event type — acknowledged
      break;
  }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown webhook handler error';
    console.error(`[stripe-webhook] Error processing ${event.type}: ${message}`);
  }

  // Always return 200 to acknowledge receipt and prevent Stripe retries
  return NextResponse.json({ received: true });
}
