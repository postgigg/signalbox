import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM_ADDRESS = process.env.EMAIL_FROM ?? 'SignalBox <noreply@signalbox.app>';

interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export async function sendEmail(params: SendEmailParams): Promise<void> {
  await resend.emails.send({
    from: FROM_ADDRESS,
    to: params.to,
    subject: params.subject,
    html: params.html,
    text: params.text,
  });
}

export interface NewLeadEmailParams {
  to: string;
  widgetName: string;
  visitorName: string;
  visitorEmail: string;
  leadTier: 'hot' | 'warm' | 'cold';
  leadScore: number;
}

export async function sendNewLeadNotification(params: NewLeadEmailParams): Promise<void> {
  const tierEmoji =
    params.leadTier === 'hot' ? '🔥' : params.leadTier === 'warm' ? '🟡' : '🔵';

  await sendEmail({
    to: params.to,
    subject: `${tierEmoji} New ${params.leadTier} lead from ${params.widgetName}`,
    html: `
      <h2>New Lead Submission</h2>
      <p><strong>Widget:</strong> ${params.widgetName}</p>
      <p><strong>Name:</strong> ${params.visitorName}</p>
      <p><strong>Email:</strong> ${params.visitorEmail}</p>
      <p><strong>Tier:</strong> ${params.leadTier.toUpperCase()}</p>
      <p><strong>Score:</strong> ${params.leadScore}/100</p>
      <p>View this lead in your <a href="${process.env.NEXT_PUBLIC_APP_URL}/leads">SignalBox dashboard</a>.</p>
    `,
    text: `New ${params.leadTier} lead from ${params.widgetName}: ${params.visitorName} (${params.visitorEmail}), score: ${params.leadScore}/100`,
  });
}

export async function sendPaymentFailedEmail(params: {
  to: string;
  accountName: string;
}): Promise<void> {
  await sendEmail({
    to: params.to,
    subject: 'Payment failed — action required',
    html: `
      <h2>Payment Failed</h2>
      <p>We were unable to process the payment for your SignalBox account <strong>${params.accountName}</strong>.</p>
      <p>Please update your payment method in <a href="${process.env.NEXT_PUBLIC_APP_URL}/settings/billing">billing settings</a> to avoid service interruption.</p>
    `,
    text: `Payment failed for ${params.accountName}. Please update your payment method.`,
  });
}
