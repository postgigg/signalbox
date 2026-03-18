import { NextResponse } from 'next/server';

import { createClient } from '@/lib/supabase/server';
import { stripe } from '@/lib/stripe';
import { APP_URL } from '@/lib/constants';

export async function POST(): Promise<NextResponse> {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: memberData } = await supabase
    .from('members')
    .select('account_id')
    .eq('user_id', user.id)
    .limit(1)
    .single();

  if (!memberData) {
    return NextResponse.json({ error: 'Account not found' }, { status: 404 });
  }

  const { data: account } = await supabase
    .from('accounts')
    .select('stripe_customer_id')
    .eq('id', memberData.account_id)
    .single();

  if (!account?.stripe_customer_id) {
    return NextResponse.json(
      { error: 'No billing account configured. Please subscribe to a plan first.' },
      { status: 400 }
    );
  }

  try {
    const session = await stripe.billingPortal.sessions.create({
      customer: account.stripe_customer_id,
      return_url: `${APP_URL}/dashboard/settings/billing`,
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to create billing portal session';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
