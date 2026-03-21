import type { SupabaseClient } from '@supabase/supabase-js';

import { APP_NAME } from '@/lib/constants';

import type { Database } from '@/lib/supabase/types';

type AdminClient = SupabaseClient<Database>;

// ---------------------------------------------------------------------------
// Enroll a submission into the active drip sequence for its tier
// ---------------------------------------------------------------------------

export async function enrollInDripSequence(
  admin: AdminClient,
  accountId: string,
  submissionId: string,
  leadTier: 'warm' | 'cold',
): Promise<void> {
  // Find active sequence for this tier
  const { data: sequence } = await admin
    .from('drip_sequences')
    .select('id')
    .eq('account_id', accountId)
    .eq('target_tier', leadTier)
    .eq('is_active', true)
    .limit(1)
    .maybeSingle();

  if (!sequence) return;

  // Get step 1 delay
  const { data: firstStep } = await admin
    .from('drip_steps')
    .select('delay_hours')
    .eq('sequence_id', sequence.id)
    .eq('step_order', 1)
    .single();

  if (!firstStep) return;

  const nextSendAt = new Date(
    Date.now() + firstStep.delay_hours * 60 * 60 * 1000,
  ).toISOString();

  // Insert enrollment, ignore duplicate (unique constraint on sequence+submission)
  await admin
    .from('drip_enrollments')
    .insert({
      sequence_id: sequence.id,
      submission_id: submissionId,
      account_id: accountId,
      current_step: 0,
      status: 'active',
      next_send_at: nextSendAt,
    })
    .maybeSingle();
}

// ---------------------------------------------------------------------------
// Pause all active enrollments for a submission
// ---------------------------------------------------------------------------

export async function pauseDripEnrollments(
  admin: AdminClient,
  submissionId: string,
  reason: string,
): Promise<void> {
  await admin
    .from('drip_enrollments')
    .update({
      status: 'paused',
      paused_reason: reason,
      next_send_at: null,
    })
    .eq('submission_id', submissionId)
    .eq('status', 'active');
}

// ---------------------------------------------------------------------------
// Render template variables into subject/body strings
// ---------------------------------------------------------------------------

interface DripTemplateVariables {
  readonly visitorName: string;
  readonly visitorEmail: string;
  readonly leadScore: number;
  readonly leadTier: string;
  readonly widgetName: string;
  readonly accountName: string;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function renderDripTemplate(
  template: string,
  variables: DripTemplateVariables,
  shouldEscapeHtml: boolean,
): string {
  const escape = shouldEscapeHtml ? escapeHtml : (s: string) => s;
  return template
    .replace(/\{\{visitor_name\}\}/g, escape(variables.visitorName))
    .replace(/\{\{visitor_email\}\}/g, escape(variables.visitorEmail))
    .replace(/\{\{lead_score\}\}/g, String(variables.leadScore))
    .replace(/\{\{lead_tier\}\}/g, escape(variables.leadTier))
    .replace(/\{\{widget_name\}\}/g, escape(variables.widgetName))
    .replace(/\{\{account_name\}\}/g, escape(variables.accountName));
}

// ---------------------------------------------------------------------------
// Drip email layout (white-label wrapper for nurture emails)
// ---------------------------------------------------------------------------

export function dripLayout(content: string, accountName: string): string {
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
