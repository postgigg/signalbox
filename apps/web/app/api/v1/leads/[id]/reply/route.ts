import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createAdminClient } from '@/lib/supabase/admin';
import { authenticateRequest } from '@/lib/auth';
import { sendEmail } from '@/lib/email';
import { stripHtml } from '@/lib/sanitize';

export const runtime = 'nodejs';

const replySchema = z.object({
  subject: z.string().min(1).max(500).transform(stripHtml),
  body: z.string().min(1).max(5000).transform(stripHtml),
}).strict();

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  const authResult = await authenticateRequest(request);
  if ('error' in authResult) return authResult.error;
  const { account } = authResult.ctx;

  const { id } = await params;

  const rawBody: unknown = await request.json().catch(() => null);
  const parsed = replySchema.safeParse(rawBody);

  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Validation failed', details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const admin = createAdminClient();

  // Fetch the submission and verify ownership
  const { data: submission, error: fetchError } = await admin
    .from('submissions')
    .select('id, visitor_email, visitor_name, account_id')
    .eq('id', id)
    .eq('account_id', account.id)
    .single();

  if (fetchError || !submission) {
    return NextResponse.json(
      { error: 'Lead not found' },
      { status: 404 },
    );
  }

  // Send the email
  const result = await sendEmail({
    to: submission.visitor_email,
    subject: parsed.data.subject,
    html: `<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; font-size: 14px; line-height: 1.6; color: #1E293B;">${parsed.data.body.replace(/\n/g, '<br />')}</div>`,
    text: parsed.data.body,
    ...(account.notification_email ? { replyTo: account.notification_email } : {}),
    tags: [{ name: 'type', value: 'lead_reply' }],
  });

  if (!result.success) {
    return NextResponse.json(
      { error: 'Failed to send email' },
      { status: 500 },
    );
  }

  // Update submission status to contacted
  await admin
    .from('submissions')
    .update({
      status: 'contacted',
      contacted_at: new Date().toISOString(),
    })
    .eq('id', id);

  return NextResponse.json({ success: true });
}
