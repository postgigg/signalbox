import { sendEmail } from './client';
import { renderNewLeadNotification, renderPaymentFailed, renderLeadAssigned, renderTeamInvite } from './templates';

import type { SendEmailResult } from './client';
import type { NewLeadNotificationData, PaymentFailedData, LeadAssignedData, TeamInviteData } from './templates';

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
  renderLeadAssigned,
  renderTeamInvite,
  renderSubmissionConfirmation,
  renderBookingConfirmation,
  renderBookingAlert,
  renderBookingReminder,
  renderBookingRescheduled,
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

export interface LeadAssignedEmailParams {
  to: string;
  assigneeName: string;
  accountName: string;
  widgetName: string;
  visitorName: string;
  visitorEmail: string;
  leadTier: 'hot' | 'warm' | 'cold';
  leadScore: number;
  submissionId: string;
  ruleName: string;
}

export async function sendLeadAssignedNotification(
  params: LeadAssignedEmailParams
): Promise<SendEmailResult> {
  const templateData: LeadAssignedData = {
    assigneeName: params.assigneeName,
    accountName: params.accountName,
    widgetName: params.widgetName,
    visitorName: params.visitorName,
    visitorEmail: params.visitorEmail,
    leadScore: params.leadScore,
    leadTier: params.leadTier,
    submissionId: params.submissionId,
    ruleName: params.ruleName,
  };

  const rendered = renderLeadAssigned(templateData);

  return sendEmail({
    to: params.to,
    subject: rendered.subject,
    html: rendered.html,
    text: rendered.text,
    tags: [
      { name: 'type', value: 'lead_assigned' },
      { name: 'tier', value: params.leadTier },
    ],
  });
}

export interface TeamInviteEmailParams {
  to: string;
  accountName: string;
  inviterName: string;
  role: string;
}

export async function sendTeamInviteEmail(
  params: TeamInviteEmailParams
): Promise<SendEmailResult> {
  const templateData: TeamInviteData = {
    accountName: params.accountName,
    inviterName: params.inviterName,
    invitedEmail: params.to,
    role: params.role,
  };

  const rendered = renderTeamInvite(templateData);

  return sendEmail({
    to: params.to,
    subject: rendered.subject,
    html: rendered.html,
    text: rendered.text,
    tags: [{ name: 'type', value: 'team_invite' }],
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
