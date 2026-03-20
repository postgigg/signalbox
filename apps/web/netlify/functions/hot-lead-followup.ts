import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Resend } from 'resend';
import type { Database } from '../../lib/supabase/types';

type SubmissionRow = Database['public']['Tables']['submissions']['Row'];
type AccountRow = Database['public']['Tables']['accounts']['Row'];
type WidgetRow = Database['public']['Tables']['widgets']['Row'];

interface HotLeadRow extends SubmissionRow {
  widgets: Pick<WidgetRow, 'account_id' | 'name'>;
  accounts: Pick<AccountRow, 'notification_email' | 'name'>;
}

const BATCH_SIZE = 50;
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://hawkleads.io';

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

function buildFollowupHtml(lead: HotLeadRow): string {
  return `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="margin-bottom: 24px;"><svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" width="28" height="28" style="vertical-align:middle;margin-right:8px"><path d="M12 8L22 56" stroke="#0F172A" stroke-width="6" stroke-linecap="round"/><path d="M26 4L40 60" stroke="#0F172A" stroke-width="7" stroke-linecap="round"/><path d="M44 12L50 52" stroke="#0F172A" stroke-width="5" stroke-linecap="round"/></svg><span style="font-weight:700;font-size:18px;vertical-align:middle;letter-spacing:-0.03em">HawkLeads</span></div>
      <h2 style="color: #EF4444;">Hot Lead Requires Immediate Attention</h2>
      <p>A hot lead has been sitting uncontacted for over an hour. Respond now before they go to a competitor.</p>
      <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
        <tr>
          <td style="padding: 8px; font-weight: bold; border-bottom: 1px solid #E5E7EB;">Name</td>
          <td style="padding: 8px; border-bottom: 1px solid #E5E7EB;">${lead.visitor_name}</td>
        </tr>
        <tr>
          <td style="padding: 8px; font-weight: bold; border-bottom: 1px solid #E5E7EB;">Email</td>
          <td style="padding: 8px; border-bottom: 1px solid #E5E7EB;">${lead.visitor_email}</td>
        </tr>
        ${lead.visitor_phone ? `<tr>
          <td style="padding: 8px; font-weight: bold; border-bottom: 1px solid #E5E7EB;">Phone</td>
          <td style="padding: 8px; border-bottom: 1px solid #E5E7EB;">${lead.visitor_phone}</td>
        </tr>` : ''}
        <tr>
          <td style="padding: 8px; font-weight: bold; border-bottom: 1px solid #E5E7EB;">Score</td>
          <td style="padding: 8px; border-bottom: 1px solid #E5E7EB;">${lead.lead_score}/100</td>
        </tr>
        <tr>
          <td style="padding: 8px; font-weight: bold; border-bottom: 1px solid #E5E7EB;">Widget</td>
          <td style="padding: 8px; border-bottom: 1px solid #E5E7EB;">${lead.widgets.name}</td>
        </tr>
        <tr>
          <td style="padding: 8px; font-weight: bold;">Submitted</td>
          <td style="padding: 8px;">${new Date(lead.created_at).toLocaleString('en-US', { timeZone: 'UTC' })} UTC</td>
        </tr>
      </table>
      <a href="${APP_URL}/leads/${lead.id}"
         style="display: inline-block; padding: 12px 24px; background-color: #EF4444; color: #FFFFFF; text-decoration: none; border-radius: 6px; font-weight: bold;">
        Respond Now
      </a>
      <p style="color: #6B7280; font-size: 12px; margin-top: 24px;">
        This is an automated followup from HawkLeads because this hot lead has not been contacted yet.
      </p>
    </div>
  `;
}

export default async function handler(): Promise<void> {
  const supabase = createAdminClient();
  const resend = createResendClient();
  const fromAddress = process.env.EMAIL_FROM ?? 'HawkLeads <noreply@hawkleads.app>';

  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();

  const { data: hotLeads, error } = await supabase
    .from('submissions')
    .select('*, widgets!inner(account_id, name), accounts!inner(notification_email, name)')
    .eq('lead_tier', 'hot')
    .eq('status', 'new')
    .eq('notification_sent', false)
    .lt('created_at', oneHourAgo)
    .limit(BATCH_SIZE);

  if (error) {
    console.error('[hot-lead-followup] Failed to query hot leads:', error.message);
    return;
  }

  if (!hotLeads || hotLeads.length === 0) {
    console.log('[hot-lead-followup] No pending hot leads found');
    return;
  }

  console.log(`[hot-lead-followup] Processing ${hotLeads.length} hot leads`);

  let successCount = 0;
  let failureCount = 0;

  for (const lead of hotLeads as unknown as HotLeadRow[]) {
    const notificationEmail = lead.accounts.notification_email;
    if (!notificationEmail) {
      console.warn(`[hot-lead-followup] No notification email for account, skipping lead ${lead.id}`);
      continue;
    }

    try {
      const subject = `Hot Lead: ${lead.visitor_name} scored ${lead.lead_score}. Respond before they go to a competitor.`;

      await resend.emails.send({
        from: fromAddress,
        to: notificationEmail,
        subject,
        html: buildFollowupHtml(lead),
        text: `Hot Lead Alert: ${lead.visitor_name} (${lead.visitor_email}) scored ${lead.lead_score}/100 on ${lead.widgets.name}. This lead has been waiting over an hour. View at ${APP_URL}/leads/${lead.id}`,
      });

      const { error: updateError } = await supabase
        .from('submissions')
        .update({
          notification_sent: true,
          notification_sent_at: new Date().toISOString(),
        })
        .eq('id', lead.id);

      if (updateError) {
        console.error(`[hot-lead-followup] Failed to update lead ${lead.id}:`, updateError.message);
        failureCount++;
      } else {
        successCount++;
      }
    } catch (err) {
      console.error(`[hot-lead-followup] Failed to send followup for lead ${lead.id}:`, err instanceof Error ? err.message : String(err));
      failureCount++;
    }
  }

  console.log(`[hot-lead-followup] Complete: ${successCount} sent, ${failureCount} failed`);
}
