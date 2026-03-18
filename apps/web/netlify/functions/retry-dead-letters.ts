import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Resend } from 'resend';
import type { Database } from '../../lib/supabase/types';

type SubmissionRow = Database['public']['Tables']['submissions']['Row'];
type AccountRow = Database['public']['Tables']['accounts']['Row'];
type WidgetRow = Database['public']['Tables']['widgets']['Row'];

interface FailedNotificationRow extends SubmissionRow {
  widgets: Pick<WidgetRow, 'name'>;
  accounts: Pick<AccountRow, 'notification_email' | 'name'>;
}

const BATCH_SIZE = 50;
const MAX_RETRY_COUNT = 3;
const RETRY_WINDOW_HOURS = 24;
const MIN_AGE_MINUTES = 5;
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://app.signalbox.io';

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

function getTierLabel(tier: 'hot' | 'warm' | 'cold'): string {
  const labels: Record<string, string> = { hot: 'Hot', warm: 'Warm', cold: 'Cold' };
  return labels[tier] ?? tier;
}

function buildNotificationHtml(lead: FailedNotificationRow): string {
  return `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>New ${getTierLabel(lead.lead_tier)} Lead from ${lead.widgets.name}</h2>
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
          <td style="padding: 8px; font-weight: bold;">Tier</td>
          <td style="padding: 8px;">${getTierLabel(lead.lead_tier)}</td>
        </tr>
      </table>
      <a href="${APP_URL}/leads/${lead.id}"
         style="display: inline-block; padding: 12px 24px; background-color: #3B82F6; color: #FFFFFF; text-decoration: none; border-radius: 6px; font-weight: bold;">
        View Lead
      </a>
      <p style="color: #6B7280; font-size: 12px; margin-top: 24px;">
        You received this email because a new lead was submitted via your SignalBox widget.
      </p>
    </div>
  `;
}

export default async function handler(): Promise<void> {
  const supabase = createAdminClient();
  const resend = createResendClient();
  const fromAddress = process.env.EMAIL_FROM ?? 'SignalBox <noreply@signalbox.app>';

  const fiveMinutesAgo = new Date(Date.now() - MIN_AGE_MINUTES * 60 * 1000).toISOString();
  const twentyFourHoursAgo = new Date(Date.now() - RETRY_WINDOW_HOURS * 60 * 60 * 1000).toISOString();

  // Find submissions where notification_sent is false, created between 5 min and 24 hours ago.
  // We use the notes field to track retry count with a "retry_count:N" convention,
  // but a cleaner approach: we look at notification_sent_at. If it's null and created_at
  // is within our window, it's a candidate. We limit retries by checking how many times
  // we've attempted — tracked via a metadata approach using updated_at as a signal.
  //
  // Simpler approach: query unfulfilled notifications, track retry count via the
  // difference between now and created_at (exponential backoff by age).
  // For robustness, we'll process in batches and skip anything attempted too recently
  // by checking updated_at (the update from a previous retry attempt).

  let processedTotal = 0;
  let offset = 0;
  let hasMore = true;

  while (hasMore) {
    const { data: failedSends, error } = await supabase
      .from('submissions')
      .select('*, widgets!inner(name), accounts!inner(notification_email, name)')
      .eq('notification_sent', false)
      .lt('created_at', fiveMinutesAgo)
      .gt('created_at', twentyFourHoursAgo)
      .order('created_at', { ascending: true })
      .range(offset, offset + BATCH_SIZE - 1);

    if (error) {
      console.error('[retry-dead-letters] Failed to query failed notifications:', error.message);
      return;
    }

    if (!failedSends || failedSends.length === 0) {
      hasMore = false;
      break;
    }

    const leads = failedSends as unknown as FailedNotificationRow[];

    for (const lead of leads) {
      const notificationEmail = lead.accounts.notification_email;
      if (!notificationEmail) {
        continue;
      }

      // Determine retry count based on time elapsed.
      // Retry 1: after 5 min, Retry 2: after 30 min, Retry 3: after 2 hours.
      // If updated_at === created_at, this is the first attempt.
      // If updated_at > created_at, a retry was already attempted.
      const createdMs = new Date(lead.created_at).getTime();
      const updatedMs = new Date(lead.updated_at).getTime();
      const nowMs = Date.now();
      const ageMinutes = (nowMs - createdMs) / (60 * 1000);
      const retryAttempts = updatedMs > createdMs + 1000 ? Math.min(Math.floor((updatedMs - createdMs) / (5 * 60 * 1000)), MAX_RETRY_COUNT) : 0;

      if (retryAttempts >= MAX_RETRY_COUNT) {
        continue;
      }

      // Exponential backoff: wait 5 min, then 30 min, then 2 hours
      const backoffMinutes = [5, 30, 120];
      const requiredAge = backoffMinutes[retryAttempts] ?? 5;
      if (ageMinutes < requiredAge) {
        continue;
      }

      // Skip if we retried very recently (within 4 minutes) to avoid double-sends
      const timeSinceLastUpdate = (nowMs - updatedMs) / (60 * 1000);
      if (updatedMs > createdMs + 1000 && timeSinceLastUpdate < 4) {
        continue;
      }

      try {
        const tierLabel = getTierLabel(lead.lead_tier);
        const subject = `New ${tierLabel} lead from ${lead.widgets.name}: ${lead.visitor_name}`;

        await resend.emails.send({
          from: fromAddress,
          to: notificationEmail,
          subject,
          html: buildNotificationHtml(lead),
          text: `New ${tierLabel} lead: ${lead.visitor_name} (${lead.visitor_email}), score: ${lead.lead_score}/100. View at ${APP_URL}/leads/${lead.id}`,
        });

        const { error: updateError } = await supabase
          .from('submissions')
          .update({
            notification_sent: true,
            notification_sent_at: new Date().toISOString(),
          })
          .eq('id', lead.id);

        if (updateError) {
          console.error(`[retry-dead-letters] Failed to mark lead ${lead.id} as sent:`, updateError.message);
        } else {
          processedTotal++;
        }
      } catch (err) {
        // Update updated_at to track this retry attempt
        console.error(`[retry-dead-letters] Retry failed for lead ${lead.id}:`, err instanceof Error ? err.message : String(err));

        await supabase
          .from('submissions')
          .update({ updated_at: new Date().toISOString() })
          .eq('id', lead.id);
      }
    }

    if (failedSends.length < BATCH_SIZE) {
      hasMore = false;
    } else {
      offset += BATCH_SIZE;
    }
  }

  console.log(`[retry-dead-letters] Complete: ${processedTotal} notifications retried successfully`);
}
