import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Resend } from 'resend';
import type { Database } from '../../lib/supabase/types';

type AccountRow = Database['public']['Tables']['accounts']['Row'];

const BATCH_SIZE = 100;
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

function buildTrialEndingSoonHtml(account: AccountRow, daysLeft: number): string {
  return `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="margin-bottom: 24px;">
        <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" width="28" height="28" style="vertical-align: middle; margin-right: 8px;">
          <path d="M12 8L22 56" stroke="#0F172A" stroke-width="6" stroke-linecap="round"/>
          <path d="M26 4L40 60" stroke="#0F172A" stroke-width="7" stroke-linecap="round"/>
          <path d="M44 12L50 52" stroke="#0F172A" stroke-width="5" stroke-linecap="round"/>
        </svg>
        <span style="font-weight: 700; font-size: 18px; vertical-align: middle; letter-spacing: -0.03em;">HawkLeads</span>
      </div>
      <h2>Your HawkLeads trial ends in ${daysLeft} days</h2>
      <p>Hi there,</p>
      <p>Your free trial for <strong>${account.name}</strong> is ending soon. After your trial expires, you'll lose access to:</p>
      <ul>
        <li>Lead scoring and qualification</li>
        <li>Widget analytics and insights</li>
        <li>Email notifications for new leads</li>
        <li>All collected lead data</li>
      </ul>
      <p>Upgrade now to keep your lead generation running without interruption.</p>
      <a href="${APP_URL}/settings/billing"
         style="display: inline-block; padding: 12px 24px; background-color: #3B82F6; color: #FFFFFF; text-decoration: none; border-radius: 6px; font-weight: bold;">
        Upgrade Now
      </a>
      <p style="color: #6B7280; font-size: 12px; margin-top: 24px;">
        If you have any questions, reply to this email or contact us at support@hawkleads.io.
      </p>
    </div>
  `;
}

function buildTrialExpiredHtml(account: AccountRow): string {
  return `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="margin-bottom: 24px;">
        <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" width="28" height="28" style="vertical-align: middle; margin-right: 8px;">
          <path d="M12 8L22 56" stroke="#0F172A" stroke-width="6" stroke-linecap="round"/>
          <path d="M26 4L40 60" stroke="#0F172A" stroke-width="7" stroke-linecap="round"/>
          <path d="M44 12L50 52" stroke="#0F172A" stroke-width="5" stroke-linecap="round"/>
        </svg>
        <span style="font-weight: 700; font-size: 18px; vertical-align: middle; letter-spacing: -0.03em;">HawkLeads</span>
      </div>
      <h2>Your HawkLeads trial has ended</h2>
      <p>Hi there,</p>
      <p>Your free trial for <strong>${account.name}</strong> has ended. Your account is now on the Free plan: 10 leads per month with form-based scoring.</p>
      <p>Your widgets are still active and your data is safe. Upgrade anytime to unlock more leads, predictive scoring, and team features.</p>
      <a href="${APP_URL}/settings/billing"
         style="display: inline-block; padding: 12px 24px; background-color: #3B82F6; color: #FFFFFF; text-decoration: none; border-radius: 6px; font-weight: bold;">
        Upgrade Now
      </a>
      <p style="margin-top: 16px;">Our plans start at just $99/month. <a href="${APP_URL}/pricing">View pricing</a></p>
      <p style="color: #6B7280; font-size: 12px; margin-top: 24px;">
        If you have any questions, reply to this email or contact us at support@hawkleads.io.
      </p>
    </div>
  `;
}

async function processTrialEndingWindow(
  supabase: SupabaseClient<Database>,
  resend: Resend,
  fromAddress: string,
  targetDays: number,
): Promise<{ sent: number; failed: number }> {
  let sent = 0;
  let failed = 0;

  const targetTime = new Date(Date.now() + targetDays * 24 * 60 * 60 * 1000);
  const windowStart = new Date(targetTime.getTime() - 12 * 60 * 60 * 1000).toISOString();
  const windowEnd = new Date(targetTime.getTime() + 12 * 60 * 60 * 1000).toISOString();

  let offset = 0;
  let hasMore = true;

  while (hasMore) {
    const { data: accounts, error } = await supabase
      .from('accounts')
      .select('*')
      .eq('plan', 'trial')
      .eq('subscription_status', 'trialing')
      .not('trial_ends_at', 'is', null)
      .gte('trial_ends_at', windowStart)
      .lte('trial_ends_at', windowEnd)
      .is('deleted_at', null)
      .range(offset, offset + BATCH_SIZE - 1);

    if (error) {
      console.error(`[check-trial-expirations] Failed to query trial-ending-soon accounts (${targetDays}d):`, error.message);
      break;
    }

    if (!accounts || accounts.length === 0) {
      hasMore = false;
      break;
    }

    for (const account of accounts) {
      if (!account.notification_email) {
        console.warn(`[check-trial-expirations] No notification email for account ${account.id}, skipping`);
        continue;
      }

      try {
        const trialEndsAt = new Date(account.trial_ends_at as string);
        const daysLeft = Math.ceil((trialEndsAt.getTime() - Date.now()) / (24 * 60 * 60 * 1000));

        await resend.emails.send({
          from: fromAddress,
          to: account.notification_email,
          subject: `Your HawkLeads trial ends in ${daysLeft} ${daysLeft === 1 ? 'day' : 'days'}`,
          html: buildTrialEndingSoonHtml(account, daysLeft),
          text: `Your HawkLeads trial for ${account.name} ends in ${daysLeft} ${daysLeft === 1 ? 'day' : 'days'}. Upgrade now to keep your lead generation running: ${APP_URL}/settings/billing`,
        });

        sent++;
      } catch (err) {
        console.error(`[check-trial-expirations] Failed to send trial-ending email for account ${account.id}:`, err instanceof Error ? err.message : String(err));
        failed++;
      }
    }

    if (accounts.length < BATCH_SIZE) {
      hasMore = false;
    } else {
      offset += BATCH_SIZE;
    }
  }

  return { sent, failed };
}

async function processTrialEndingSoon(
  supabase: SupabaseClient<Database>,
  resend: Resend,
  fromAddress: string,
): Promise<{ sent: number; failed: number }> {
  const windows = [7, 3, 1] as const;
  let totalSent = 0;
  let totalFailed = 0;

  for (const days of windows) {
    const result = await processTrialEndingWindow(supabase, resend, fromAddress, days);
    totalSent += result.sent;
    totalFailed += result.failed;
    console.log(`[check-trial-expirations] ${days}-day window: ${result.sent} sent, ${result.failed} failed`);
  }

  return { sent: totalSent, failed: totalFailed };
}

async function processExpiredTrials(
  supabase: SupabaseClient<Database>,
  resend: Resend,
  fromAddress: string,
): Promise<{ canceled: number; failed: number }> {
  let canceled = 0;
  let failed = 0;

  const now = new Date().toISOString();
  let offset = 0;
  let hasMore = true;

  while (hasMore) {
    const { data: accounts, error } = await supabase
      .from('accounts')
      .select('*')
      .eq('plan', 'trial')
      .eq('subscription_status', 'trialing')
      .not('trial_ends_at', 'is', null)
      .lt('trial_ends_at', now)
      .is('deleted_at', null)
      .range(offset, offset + BATCH_SIZE - 1);

    if (error) {
      console.error('[check-trial-expirations] Failed to query expired trial accounts:', error.message);
      break;
    }

    if (!accounts || accounts.length === 0) {
      hasMore = false;
      break;
    }

    for (const account of accounts) {
      try {
        // Downgrade to free plan (keep account active)
        const { error: updateError } = await supabase
          .from('accounts')
          .update({ plan: 'free', subscription_status: 'active' })
          .eq('id', account.id);

        if (updateError) {
          console.error(`[check-trial-expirations] Failed to downgrade account ${account.id}:`, updateError.message);
          failed++;
          continue;
        }

        // Update all active widget submission limits to free plan limit (10)
        const FREE_SUBMISSION_LIMIT = 10;
        const { error: widgetError } = await supabase
          .from('widgets')
          .update({ submission_limit: FREE_SUBMISSION_LIMIT })
          .eq('account_id', account.id)
          .eq('is_active', true);

        if (widgetError) {
          console.error(`[check-trial-expirations] Failed to update widget limits for account ${account.id}:`, widgetError.message);
        }

        // Send trial ended email
        if (account.notification_email) {
          try {
            await resend.emails.send({
              from: fromAddress,
              to: account.notification_email,
              subject: 'Your HawkLeads trial has ended',
              html: buildTrialExpiredHtml(account),
              text: `Your HawkLeads trial for ${account.name} has ended. Your account is now on the Free plan: 10 leads/month, form-based scoring. Upgrade anytime for more: ${APP_URL}/settings/billing`,
            });
          } catch (emailErr) {
            console.error(`[check-trial-expirations] Failed to send expired email for account ${account.id}:`, emailErr instanceof Error ? emailErr.message : String(emailErr));
          }
        }

        canceled++;
      } catch (err) {
        console.error(`[check-trial-expirations] Error processing account ${account.id}:`, err instanceof Error ? err.message : String(err));
        failed++;
      }
    }

    if (accounts.length < BATCH_SIZE) {
      hasMore = false;
    } else {
      offset += BATCH_SIZE;
    }
  }

  return { canceled, failed };
}

export default async function handler(): Promise<void> {
  const supabase = createAdminClient();
  const resend = createResendClient();
  const fromAddress = process.env.EMAIL_FROM ?? 'HawkLeads <noreply@hawkleads.io>';

  console.log('[check-trial-expirations] Starting trial expiration check');

  const endingSoon = await processTrialEndingSoon(supabase, resend, fromAddress);
  console.log(`[check-trial-expirations] Trial ending soon: ${endingSoon.sent} emails sent, ${endingSoon.failed} failed`);

  const expired = await processExpiredTrials(supabase, resend, fromAddress);
  console.log(`[check-trial-expirations] Expired trials: ${expired.canceled} canceled, ${expired.failed} failed`);

  console.log('[check-trial-expirations] Complete');
}
