import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

import { authenticateRequest } from '@/lib/auth';
import { createAdminClient } from '@/lib/supabase/admin';
import { DEMO_ACCOUNT_ID } from '@/lib/constants';

export const runtime = 'nodejs';

const switchPlanSchema = z.object({
  plan: z.enum(['trial', 'starter', 'pro', 'agency']),
}).strict();

export async function POST(request: NextRequest): Promise<NextResponse> {
  const authResult = await authenticateRequest(request);
  if ('error' in authResult) return authResult.error;
  const { account } = authResult.ctx;

  if (account.id !== DEMO_ACCOUNT_ID) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const parsed = switchPlanSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Validation failed', details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const newPlan = parsed.data.plan;
  const subscriptionStatus = newPlan === 'trial' ? 'trialing' : 'active';

  const admin = createAdminClient();
  const { error: updateError } = await admin
    .from('accounts')
    .update({ plan: newPlan, subscription_status: subscriptionStatus })
    .eq('id', DEMO_ACCOUNT_ID);

  if (updateError) {
    return NextResponse.json({ error: 'Failed to update plan' }, { status: 500 });
  }

  return NextResponse.json({ plan: newPlan });
}
