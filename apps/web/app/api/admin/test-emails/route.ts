import { NextResponse } from 'next/server';

import { sendEmail } from '@/lib/email/client';
import {
  renderNewLeadNotification,
  renderHotLeadFollowup,
  renderWelcome,
  renderTrialEnding,
  renderTrialExpired,
  renderWeeklyDigest,
  renderPaymentFailed,
  renderWebhookFailures,
  renderLeadAssigned,
} from '@/lib/email/templates';

const TEST_EMAIL = 'exontract@gmail.com';

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => { setTimeout(resolve, ms); });
}

interface TestResult {
  template: string;
  subject: string;
  success: boolean;
  id: string | null;
  error: string | null;
}

export async function POST(): Promise<NextResponse> {
  try {
  const results: TestResult[] = [];

  // 1. New Lead Notification (Hot)
  const newLead = renderNewLeadNotification({
    accountName: 'Acme Plumbing Co',
    widgetName: 'Homepage Quote Widget',
    visitorName: 'Sarah Mitchell',
    visitorEmail: 'sarah@example.com',
    leadScore: 87,
    leadTier: 'hot',
    submissionId: 'test-sub-001',
    answers: [
      { question: 'Service needed', label: 'Emergency repair' },
      { question: 'Budget range', label: '$5,000 - $10,000' },
      { question: 'Timeline', label: 'This week' },
    ],
  });
  const r1 = await sendEmail({ to: TEST_EMAIL, ...newLead, tags: [{ name: 'type', value: 'test' }] });
  results.push({ template: 'New Lead (Hot)', subject: newLead.subject, ...r1 });
  await delay(250);

  // 2. New Lead Notification (Warm)
  const warmLead = renderNewLeadNotification({
    accountName: 'Acme Plumbing Co',
    widgetName: 'Homepage Quote Widget',
    visitorName: 'James Park',
    visitorEmail: 'james@example.com',
    leadScore: 55,
    leadTier: 'warm',
    submissionId: 'test-sub-002',
    answers: [
      { question: 'Service needed', label: 'Bathroom renovation' },
      { question: 'Budget range', label: '$2,000 - $5,000' },
      { question: 'Timeline', label: 'Next month' },
    ],
  });
  const r2 = await sendEmail({ to: TEST_EMAIL, ...warmLead, tags: [{ name: 'type', value: 'test' }] });
  results.push({ template: 'New Lead (Warm)', subject: warmLead.subject, ...r2 });
  await delay(250);

  // 3. New Lead Notification (Cold)
  const coldLead = renderNewLeadNotification({
    accountName: 'Acme Plumbing Co',
    widgetName: 'Homepage Quote Widget',
    visitorName: 'Lisa Reynolds',
    visitorEmail: 'lisa@example.com',
    leadScore: 22,
    leadTier: 'cold',
    submissionId: 'test-sub-003',
    answers: [
      { question: 'Service needed', label: 'General inquiry' },
      { question: 'Budget range', label: 'Under $500' },
      { question: 'Timeline', label: 'No rush' },
    ],
  });
  const r3 = await sendEmail({ to: TEST_EMAIL, ...coldLead, tags: [{ name: 'type', value: 'test' }] });
  results.push({ template: 'New Lead (Cold)', subject: coldLead.subject, ...r3 });
  await delay(250);

  // 4. Hot Lead Followup
  const followup = renderHotLeadFollowup({
    accountName: 'Acme Plumbing Co',
    visitorName: 'Sarah Mitchell',
    visitorEmail: 'sarah@example.com',
    leadScore: 87,
    suggestedOpener: 'Hi Sarah, I saw you need an emergency plumbing repair this week. We can have a certified technician at your property within 24 hours. Would tomorrow morning work for a free assessment?',
    submissionId: 'test-sub-001',
  });
  const r4 = await sendEmail({ to: TEST_EMAIL, ...followup, tags: [{ name: 'type', value: 'test' }] });
  results.push({ template: 'Hot Lead Followup', subject: followup.subject, ...r4 });
  await delay(250);

  // 5. Welcome
  const welcome = renderWelcome({
    fullName: 'Alex Thompson',
    accountName: 'Thompson Digital Agency',
  });
  const r5 = await sendEmail({ to: TEST_EMAIL, ...welcome, tags: [{ name: 'type', value: 'test' }] });
  results.push({ template: 'Welcome', subject: welcome.subject, ...r5 });
  await delay(250);

  // 6. Trial Ending
  const trialEnding = renderTrialEnding({
    accountName: 'Thompson Digital Agency',
    fullName: 'Alex Thompson',
    daysRemaining: 3,
    totalLeads: 47,
  });
  const r6 = await sendEmail({ to: TEST_EMAIL, ...trialEnding, tags: [{ name: 'type', value: 'test' }] });
  results.push({ template: 'Trial Ending', subject: trialEnding.subject, ...r6 });
  await delay(250);

  // 7. Trial Expired
  const trialExpired = renderTrialExpired({
    accountName: 'Thompson Digital Agency',
    fullName: 'Alex Thompson',
    totalLeads: 47,
  });
  const r7 = await sendEmail({ to: TEST_EMAIL, ...trialExpired, tags: [{ name: 'type', value: 'test' }] });
  results.push({ template: 'Trial Expired', subject: trialExpired.subject, ...r7 });
  await delay(250);

  // 8. Weekly Digest
  const digest = renderWeeklyDigest({
    accountName: 'Acme Plumbing Co',
    fullName: 'Alex Thompson',
    weekStart: '2026-03-16',
    weekEnd: '2026-03-22',
    totalSubmissions: 34,
    hotLeads: 8,
    warmLeads: 14,
    coldLeads: 12,
    avgScore: 52,
    topWidget: 'Homepage Quote Widget',
    conversionRate: 34.2,
  });
  const r8 = await sendEmail({ to: TEST_EMAIL, ...digest, tags: [{ name: 'type', value: 'test' }] });
  results.push({ template: 'Weekly Digest', subject: digest.subject, ...r8 });
  await delay(250);

  // 9. Payment Failed
  const paymentFailed = renderPaymentFailed({
    accountName: 'Thompson Digital Agency',
    fullName: 'Alex Thompson',
    amount: 24900,
    currency: 'usd',
    nextRetryDate: '2026-03-26',
  });
  const r9 = await sendEmail({ to: TEST_EMAIL, ...paymentFailed, tags: [{ name: 'type', value: 'test' }] });
  results.push({ template: 'Payment Failed', subject: paymentFailed.subject, ...r9 });
  await delay(250);

  // 10. Webhook Failures
  const webhookFail = renderWebhookFailures({
    accountName: 'Acme Plumbing Co',
    fullName: 'Alex Thompson',
    webhookUrl: 'https://hooks.zapier.com/hooks/catch/123456/abcdef/',
    failureCount: 7,
    lastStatusCode: 503,
    lastTriggeredAt: '2026-03-23T14:30:00Z',
  });
  const r10 = await sendEmail({ to: TEST_EMAIL, ...webhookFail, tags: [{ name: 'type', value: 'test' }] });
  results.push({ template: 'Webhook Failures', subject: webhookFail.subject, ...r10 });
  await delay(250);

  // 11. Lead Assigned
  const leadAssigned = renderLeadAssigned({
    assigneeName: 'Mike Johnson',
    accountName: 'Acme Plumbing Co',
    widgetName: 'Homepage Quote Widget',
    visitorName: 'Sarah Mitchell',
    visitorEmail: 'sarah@example.com',
    leadScore: 87,
    leadTier: 'hot',
    submissionId: 'test-sub-001',
    ruleName: 'Hot leads to senior closer',
  });
  const r11 = await sendEmail({ to: TEST_EMAIL, ...leadAssigned, tags: [{ name: 'type', value: 'test' }] });
  results.push({ template: 'Lead Assigned', subject: leadAssigned.subject, ...r11 });

  const succeeded = results.filter((r) => r.success).length;
  const failed = results.filter((r) => !r.success).length;

  return NextResponse.json({
    summary: `${String(succeeded)} sent, ${String(failed)} failed`,
    sentTo: TEST_EMAIL,
    results,
  });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    const stack = err instanceof Error ? err.stack : undefined;
    return NextResponse.json({ error: message, stack }, { status: 500 });
  }
}
