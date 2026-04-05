import { APP_NAME, APP_URL, SUPPORT_EMAIL, TIER_CONFIG } from '../constants';
import { formatDate, formatCurrency, formatNumber } from '../utils';

// ---------------------------------------------------------------------------
// Booking date/time helper
// ---------------------------------------------------------------------------

function formatBookingDateTime(
  startsAt: string,
  timezone: string,
  durationMinutes: number
): { dateStr: string; timeStr: string; endTimeStr: string; tzAbbr: string } {
  const start = new Date(startsAt);
  const end = new Date(start.getTime() + durationMinutes * 60 * 1000);

  const dateStr = new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    timeZone: timezone,
  }).format(start);

  const timeStr = new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
    timeZone: timezone,
  }).format(start);

  const endTimeStr = new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
    timeZone: timezone,
  }).format(end);

  const tzAbbr = new Intl.DateTimeFormat('en-US', {
    timeZoneName: 'short',
    timeZone: timezone,
  }).formatToParts(start).find((p) => p.type === 'timeZoneName')?.value ?? timezone;

  return { dateStr, timeStr, endTimeStr, tzAbbr };
}

// ---------------------------------------------------------------------------
// Shared layout
// ---------------------------------------------------------------------------

function layout(content: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <style>
    body { margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f4f4f5; color: #18181b; }
    .container { max-width: 600px; margin: 0 auto; padding: 32px 16px; }
    .card { background: #ffffff; border-radius: 8px; padding: 32px; border: 1px solid #e4e4e7; }
    .header { text-align: center; padding-bottom: 24px; border-bottom: 1px solid #e4e4e7; margin-bottom: 24px; }
    .header h1 { margin: 0; font-size: 20px; font-weight: 700; color: #0f172a; }
    .footer { text-align: center; padding-top: 24px; font-size: 12px; color: #71717a; }
    .footer a { color: #3b82f6; text-decoration: none; }
    .btn { display: inline-block; padding: 12px 24px; background-color: #3b82f6; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 14px; }
    .btn:hover { background-color: #2563eb; }
    .tier-badge { display: inline-block; padding: 4px 12px; border-radius: 9999px; font-size: 12px; font-weight: 600; }
    h2 { font-size: 18px; margin: 0 0 8px; }
    p { margin: 0 0 16px; line-height: 1.6; font-size: 14px; color: #3f3f46; }
    .stat { text-align: center; padding: 12px; }
    .stat-value { font-size: 28px; font-weight: 700; color: #0f172a; }
    .stat-label { font-size: 12px; color: #71717a; text-transform: uppercase; }
    table { width: 100%; border-collapse: collapse; }
    td { padding: 8px 0; font-size: 14px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="card">
      <div class="header">
        <table cellpadding="0" cellspacing="0" border="0" style="margin:0 auto;">
          <tr>
            <td style="vertical-align:middle;padding-right:8px;">
              <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" width="24" height="24">
                <path d="M12 8L22 56" stroke="#0f172a" stroke-width="6" stroke-linecap="round" />
                <path d="M26 4L40 60" stroke="#0f172a" stroke-width="7" stroke-linecap="round" />
                <path d="M44 12L50 52" stroke="#0f172a" stroke-width="5" stroke-linecap="round" />
              </svg>
            </td>
            <td style="vertical-align:middle;">
              <h1 style="margin:0;font-size:20px;font-weight:700;color:#0f172a;">${APP_NAME}</h1>
            </td>
          </tr>
        </table>
      </div>
      ${content}
      <div class="footer">
        <p>&copy; ${new Date().getFullYear()} <a href="https://hawkleads.io" style="color:#3b82f6;text-decoration:none;">hawkleads.io</a> (a WorkBird LLC company)</p>
        <p><a href="${APP_URL}">Dashboard</a> &middot; <a href="mailto:${SUPPORT_EMAIL}">Support</a></p>
      </div>
    </div>
  </div>
</body>
</html>`;
}

// ---------------------------------------------------------------------------
// Template: Submission confirmation (auto-reply to visitor)
// ---------------------------------------------------------------------------

export interface SubmissionConfirmationData {
  visitorName: string;
  accountName: string;
  widgetName: string;
  answers: Array<{ question: string; label: string }>;
}

export function renderSubmissionConfirmation(
  data: SubmissionConfirmationData
): { subject: string; html: string; text: string } {
  const firstName = data.visitorName.split(' ')[0] ?? data.visitorName;

  const answersHtml = data.answers
    .map(
      (a) =>
        `<tr><td style="color:#71717a;padding:4px 8px 4px 0;">${a.question}</td><td style="font-weight:600;padding:4px 0;">${a.label}</td></tr>`
    )
    .join('');

  const answersText = data.answers
    .map((a) => `  ${a.question}: ${a.label}`)
    .join('\n');

  const html = layout(`
    <h2>Thanks for reaching out, ${firstName}!</h2>
    <p>We received your submission to <strong>${data.accountName}</strong> and will be in touch shortly.</p>
    ${answersHtml.length > 0 ? `
    <p style="margin-top:16px;font-weight:600;font-size:14px;">Your responses:</p>
    <table>${answersHtml}</table>
    ` : ''}
    <p style="margin-top:16px;">If you have any additional questions, you can reply directly to this email.</p>
  `);

  const text = `Thanks for reaching out, ${firstName}!

We received your submission to ${data.accountName} and will be in touch shortly.

${answersText.length > 0 ? `Your responses:\n${answersText}\n` : ''}
If you have any additional questions, you can reply directly to this email.`;

  return {
    subject: `We received your submission — ${data.accountName}`,
    html,
    text,
  };
}

// ---------------------------------------------------------------------------
// Template: New lead notification
// ---------------------------------------------------------------------------

export interface NewLeadNotificationData {
  accountName: string;
  widgetName: string;
  visitorName: string;
  visitorEmail: string;
  leadScore: number;
  leadTier: 'hot' | 'warm' | 'cold';
  submissionId: string;
  answers: Array<{ question: string; label: string }>;
}

export function renderNewLeadNotification(
  data: NewLeadNotificationData
): { subject: string; html: string; text: string } {
  const tierConfig = TIER_CONFIG[data.leadTier];
  const dashboardUrl = `${APP_URL}/dashboard/leads/${data.submissionId}`;

  const answersHtml = data.answers
    .map(
      (a) =>
        `<tr><td style="color:#71717a;padding:4px 8px 4px 0;">${a.question}</td><td style="font-weight:600;padding:4px 0;">${a.label}</td></tr>`
    )
    .join('');

  const answersText = data.answers
    .map((a) => `  ${a.question}: ${a.label}`)
    .join('\n');

  const html = layout(`
    <h2>New ${tierConfig.label} Lead</h2>
    <p><strong>${data.visitorName}</strong> (${data.visitorEmail}) just submitted a response on <strong>${data.widgetName}</strong>.</p>
    <div style="text-align:center;margin:16px 0;">
      <span class="tier-badge" style="background-color:${tierConfig.bgColor};color:${tierConfig.textColor};">
        ${tierConfig.label} &mdash; Score: ${data.leadScore}/100
      </span>
    </div>
    <table>${answersHtml}</table>
    <div style="text-align:center;margin:24px 0;">
      <a class="btn" href="${dashboardUrl}">View Lead</a>
    </div>
  `);

  const text = `New ${tierConfig.label} Lead for ${data.widgetName}

${data.visitorName} (${data.visitorEmail})
Score: ${data.leadScore}/100

Answers:
${answersText}

View lead: ${dashboardUrl}`;

  return {
    subject: `[${tierConfig.label}] New lead from ${data.visitorName} — ${data.accountName}`,
    html,
    text,
  };
}

// ---------------------------------------------------------------------------
// Template: Hot lead followup suggestion
// ---------------------------------------------------------------------------

export interface HotLeadFollowupData {
  accountName: string;
  visitorName: string;
  visitorEmail: string;
  leadScore: number;
  suggestedOpener: string;
  submissionId: string;
}

export function renderHotLeadFollowup(
  data: HotLeadFollowupData
): { subject: string; html: string; text: string } {
  const dashboardUrl = `${APP_URL}/dashboard/leads/${data.submissionId}`;

  const html = layout(`
    <h2>Hot Lead Requires Followup</h2>
    <p><strong>${data.visitorName}</strong> scored <strong>${data.leadScore}/100</strong> and is waiting to hear from you.</p>
    <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:6px;padding:16px;margin:16px 0;">
      <p style="margin:0;font-style:italic;color:#166534;">"${data.suggestedOpener}"</p>
    </div>
    <p>Respond quickly to maximize your conversion rate.</p>
    <div style="text-align:center;margin:24px 0;">
      <a class="btn" href="${dashboardUrl}">Respond Now</a>
    </div>
  `);

  const text = `Hot Lead Requires Followup

${data.visitorName} (${data.visitorEmail}) scored ${data.leadScore}/100.

Suggested opener:
"${data.suggestedOpener}"

Respond now: ${dashboardUrl}`;

  return {
    subject: `Action needed: ${data.visitorName} is a hot lead — ${data.accountName}`,
    html,
    text,
  };
}

// ---------------------------------------------------------------------------
// Template: Welcome
// ---------------------------------------------------------------------------

export interface WelcomeData {
  fullName: string;
  accountName: string;
}

export function renderWelcome(
  data: WelcomeData
): { subject: string; html: string; text: string } {
  const firstName = data.fullName.split(' ')[0] ?? data.fullName;
  const dashboardUrl = `${APP_URL}/dashboard`;

  const html = layout(`
    <h2>Welcome to ${APP_NAME}, ${firstName}!</h2>
    <p>Your account <strong>${data.accountName}</strong> is ready. Here's how to get started:</p>
    <ol style="font-size:14px;color:#3f3f46;line-height:2;">
      <li>Create your first widget and customize its look</li>
      <li>Build a qualification flow with scored questions</li>
      <li>Install the embed snippet on your website</li>
      <li>Watch leads roll in with scores and suggested openers</li>
    </ol>
    <div style="text-align:center;margin:24px 0;">
      <a class="btn" href="${dashboardUrl}">Go to Dashboard</a>
    </div>
    <p>Your 30-day free trial is now active. You have full access to all features.</p>
    <p>Questions? Just reply to this email or contact us at <a href="mailto:${SUPPORT_EMAIL}">${SUPPORT_EMAIL}</a>.</p>
  `);

  const text = `Welcome to ${APP_NAME}, ${firstName}!

Your account "${data.accountName}" is ready.

Get started:
1. Create your first widget and customize its look
2. Build a qualification flow with scored questions
3. Install the embed snippet on your website
4. Watch leads roll in with scores and suggested openers

Go to dashboard: ${dashboardUrl}

Your 30-day free trial is now active.

Questions? Reply to this email or contact ${SUPPORT_EMAIL}.`;

  return {
    subject: `Welcome to ${APP_NAME} — let's get started`,
    html,
    text,
  };
}

// ---------------------------------------------------------------------------
// Template: Trial ending
// ---------------------------------------------------------------------------

export interface TrialEndingData {
  accountName: string;
  fullName: string;
  daysRemaining: number;
  totalLeads: number;
}

export function renderTrialEnding(
  data: TrialEndingData
): { subject: string; html: string; text: string } {
  const firstName = data.fullName.split(' ')[0] ?? data.fullName;
  const pricingUrl = `${APP_URL}/dashboard/settings/billing`;

  const html = layout(`
    <h2>Your trial ends in ${data.daysRemaining} day${data.daysRemaining === 1 ? '' : 's'}</h2>
    <p>Hey ${firstName}, your ${APP_NAME} trial for <strong>${data.accountName}</strong> is almost over.</p>
    ${data.totalLeads > 0 ? `<p>You've captured <strong>${formatNumber(data.totalLeads)} lead${data.totalLeads === 1 ? '' : 's'}</strong> so far. Don't lose access to your data.</p>` : '<p>Upgrade now to start capturing and qualifying leads.</p>'}
    <div style="text-align:center;margin:24px 0;">
      <a class="btn" href="${pricingUrl}">Upgrade Now</a>
    </div>
    <p>Plans start at just $29/month. No contracts, cancel anytime.</p>
  `);

  const text = `Your trial ends in ${data.daysRemaining} day${data.daysRemaining === 1 ? '' : 's'}

Hey ${firstName}, your ${APP_NAME} trial for "${data.accountName}" is almost over.

${data.totalLeads > 0 ? `You've captured ${formatNumber(data.totalLeads)} lead${data.totalLeads === 1 ? '' : 's'} so far.` : ''}

Upgrade now: ${pricingUrl}

Plans start at just $29/month. No contracts, cancel anytime.`;

  return {
    subject: `Your ${APP_NAME} trial ends in ${data.daysRemaining} day${data.daysRemaining === 1 ? '' : 's'}`,
    html,
    text,
  };
}

// ---------------------------------------------------------------------------
// Template: Trial expired
// ---------------------------------------------------------------------------

export interface TrialExpiredData {
  accountName: string;
  fullName: string;
  totalLeads: number;
}

export function renderTrialExpired(
  data: TrialExpiredData
): { subject: string; html: string; text: string } {
  const firstName = data.fullName.split(' ')[0] ?? data.fullName;
  const pricingUrl = `${APP_URL}/dashboard/settings/billing`;

  const html = layout(`
    <h2>Your trial has expired</h2>
    <p>Hey ${firstName}, your free trial for <strong>${data.accountName}</strong> has ended.</p>
    <p>Your widgets are now paused and will no longer collect new submissions. ${data.totalLeads > 0 ? `Your existing <strong>${formatNumber(data.totalLeads)} lead${data.totalLeads === 1 ? '' : 's'}</strong> are still safe.` : ''}</p>
    <div style="text-align:center;margin:24px 0;">
      <a class="btn" href="${pricingUrl}">Choose a Plan</a>
    </div>
    <p>Upgrade to reactivate your widgets instantly.</p>
  `);

  const text = `Your trial has expired

Hey ${firstName}, your free trial for "${data.accountName}" has ended.

Your widgets are now paused. ${data.totalLeads > 0 ? `Your ${formatNumber(data.totalLeads)} lead${data.totalLeads === 1 ? '' : 's'} are still safe.` : ''}

Choose a plan: ${pricingUrl}`;

  return {
    subject: `Your ${APP_NAME} trial has expired — upgrade to continue`,
    html,
    text,
  };
}

// ---------------------------------------------------------------------------
// Template: Weekly digest
// ---------------------------------------------------------------------------

export interface WeeklyDigestData {
  accountName: string;
  fullName: string;
  weekStart: string;
  weekEnd: string;
  totalSubmissions: number;
  hotLeads: number;
  warmLeads: number;
  coldLeads: number;
  avgScore: number;
  topWidget: string | null;
  conversionRate: number;
}

export function renderWeeklyDigest(
  data: WeeklyDigestData
): { subject: string; html: string; text: string } {
  const firstName = data.fullName.split(' ')[0] ?? data.fullName;
  const dashboardUrl = `${APP_URL}/dashboard`;

  const html = layout(`
    <h2>Weekly Report</h2>
    <p>Hey ${firstName}, here's your ${APP_NAME} summary for <strong>${formatDate(data.weekStart)} &ndash; ${formatDate(data.weekEnd)}</strong>.</p>
    <table style="width:100%;margin:16px 0;">
      <tr>
        <td class="stat" style="width:33%;text-align:center;">
          <div class="stat-value">${formatNumber(data.totalSubmissions)}</div>
          <div class="stat-label">Submissions</div>
        </td>
        <td class="stat" style="width:33%;text-align:center;">
          <div class="stat-value">${Math.round(data.avgScore)}</div>
          <div class="stat-label">Avg Score</div>
        </td>
        <td class="stat" style="width:33%;text-align:center;">
          <div class="stat-value">${data.conversionRate.toFixed(1)}%</div>
          <div class="stat-label">Conversion</div>
        </td>
      </tr>
    </table>
    <table style="width:100%;margin:8px 0;">
      <tr>
        <td style="padding:4px 0;"><span class="tier-badge" style="background-color:${TIER_CONFIG.hot.bgColor};color:${TIER_CONFIG.hot.textColor};">Hot</span></td>
        <td style="text-align:right;font-weight:600;">${data.hotLeads}</td>
      </tr>
      <tr>
        <td style="padding:4px 0;"><span class="tier-badge" style="background-color:${TIER_CONFIG.warm.bgColor};color:${TIER_CONFIG.warm.textColor};">Warm</span></td>
        <td style="text-align:right;font-weight:600;">${data.warmLeads}</td>
      </tr>
      <tr>
        <td style="padding:4px 0;"><span class="tier-badge" style="background-color:${TIER_CONFIG.cold.bgColor};color:${TIER_CONFIG.cold.textColor};">Cold</span></td>
        <td style="text-align:right;font-weight:600;">${data.coldLeads}</td>
      </tr>
    </table>
    ${data.topWidget ? `<p>Top performing widget: <strong>${data.topWidget}</strong></p>` : ''}
    <div style="text-align:center;margin:24px 0;">
      <a class="btn" href="${dashboardUrl}">View Dashboard</a>
    </div>
  `);

  const text = `Weekly Report for ${data.accountName}
${formatDate(data.weekStart)} - ${formatDate(data.weekEnd)}

Total Submissions: ${formatNumber(data.totalSubmissions)}
Average Score: ${Math.round(data.avgScore)}
Conversion Rate: ${data.conversionRate.toFixed(1)}%

Hot: ${data.hotLeads} | Warm: ${data.warmLeads} | Cold: ${data.coldLeads}

${data.topWidget ? `Top widget: ${data.topWidget}` : ''}

View dashboard: ${dashboardUrl}`;

  return {
    subject: `${APP_NAME} Weekly Report: ${formatNumber(data.totalSubmissions)} submissions — ${data.accountName}`,
    html,
    text,
  };
}

// ---------------------------------------------------------------------------
// Template: Payment failed
// ---------------------------------------------------------------------------

export interface PaymentFailedData {
  accountName: string;
  fullName: string;
  amount: number;
  currency: string;
  nextRetryDate: string | null;
}

export function renderPaymentFailed(
  data: PaymentFailedData
): { subject: string; html: string; text: string } {
  const firstName = data.fullName.split(' ')[0] ?? data.fullName;
  const billingUrl = `${APP_URL}/dashboard/settings/billing`;

  const html = layout(`
    <h2>Payment Failed</h2>
    <p>Hey ${firstName}, we were unable to process your payment of <strong>${formatCurrency(data.amount, data.currency)}</strong> for <strong>${data.accountName}</strong>.</p>
    ${data.nextRetryDate ? `<p>We'll automatically retry on <strong>${formatDate(data.nextRetryDate)}</strong>.</p>` : ''}
    <p>Please update your payment method to avoid service interruption.</p>
    <div style="text-align:center;margin:24px 0;">
      <a class="btn" href="${billingUrl}">Update Payment Method</a>
    </div>
    <p style="font-size:12px;color:#71717a;">If your payment method is already up to date, please contact your bank or reach out to us at <a href="mailto:${SUPPORT_EMAIL}">${SUPPORT_EMAIL}</a>.</p>
  `);

  const text = `Payment Failed

Hey ${firstName}, we couldn't process your payment of ${formatCurrency(data.amount, data.currency)} for "${data.accountName}".

${data.nextRetryDate ? `We'll retry on ${formatDate(data.nextRetryDate)}.` : ''}

Update your payment method: ${billingUrl}

Contact ${SUPPORT_EMAIL} if you need help.`;

  return {
    subject: `Payment failed for ${data.accountName} — action required`,
    html,
    text,
  };
}

// ---------------------------------------------------------------------------
// Template: Webhook failures
// ---------------------------------------------------------------------------

export interface WebhookFailuresData {
  accountName: string;
  fullName: string;
  webhookUrl: string;
  failureCount: number;
  lastStatusCode: number | null;
  lastTriggeredAt: string | null;
}

export function renderWebhookFailures(
  data: WebhookFailuresData
): { subject: string; html: string; text: string } {
  const firstName = data.fullName.split(' ')[0] ?? data.fullName;
  const settingsUrl = `${APP_URL}/dashboard/settings/webhooks`;

  const html = layout(`
    <h2>Webhook Delivery Failures</h2>
    <p>Hey ${firstName}, your webhook endpoint has been failing for <strong>${data.accountName}</strong>.</p>
    <table style="width:100%;margin:16px 0;font-size:14px;">
      <tr><td style="padding:4px 0;color:#71717a;">Endpoint</td><td style="font-weight:600;">${data.webhookUrl}</td></tr>
      <tr><td style="padding:4px 0;color:#71717a;">Consecutive failures</td><td style="font-weight:600;color:#ef4444;">${data.failureCount}</td></tr>
      ${data.lastStatusCode ? `<tr><td style="padding:4px 0;color:#71717a;">Last status code</td><td style="font-weight:600;">${data.lastStatusCode}</td></tr>` : ''}
      ${data.lastTriggeredAt ? `<tr><td style="padding:4px 0;color:#71717a;">Last attempt</td><td style="font-weight:600;">${formatDate(data.lastTriggeredAt, { hour: 'numeric', minute: 'numeric' })}</td></tr>` : ''}
    </table>
    <p>After 10 consecutive failures, the webhook will be automatically disabled.</p>
    <div style="text-align:center;margin:24px 0;">
      <a class="btn" href="${settingsUrl}">Check Webhooks</a>
    </div>
  `);

  const text = `Webhook Delivery Failures

Hey ${firstName}, your webhook endpoint has been failing for "${data.accountName}".

Endpoint: ${data.webhookUrl}
Consecutive failures: ${data.failureCount}
${data.lastStatusCode ? `Last status code: ${data.lastStatusCode}` : ''}
${data.lastTriggeredAt ? `Last attempt: ${formatDate(data.lastTriggeredAt)}` : ''}

After 10 consecutive failures, the webhook will be automatically disabled.

Check webhooks: ${settingsUrl}`;

  return {
    subject: `Webhook failures detected — ${data.accountName}`,
    html,
    text,
  };
}

// ---------------------------------------------------------------------------
// Template: Team invite
// ---------------------------------------------------------------------------

export interface TeamInviteData {
  accountName: string;
  inviterName: string;
  invitedEmail: string;
  role: string;
}

export function renderTeamInvite(
  data: TeamInviteData
): { subject: string; html: string; text: string } {
  const signupUrl = `${APP_URL}/signup?email=${encodeURIComponent(data.invitedEmail)}`;
  const loginUrl = `${APP_URL}/login?email=${encodeURIComponent(data.invitedEmail)}`;

  const html = layout(`
    <h2>You've been invited to ${APP_NAME}</h2>
    <p><strong>${data.inviterName}</strong> has invited you to join <strong>${data.accountName}</strong> as ${data.role === 'admin' ? 'an' : 'a'} <strong>${data.role}</strong>.</p>
    <p>${APP_NAME} helps teams capture, score, and route leads automatically. Create an account with <strong>${data.invitedEmail}</strong> to accept your invitation.</p>
    <div style="text-align:center;margin:24px 0;">
      <a class="btn" href="${signupUrl}">Accept Invitation</a>
    </div>
    <p style="font-size:12px;color:#71717a;">Already have an account? <a href="${loginUrl}" style="color:#3b82f6;text-decoration:none;">Log in instead</a>.</p>
    <p style="font-size:12px;color:#71717a;">If you don't recognize this invitation, you can safely ignore this email.</p>
  `);

  const text = `You've been invited to ${APP_NAME}

${data.inviterName} has invited you to join "${data.accountName}" as a ${data.role}.

Create an account with ${data.invitedEmail} to accept your invitation:
${signupUrl}

Already have an account? Log in instead: ${loginUrl}

If you don't recognize this invitation, you can safely ignore this email.`;

  return {
    subject: `${data.inviterName} invited you to ${data.accountName} on ${APP_NAME}`,
    html,
    text,
  };
}

// ---------------------------------------------------------------------------
// Template: Lead assigned notification
// ---------------------------------------------------------------------------

export interface LeadAssignedData {
  assigneeName: string;
  accountName: string;
  widgetName: string;
  visitorName: string;
  visitorEmail: string;
  leadScore: number;
  leadTier: 'hot' | 'warm' | 'cold';
  submissionId: string;
  ruleName: string;
}

export function renderLeadAssigned(
  data: LeadAssignedData
): { subject: string; html: string; text: string } {
  const firstName = data.assigneeName.split(' ')[0] ?? data.assigneeName;
  const tierConfig = TIER_CONFIG[data.leadTier];
  const dashboardUrl = `${APP_URL}/dashboard/leads/${data.submissionId}`;

  const html = layout(`
    <h2>Lead Assigned to You</h2>
    <p>Hey ${firstName}, a new lead has been routed to you via the rule <strong>${data.ruleName}</strong>.</p>
    <table style="width:100%;margin:16px 0;font-size:14px;">
      <tr><td style="padding:4px 0;color:#71717a;">Name</td><td style="font-weight:600;">${data.visitorName}</td></tr>
      <tr><td style="padding:4px 0;color:#71717a;">Email</td><td style="font-weight:600;">${data.visitorEmail}</td></tr>
      <tr><td style="padding:4px 0;color:#71717a;">Widget</td><td style="font-weight:600;">${data.widgetName}</td></tr>
    </table>
    <div style="text-align:center;margin:16px 0;">
      <span class="tier-badge" style="background-color:${tierConfig.bgColor};color:${tierConfig.textColor};">
        ${tierConfig.label} &mdash; Score: ${data.leadScore}/100
      </span>
    </div>
    <div style="text-align:center;margin:24px 0;">
      <a class="btn" href="${dashboardUrl}">View Lead</a>
    </div>
  `);

  const text = `Lead Assigned to You

Hey ${firstName}, a new lead has been routed to you via the rule "${data.ruleName}".

Name: ${data.visitorName}
Email: ${data.visitorEmail}
Widget: ${data.widgetName}
Tier: ${tierConfig.label}
Score: ${data.leadScore}/100

View lead: ${dashboardUrl}`;

  return {
    subject: `[${tierConfig.label}] Lead assigned to you: ${data.visitorName} — ${data.accountName}`,
    html,
    text,
  };
}

// ---------------------------------------------------------------------------
// Template: Booking confirmation (to visitor)
// ---------------------------------------------------------------------------

export interface BookingConfirmationData {
  visitorName: string;
  accountName: string;
  startsAt: string;
  timezone: string;
  durationMinutes: number;
  rescheduleUrl: string;
}

export function renderBookingConfirmation(
  data: BookingConfirmationData
): { subject: string; html: string; text: string } {
  const firstName = data.visitorName.split(' ')[0] ?? data.visitorName;
  const { dateStr, timeStr, endTimeStr, tzAbbr } = formatBookingDateTime(
    data.startsAt,
    data.timezone,
    data.durationMinutes
  );

  const html = layout(`
    <h2>Your call is confirmed</h2>
    <p>Hey ${firstName}, your call with <strong>${data.accountName}</strong> is booked.</p>
    <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:20px;margin:16px 0;text-align:center;">
      <p style="margin:0 0 4px;font-size:16px;font-weight:700;color:#166534;">${dateStr}</p>
      <p style="margin:0;font-size:14px;color:#166534;">${timeStr} - ${endTimeStr} (${tzAbbr})</p>
      <p style="margin:8px 0 0;font-size:12px;color:#166534;">${data.durationMinutes} minutes</p>
    </div>
    <p>Need to change the time? You can reschedule using the link below.</p>
    <div style="text-align:center;margin:24px 0;">
      <a class="btn" href="${data.rescheduleUrl}">Reschedule</a>
    </div>
  `);

  const text = `Your call is confirmed

Hey ${firstName}, your call with ${data.accountName} is booked.

${dateStr}
${timeStr} - ${endTimeStr} (${tzAbbr})
${data.durationMinutes} minutes

Need to change the time? Reschedule here: ${data.rescheduleUrl}`;

  return {
    subject: `Your call is confirmed: ${dateStr} at ${timeStr}`,
    html,
    text,
  };
}

// ---------------------------------------------------------------------------
// Template: Booking alert (to owner)
// ---------------------------------------------------------------------------

export interface BookingAlertData {
  accountName: string;
  widgetName: string;
  visitorName: string;
  visitorEmail: string;
  leadTier: 'hot' | 'warm' | 'cold';
  leadScore: number;
  startsAt: string;
  timezone: string;
  durationMinutes: number;
  submissionId: string;
}

export function renderBookingAlert(
  data: BookingAlertData
): { subject: string; html: string; text: string } {
  const tierConfig = TIER_CONFIG[data.leadTier];
  const dashboardUrl = `${APP_URL}/dashboard/leads/${data.submissionId}`;
  const { dateStr, timeStr, endTimeStr, tzAbbr } = formatBookingDateTime(
    data.startsAt,
    data.timezone,
    data.durationMinutes
  );

  const html = layout(`
    <h2>New Booking</h2>
    <p><strong>${data.visitorName}</strong> (${data.visitorEmail}) booked a call on <strong>${data.widgetName}</strong>.</p>
    <div style="text-align:center;margin:16px 0;">
      <span class="tier-badge" style="background-color:${tierConfig.bgColor};color:${tierConfig.textColor};">
        ${tierConfig.label} - Score: ${data.leadScore}/100
      </span>
    </div>
    <div style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:8px;padding:20px;margin:16px 0;text-align:center;">
      <p style="margin:0 0 4px;font-size:16px;font-weight:700;color:#1e40af;">${dateStr}</p>
      <p style="margin:0;font-size:14px;color:#1e40af;">${timeStr} - ${endTimeStr} (${tzAbbr})</p>
    </div>
    <div style="text-align:center;margin:24px 0;">
      <a class="btn" href="${dashboardUrl}">View Lead</a>
    </div>
  `);

  const text = `New Booking

${data.visitorName} (${data.visitorEmail}) booked a call on ${data.widgetName}.

Tier: ${tierConfig.label} - Score: ${data.leadScore}/100

${dateStr}
${timeStr} - ${endTimeStr} (${tzAbbr})

View lead: ${dashboardUrl}`;

  return {
    subject: `New booking: ${data.visitorName} - ${dateStr} at ${timeStr}`,
    html,
    text,
  };
}

// ---------------------------------------------------------------------------
// Template: Booking reminder (to visitor)
// ---------------------------------------------------------------------------

export interface BookingReminderData {
  visitorName: string;
  accountName: string;
  startsAt: string;
  timezone: string;
  durationMinutes: number;
  rescheduleUrl: string;
}

export function renderBookingReminder(
  data: BookingReminderData
): { subject: string; html: string; text: string } {
  const firstName = data.visitorName.split(' ')[0] ?? data.visitorName;
  const { dateStr, timeStr, endTimeStr, tzAbbr } = formatBookingDateTime(
    data.startsAt,
    data.timezone,
    data.durationMinutes
  );

  const html = layout(`
    <h2>Reminder: Your call is coming up</h2>
    <p>Hey ${firstName}, just a reminder about your upcoming call with <strong>${data.accountName}</strong>.</p>
    <div style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:8px;padding:20px;margin:16px 0;text-align:center;">
      <p style="margin:0 0 4px;font-size:16px;font-weight:700;color:#1e40af;">${dateStr}</p>
      <p style="margin:0;font-size:14px;color:#1e40af;">${timeStr} - ${endTimeStr} (${tzAbbr})</p>
    </div>
    <p>Need to change the time? You can still reschedule.</p>
    <div style="text-align:center;margin:24px 0;">
      <a class="btn" href="${data.rescheduleUrl}">Reschedule</a>
    </div>
  `);

  const text = `Reminder: Your call is coming up

Hey ${firstName}, just a reminder about your upcoming call with ${data.accountName}.

${dateStr}
${timeStr} - ${endTimeStr} (${tzAbbr})

Need to change the time? ${data.rescheduleUrl}`;

  return {
    subject: `Reminder: Your call is tomorrow at ${timeStr}`,
    html,
    text,
  };
}

// ---------------------------------------------------------------------------
// Template: Booking rescheduled (to visitor)
// ---------------------------------------------------------------------------

export interface BookingRescheduledData {
  visitorName: string;
  accountName: string;
  startsAt: string;
  timezone: string;
  durationMinutes: number;
  rescheduleUrl: string;
}

export function renderBookingRescheduled(
  data: BookingRescheduledData
): { subject: string; html: string; text: string } {
  const firstName = data.visitorName.split(' ')[0] ?? data.visitorName;
  const { dateStr, timeStr, endTimeStr, tzAbbr } = formatBookingDateTime(
    data.startsAt,
    data.timezone,
    data.durationMinutes
  );

  const html = layout(`
    <h2>Your call has been rescheduled</h2>
    <p>Hey ${firstName}, your call with <strong>${data.accountName}</strong> has been updated to a new time.</p>
    <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:20px;margin:16px 0;text-align:center;">
      <p style="margin:0 0 4px;font-size:16px;font-weight:700;color:#166534;">${dateStr}</p>
      <p style="margin:0;font-size:14px;color:#166534;">${timeStr} - ${endTimeStr} (${tzAbbr})</p>
    </div>
    <p>Need to change again?</p>
    <div style="text-align:center;margin:24px 0;">
      <a class="btn" href="${data.rescheduleUrl}">Reschedule</a>
    </div>
  `);

  const text = `Your call has been rescheduled

Hey ${firstName}, your call with ${data.accountName} has been updated.

New time:
${dateStr}
${timeStr} - ${endTimeStr} (${tzAbbr})

Need to change again? ${data.rescheduleUrl}`;

  return {
    subject: `Call rescheduled: ${dateStr} at ${timeStr}`,
    html,
    text,
  };
}
