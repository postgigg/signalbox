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
      <h2>Your HawkLeads trial has expired</h2>
      <p>Hi there,</p>
      <p>The free trial for <strong>${account.name}</strong> has ended. Your account has been moved to a canceled state, and your widgets are no longer active.</p>
      <p>Don't worry — your data is safe. Upgrade to a paid plan to reactivate your account and pick up right where you left off.</p>
      <a href="${APP_URL}/settings/billing"
         style="display: inline-block; padding: 12px 24px; background-color: #3B82F6; color: #FFFFFF; text-decoration: none; border-radius: 6px; font-weight: bold;">
        Reactivate Account
      </a>
      <p style="margin-top: 16px;">Our plans start at just $99/month. <a href="${APP_URL}/pricing">View pricing</a></p>
      <p style="color: #6B7280; font-size: 12px; margin-top: 24px;">
        If you have any questions, reply to this email or contact us at support@hawkleads.io.
      </p>
    </div>
  `;
}

async function processTrialEndingSoon(
  supabase: SupabaseClient<Database>,
  resend: Resend,
  fromAddress: string,
): Promise<{ sent: number; failed: number }> {
  let sent = 0;
  let failed = 0;

  // Find accounts whose trial ends in approximately 3 days (between 2.5 and 3.5 days from now)
  const threeDaysFromNow = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);
  const windowStart = new Date(threeDaysFromNow.getTime() - 12 * 60 * 60 * 1000).toISOString();
  const windowEnd = new Date(threeDaysFromNow.getTime() + 12 * 60 * 60 * 1000).toISOString();

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
      console.error('[check-trial-expirations] Failed to query trial-ending-soon accounts:', error.message);
      break;
    }

    if (!accounts || accounts.length === 0) {
      hasMore = false;
      break;
    }

    for (const account of accounts) {
      if (!account.notification_email) {
        // Look up the owner's email from the members table or skip
        console.warn(`[check-trial-expirations] No notification email for account ${account.id}, skipping`);
        continue;
      }

      try {
        const trialEndsAt = new Date(account.trial_ends_at!);
        const daysLeft = Math.ceil((trialEndsAt.getTime() - Date.now()) / (24 * 60 * 60 * 1000));

        await resend.emails.send({
          from: fromAddress,
          to: account.notification_email,
          subject: `Your HawkLeads trial ends in ${daysLeft} days`,
          html: buildTrialEndingSoonHtml(account, daysLeft),
          text: `Your HawkLeads trial for ${account.name} ends in ${daysLeft} days. Upgrade now to keep your lead generation running: ${APP_URL}/settings/billing`,
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
        // Cancel the subscription status
        const { error: updateError } = await supabase
          .from('accounts')
          .update({ subscription_status: 'canceled' })
          .eq('id', account.id);

        if (updateError) {
          console.error(`[check-trial-expirations] Failed to cancel account ${account.id}:`, updateError.message);
          failed++;
          continue;
        }

        // Deactivate all widgets for this account
        const { error: widgetError } = await supabase
          .from('widgets')
          .update({ is_active: false })
          .eq('account_id', account.id);

        if (widgetError) {
          console.error(`[check-trial-expirations] Failed to deactivate widgets for account ${account.id}:`, widgetError.message);
        }

        // Send trial expired email
        if (account.notification_email) {
          try {
            await resend.emails.send({
              from: fromAddress,
              to: account.notification_email,
              subject: 'Your HawkLeads trial has expired',
              html: buildTrialExpiredHtml(account),
              text: `Your HawkLeads trial for ${account.name} has expired. Your account has been deactivated. Upgrade to reactivate: ${APP_URL}/settings/billing`,
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
  const fromAddress = process.env.EMAIL_FROM ?? 'HawkLeads <noreply@hawkleads.app>';

  console.log('[check-trial-expirations] Starting trial expiration check');

  const endingSoon = await processTrialEndingSoon(supabase, resend, fromAddress);
  console.log(`[check-trial-expirations] Trial ending soon: ${endingSoon.sent} emails sent, ${endingSoon.failed} failed`);

  const expired = await processExpiredTrials(supabase, resend, fromAddress);
  console.log(`[check-trial-expirations] Expired trials: ${expired.canceled} canceled, ${expired.failed} failed`);

  console.log('[check-trial-expirations] Complete');
}
