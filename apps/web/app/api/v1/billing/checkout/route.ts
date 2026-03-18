import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { stripe } from '@/lib/stripe';
import { buildCheckoutLineItems } from '@/lib/stripe/plans';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { APP_URL, PLANS } from '@/lib/constants';

export const runtime = 'nodejs';

const CheckoutSchema = z.object({
  planId: z.enum(['starter', 'pro', 'agency']),
  interval: z.enum(['monthly', 'yearly']),
});

export async function POST(request: NextRequest): Promise<NextResponse> {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const parsed = CheckoutSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Validation failed', details: parsed.error.flatten().fieldErrors },
      { status: 400 },
    );
  }

  const { planId, interval } = parsed.data;

  const admin = createAdminClient();

  const { data: member } = await admin
    .from('members')
    .select('account_id')
    .eq('user_id', user.id)
    .limit(1)
    .single();

  if (!member) {
    return NextResponse.json({ error: 'No account found' }, { status: 403 });
  }

  const { data: account } = await admin
    .from('accounts')
    .select('id, plan, stripe_customer_id, subscription_status')
    .eq('id', member.account_id)
    .single();

  if (!account) {
    return NextResponse.json({ error: 'Account not found' }, { status: 404 });
  }

  // If already on a paid plan with active subscription, redirect to billing portal instead
  if (
    account.stripe_customer_id &&
    account.subscription_status === 'active' &&
    account.plan !== 'trial'
  ) {
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: account.stripe_customer_id,
      return_url: `${APP_URL}/dashboard/settings/billing`,
    });
    return NextResponse.json({ url: portalSession.url, type: 'portal' });
  }

  let lineItems: Array<{ price: string; quantity: number }>;
  try {
    lineItems = buildCheckoutLineItems(planId, interval);
  } catch {
    return NextResponse.json(
      { error: 'Stripe price not configured for this plan. Please contact support.' },
      { status: 400 },
    );
  }

  // Verify price ID is not empty
  const priceId = lineItems[0]?.price;
  if (!priceId) {
    return NextResponse.json(
      { error: 'Stripe price not configured for this plan. Please contact support.' },
      { status: 400 },
    );
  }

  // Create or reuse Stripe customer
  let customerId = account.stripe_customer_id;

  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.email ?? '',
      metadata: {
        account_id: account.id,
        user_id: user.id,
      },
    });
    customerId = customer.id;

    await admin
      .from('accounts')
      .update({ stripe_customer_id: customerId })
      .eq('id', account.id);
  }

  const planConfig = PLANS[planId];
  const planName = planConfig ? planConfig.name : planId;

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: 'subscription',
    line_items: lineItems,
    success_url: `${APP_URL}/dashboard/settings/billing?checkout=success&plan=${planId}`,
    cancel_url: `${APP_URL}/dashboard/settings/billing?checkout=cancel`,
    subscription_data: {
      metadata: {
        account_id: account.id,
        plan_id: planId,
      },
    },
    metadata: {
      account_id: account.id,
      plan_id: planId,
    },
    allow_promotion_codes: true,
    billing_address_collection: 'required',
    customer_update: {
      address: 'auto',
      name: 'auto',
    },
  });

  if (!session.url) {
    return NextResponse.json({ error: 'Failed to create checkout session' }, { status: 500 });
  }

  return NextResponse.json({
    url: session.url,
    type: 'checkout',
    plan: planName,
  });
}
