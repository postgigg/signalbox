import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

import { createAdminClient } from '@/lib/supabase/admin';
import { wixWebhookLimit, checkRateLimit, rateLimitHeaders } from '@/lib/rate-limit';
import { verifyWixWebhookSignature } from '@/lib/wix';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const WIX_SIGNATURE_HEADER = 'x-wix-signature';

const WIX_EVENT_TYPES = [
  'AppInstalled',
  'AppRemoved',
  'BillingEvent',
] as const;

type WixEventType = (typeof WIX_EVENT_TYPES)[number];

// ---------------------------------------------------------------------------
// Webhook payload schema
// ---------------------------------------------------------------------------

const webhookPayloadSchema = z.object({
  eventType: z.enum(WIX_EVENT_TYPES),
  instanceId: z.string().min(1).max(500),
  data: z.record(z.unknown()).optional(),
});

// ---------------------------------------------------------------------------
// POST — Handle Wix lifecycle webhooks
// ---------------------------------------------------------------------------

export async function POST(request: NextRequest): Promise<NextResponse> {
  // 1. Rate limit
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown';
  const rlResult = await checkRateLimit(wixWebhookLimit(), ip);
  if (!rlResult.success) {
    return NextResponse.json(
      { error: 'Too many requests' },
      { status: 429, headers: rateLimitHeaders(rlResult) }
    );
  }

  // 2. Read raw body for signature verification
  const rawBody = await request.text();

  // 3. Verify Wix webhook signature
  const signature = request.headers.get(WIX_SIGNATURE_HEADER);
  if (!signature) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 401 });
  }

  const isValid = verifyWixWebhookSignature(rawBody, signature);
  if (!isValid) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }

  // 4. Parse and validate body
  let body: unknown;
  try {
    body = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const parsed = webhookPayloadSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Validation failed', details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { eventType, instanceId } = parsed.data;

  // 5. Handle event
  const admin = createAdminClient();

  switch (eventType as WixEventType) {
    case 'AppRemoved': {
      const { error: updateError } = await admin
        .from('wix_installations')
        .update({
          is_active: false,
          uninstalled_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('wix_instance_id', instanceId);

      if (updateError) {
        return NextResponse.json({ error: 'Failed to process uninstall' }, { status: 500 });
      }
      break;
    }

    case 'AppInstalled': {
      // Installation is handled via the OAuth callback route.
      // This webhook serves as a confirmation. Mark as active if exists.
      const { error: activateError } = await admin
        .from('wix_installations')
        .update({
          is_active: true,
          uninstalled_at: null,
          updated_at: new Date().toISOString(),
        })
        .eq('wix_instance_id', instanceId);

      if (activateError) {
        return NextResponse.json({ error: 'Failed to process install event' }, { status: 500 });
      }
      break;
    }

    case 'BillingEvent': {
      // Billing events from Wix are acknowledged but not processed.
      // HawkLeads billing is handled via Stripe.
      break;
    }
  }

  // 6. Return 200 OK
  return NextResponse.json({ received: true }, { status: 200 });
}
