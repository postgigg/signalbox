import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Resend } from 'resend';

import type { Database } from '../../lib/supabase/types';

type EnrollmentRow = Database['public']['Tables']['drip_enrollments']['Row'];
type SequenceRow = Database['public']['Tables']['drip_sequences']['Row'];
type StepRow = Database['public']['Tables']['drip_steps']['Row'];
type SubmissionRow = Database['public']['Tables']['submissions']['Row'];
type AccountRow = Database['public']['Tables']['accounts']['Row'];
type WidgetRow = Database['public']['Tables']['widgets']['Row'];

const BATCH_SIZE = 50;
const APP_NAME = 'HawkLeads';

const DRIP_PAUSE_STATUSES = [
  'contacted',
  'qualified',
  'converted',
  'disqualified',
  'archived',
] as const;

const PLANS_WITH_DRIP: ReadonlySet<string> = new Set(['pro', 'agency']);

function createAdminClient(): SupabaseClient<Database> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('Missing Supabase admin credentials');
  }

  return createClient<Database>(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

function createResendClient(): Resend {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error('Missing RESEND_API_KEY');
  }
  return new Resend(apiKey);
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function renderTemplate(
  template: string,
  vars: {
    visitorName: string;
    visitorEmail: string;
    leadScore: number;
    leadTier: string;
    widgetName: string;
    accountName: string;
  },
  shouldEscape: boolean,
): string {
  const esc = shouldEscape ? escapeHtml : (s: string) => s;
  return template
    .replace(/\{\{visitor_name\}\}/g, esc(vars.visitorName))
    .replace(/\{\{visitor_email\}\}/g, esc(vars.visitorEmail))
    .replace(/\{\{lead_score\}\}/g, String(vars.leadScore))
    .replace(/\{\{lead_tier\}\}/g, esc(vars.leadTier))
    .replace(/\{\{widget_name\}\}/g, esc(vars.widgetName))
    .replace(/\{\{account_name\}\}/g, esc(vars.accountName));
}

function dripLayout(content: string, accountName: string): string {
  const escapedName = escapeHtml(accountName);
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
</head>
<body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;background-color:#FAFAFA;color:#0F172A;">
  <div style="max-width:600px;margin:0 auto;padding:32px 16px;">
    <div style="background:#FFFFFF;border-radius:8px;padding:32px;border:1px solid #E2E8F0;">
      <div style="text-align:center;padding-bottom:24px;border-bottom:1px solid #E2E8F0;margin-bottom:24px;">
        <h1 style="margin:0;font-size:20px;font-weight:700;color:#0F172A;">${escapedName}</h1>
      </div>
      ${content}
      <div style="text-align:center;padding-top:24px;font-size:12px;color:#94A3B8;">
        <p style="margin:0;">You received this because you submitted a form on ${escapedName}'s website.</p>
        <p style="margin:4px 0 0;">Powered by ${APP_NAME}</p>
      </div>
    </div>
  </div>
</body>
</html>`;
}

export default async function handler(): Promise<void> {
  const supabase = createAdminClient();
  const resend = createResendClient();

  // 1. Query enrollments due to send
  const { data: enrollments, error: enrollError } = await supabase
    .from('drip_enrollments')
    .select('*')
    .eq('status', 'active')
    .lte('next_send_at', new Date().toISOString())
    .limit(BATCH_SIZE);

  if (enrollError) {
    console.error('[process-drip-emails] Failed to query enrollments:', enrollError.message);
    return;
  }

  if (!enrollments || enrollments.length === 0) {
    console.log('[process-drip-emails] No pending drip emails');
    return;
  }

  console.log(`[process-drip-emails] Processing ${enrollments.length} enrollments`);

  // 2. Batch-fetch related data
  const sequenceIds = [...new Set(enrollments.map((e) => e.sequence_id))];
  const submissionIds = [...new Set(enrollments.map((e) => e.submission_id))];
  const accountIds = [...new Set(enrollments.map((e) => e.account_id))];

  const [sequencesResult, stepsResult, submissionsResult, accountsResult] = await Promise.all([
    supabase.from('drip_sequences').select('*').in('id', sequenceIds),
    supabase.from('drip_steps').select('*').in('sequence_id', sequenceIds),
    supabase.from('submissions').select('id, visitor_name, visitor_email, lead_score, lead_tier, status, widget_id').in('id', submissionIds),
    supabase.from('accounts').select('id, name, plan, notification_email').in('id', accountIds),
  ]);

  const sequencesMap = new Map<string, SequenceRow>();
  for (const seq of (sequencesResult.data ?? []) as SequenceRow[]) {
    sequencesMap.set(seq.id, seq);
  }

  const stepsMap = new Map<string, StepRow[]>();
  for (const step of (stepsResult.data ?? []) as StepRow[]) {
    const existing = stepsMap.get(step.sequence_id) ?? [];
    existing.push(step);
    stepsMap.set(step.sequence_id, existing);
  }

  const submissionsMap = new Map<string, Pick<SubmissionRow, 'id' | 'visitor_name' | 'visitor_email' | 'lead_score' | 'lead_tier' | 'status' | 'widget_id'>>();
  for (const sub of submissionsResult.data ?? []) {
    submissionsMap.set(sub.id, sub);
  }

  const accountsMap = new Map<string, Pick<AccountRow, 'id' | 'name' | 'plan' | 'notification_email'>>();
  for (const acc of accountsResult.data ?? []) {
    accountsMap.set(acc.id, acc);
  }

  // Fetch widget names for submissions
  const widgetIds = [...new Set((submissionsResult.data ?? []).map((s) => s.widget_id))];
  const widgetsResult = widgetIds.length > 0
    ? await supabase.from('widgets').select('id, name').in('id', widgetIds)
    : { data: [] };

  const widgetsMap = new Map<string, string>();
  for (const w of (widgetsResult.data ?? []) as Pick<WidgetRow, 'id' | 'name'>[]) {
    widgetsMap.set(w.id, w.name);
  }

  let successCount = 0;
  let failureCount = 0;
  let skippedCount = 0;

  // 3. Process each enrollment
  for (const enrollment of enrollments as EnrollmentRow[]) {
    const sequence = sequencesMap.get(enrollment.sequence_id);
    const submission = submissionsMap.get(enrollment.submission_id);
    const account = accountsMap.get(enrollment.account_id);

    if (!sequence || !submission || !account) {
      console.warn(`[process-drip-emails] Missing data for enrollment ${enrollment.id}, skipping`);
      skippedCount++;
      continue;
    }

    // Re-check submission status
    const isPaused = (DRIP_PAUSE_STATUSES as readonly string[]).includes(submission.status);
    if (isPaused) {
      await supabase
        .from('drip_enrollments')
        .update({ status: 'paused', paused_reason: submission.status, next_send_at: null })
        .eq('id', enrollment.id);
      skippedCount++;
      continue;
    }

    // Check sequence still active
    if (!sequence.is_active) {
      await supabase
        .from('drip_enrollments')
        .update({ status: 'cancelled', next_send_at: null })
        .eq('id', enrollment.id);
      skippedCount++;
      continue;
    }

    // Check account plan still supports drip
    if (!PLANS_WITH_DRIP.has(account.plan)) {
      await supabase
        .from('drip_enrollments')
        .update({ status: 'cancelled', next_send_at: null })
        .eq('id', enrollment.id);
      skippedCount++;
      continue;
    }

    // Get the next step
    const nextStepOrder = enrollment.current_step + 1;
    const sequenceSteps = stepsMap.get(sequence.id) ?? [];
    const step = sequenceSteps.find((s) => s.step_order === nextStepOrder);

    if (!step) {
      // No more steps, mark completed
      await supabase
        .from('drip_enrollments')
        .update({ status: 'completed', next_send_at: null })
        .eq('id', enrollment.id);
      skippedCount++;
      continue;
    }

    const widgetName = widgetsMap.get(submission.widget_id) ?? 'Unknown Widget';
    const templateVars = {
      visitorName: submission.visitor_name,
      visitorEmail: submission.visitor_email,
      leadScore: submission.lead_score,
      leadTier: submission.lead_tier,
      widgetName,
      accountName: account.name,
    };

    const renderedSubject = renderTemplate(step.subject, templateVars, false);
    const renderedBodyHtml = dripLayout(
      renderTemplate(step.body_html, templateVars, true),
      account.name,
    );
    const renderedBodyText = renderTemplate(step.body_text, templateVars, false);

    const fromAddress = `${account.name} via ${APP_NAME} <noreply@hawkleads.io>`;

    try {
      const emailPayload: Parameters<typeof resend.emails.send>[0] = {
        from: fromAddress,
        to: submission.visitor_email,
        subject: renderedSubject,
        html: renderedBodyHtml,
        text: renderedBodyText,
      };
      if (account.notification_email) {
        emailPayload.reply_to = account.notification_email;
      }

      await resend.emails.send(emailPayload);

      // Check if there is a next step
      const followingStep = sequenceSteps.find((s) => s.step_order === nextStepOrder + 1);
      const nextSendAt = followingStep
        ? new Date(Date.now() + followingStep.delay_hours * 60 * 60 * 1000).toISOString()
        : null;
      const newStatus = followingStep ? 'active' as const : 'completed' as const;

      await supabase
        .from('drip_enrollments')
        .update({
          current_step: nextStepOrder,
          last_sent_at: new Date().toISOString(),
          next_send_at: nextSendAt,
          status: newStatus,
        })
        .eq('id', enrollment.id);

      successCount++;
    } catch (err) {
      console.error(
        `[process-drip-emails] Failed to send email for enrollment ${enrollment.id}:`,
        err instanceof Error ? err.message : String(err),
      );
      failureCount++;
      // Don't update enrollment — it will be retried next cycle since next_send_at is still in the past
    }
  }

  console.log(
    `[process-drip-emails] Complete: ${successCount} sent, ${failureCount} failed, ${skippedCount} skipped`,
  );
}
