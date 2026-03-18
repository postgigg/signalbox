import { sendEmail } from './client';
import { renderNewLeadNotification, renderPaymentFailed } from './templates';

import type { SendEmailResult } from './client';
import type { NewLeadNotificationData, PaymentFailedData } from './templates';

// Re-export client for direct use
export { sendEmail, sendBatchEmails } from './client';
export type { SendEmailOptions, SendEmailResult } from './client';

// Re-export all template renderers
export {
  renderNewLeadNotification,
  renderHotLeadFollowup,
  renderWelcome,
  renderTrialEnding,
  renderTrialExpired,
  renderWeeklyDigest,
  renderPaymentFailed,
  renderWebhookFailures,
} from './templates';

export interface NewLeadEmailParams {
  to: string;
  widgetName: string;
  visitorName: string;
  visitorEmail: string;
  leadTier: 'hot' | 'warm' | 'cold';
  leadScore: number;
  accountName?: string;
  submissionId?: string;
  answers?: Array<{ question: string; label: string }>;
}

export async function sendNewLeadNotification(
  params: NewLeadEmailParams
): Promise<SendEmailResult> {
  const templateData: NewLeadNotificationData = {
    accountName: params.accountName ?? 'Your Account',
    widgetName: params.widgetName,
    visitorName: params.visitorName,
    visitorEmail: params.visitorEmail,
    leadScore: params.leadScore,
    leadTier: params.leadTier,
    submissionId: params.submissionId ?? '',
    answers: params.answers ?? [],
  };

  const rendered = renderNewLeadNotification(templateData);

  return sendEmail({
    to: params.to,
    subject: rendered.subject,
    html: rendered.html,
    text: rendered.text,
    tags: [
      { name: 'type', value: 'new_lead' },
      { name: 'tier', value: params.leadTier },
    ],
  });
}

export async function sendPaymentFailedEmail(params: {
  to: string;
  accountName: string;
  fullName?: string;
  amount?: number;
  currency?: string;
  nextRetryDate?: string | null;
}): Promise<SendEmailResult> {
  const templateData: PaymentFailedData = {
    accountName: params.accountName,
    fullName: params.fullName ?? 'there',
    amount: params.amount ?? 0,
    currency: params.currency ?? 'usd',
    nextRetryDate: params.nextRetryDate ?? null,
  };

  const rendered = renderPaymentFailed(templateData);

  return sendEmail({
    to: params.to,
    subject: rendered.subject,
    html: rendered.html,
    text: rendered.text,
    tags: [{ name: 'type', value: 'payment_failed' }],
  });
}
