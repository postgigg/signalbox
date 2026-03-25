import crypto from 'node:crypto';

import { NextRequest, NextResponse } from 'next/server';

import { z } from 'zod';

import { createAdminClient } from '@/lib/supabase/admin';

export const runtime = 'nodejs';

const WEBHOOK_SECRET = process.env.RESEND_WEBHOOK_SECRET ?? '';

const InboundPayloadSchema = z.object({
  type: z.string().optional(),
  data: z.object({
    from: z.string().max(500),
    to: z.union([z.string().max(500), z.array(z.string().max(500))]),
    subject: z.string().max(1000).default('(No subject)'),
    html: z.string().max(500000).optional().default(''),
    text: z.string().max(500000).optional().default(''),
    cc: z.union([z.string().max(2000), z.array(z.string())]).optional(),
    bcc: z.union([z.string().max(2000), z.array(z.string())]).optional(),
    reply_to: z.string().max(500).optional(),
    message_id: z.string().min(1).max(500),
    spam_status: z.string().max(50).optional(),
  }).passthrough(),
}).passthrough();

function parseEmailAddress(raw: string): { name: string; email: string } {
  const match = raw.match(/^(.+?)\s*<([^>]+)>$/);
  if (match) {
    return { name: match[1]?.trim() ?? '', email: match[2]?.trim() ?? raw };
  }
  return { name: '', email: raw.trim() };
}

function normalizeToArray(value: string | string[] | undefined): string[] {
  if (value === undefined) {
    return [];
  }
  if (Array.isArray(value)) {
    return value;
  }
  return [value];
}

function verifySignature(rawBody: string, signatureHeader: string | null): boolean {
  if (!WEBHOOK_SECRET || !signatureHeader) return false;
  const expectedSignature = crypto
    .createHmac('sha256', WEBHOOK_SECRET)
    .update(rawBody)
    .digest('base64');
  const signatures = signatureHeader.split(' ');
  return signatures.some((sig) => {
    const value = sig.startsWith('v1,') ? sig.slice(3) : sig;
    return crypto.timingSafeEqual(
      Buffer.from(expectedSignature),
      Buffer.from(value),
    );
  });
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  const rawBody = await request.text();

  if (WEBHOOK_SECRET) {
    const signature = request.headers.get('svix-signature');
    if (!verifySignature(rawBody, signature)) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }
  }

  let body: unknown;
  try {
    body = JSON.parse(rawBody);
  } catch {
    return NextResponse.json(
      { error: 'Invalid JSON body' },
      { status: 400 },
    );
  }

  const parsed = InboundPayloadSchema.safeParse(body);
  if (!parsed.success) {
    console.error('[resend-inbound] Validation failed:', parsed.error.flatten());
    return NextResponse.json(
      { error: 'Validation failed', details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const { data: payload } = parsed;
  const inbound = payload.data;

  const { name: fromName, email: fromEmail } = parseEmailAddress(inbound.from);
  const toAddresses = normalizeToArray(inbound.to);
  const ccAddresses = normalizeToArray(inbound.cc);
  const bccAddresses = normalizeToArray(inbound.bcc);

  const admin = createAdminClient();

  const { error: insertError } = await admin
    .from('inbound_emails')
    .insert({
      message_id: inbound.message_id,
      from_email: fromEmail,
      from_name: fromName,
      to_email: toAddresses.join(', '),
      cc: ccAddresses.length > 0 ? ccAddresses.join(', ') : null,
      bcc: bccAddresses.length > 0 ? bccAddresses.join(', ') : null,
      reply_to: inbound.reply_to ?? null,
      subject: inbound.subject,
      body_html: inbound.html ?? '',
      body_text: inbound.text ?? '',
      spam_status: inbound.spam_status ?? null,
    });

  if (insertError) {
    // Handle duplicate message_id gracefully (unique constraint violation code: 23505)
    if (insertError.code === '23505') {
      return NextResponse.json({ received: true, duplicate: true });
    }

    console.error('[resend-inbound] Insert failed:', insertError.message);
    return NextResponse.json(
      { error: 'Database error' },
      { status: 500 },
    );
  }

  return NextResponse.json({ received: true });
}
