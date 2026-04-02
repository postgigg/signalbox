import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Resend } from 'resend';
import type { Database } from '../../lib/supabase/types';

type AccountRow = Database['public']['Tables']['accounts']['Row'];

interface DigestAccount extends AccountRow {
  members: Array<{ user_id: string; display_name: string | null }>;
  notification_preferences: Array<{ email_weekly_digest: boolean }>;
}

const BATCH_SIZE = 50;
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://hawkleads.io';
const APP_NAME = 'HawkLeads';
const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

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

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function buildDigestHtml(data: {
  accountName: string;
  firstName: string;
  weekStart: string;
  weekEnd: string;
  totalSubmissions: number;
  hotLeads: number;
  warmLeads: number;
  coldLeads: number;
  avgScore: number;
  topWidget: string | null;
  conversionRate: number;
}): string {
  const dashboardUrl = `${APP_URL}/dashboard`;

  return `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="margin-bottom: 24px;">
        <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" width="28" height="28" style="vertical-align: middle; margin-right: 8px;">
          <path d="M12 8L22 56" stroke="#0F172A" stroke-width="6" stroke-linecap="round"/>
          <path d="M26 4L40 60" stroke="#0F172A" stroke-width="7" stroke-linecap="round"/>
          <path d="M44 12L50 52" stroke="#0F172A" stroke-width="5" stroke-linecap="round"/>
        </svg>
        <span style="font-weight: 700; font-size: 18px; vertical-align: middle; letter-spacing: -0.03em;">${APP_NAME}</span>
      </div>
      <h2>Weekly Report</h2>
      <p>Hey ${data.firstName}, here's your ${APP_NAME} summary for <strong>${formatDate(data.weekStart)} to ${formatDate(data.weekEnd)}</strong>.</p>
      <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
        <tr>
          <td style="text-align: center; padding: 12px;">
            <div style="font-size: 28px; font-weight: 700; color: #0f172a;">${data.totalSubmissions}</div>
            <div style="font-size: 12px; color: #71717a; text-transform: uppercase;">Submissions</div>
          </td>
          <td style="text-align: center; padding: 12px;">
            <div style="font-size: 28px; font-weight: 700; color: #0f172a;">${Math.round(data.avgScore)}</div>
            <div style="font-size: 12px; color: #71717a; text-transform: uppercase;">Avg Score</div>
          </td>
          <td style="text-align: center; padding: 12px;">
            <div style="font-size: 28px; font-weight: 700; color: #0f172a;">${data.conversionRate.toFixed(1)}%</div>
            <div style="font-size: 12px; color: #71717a; text-transform: uppercase;">Conversion</div>
          </td>
        </tr>
      </table>
      <table style="width: 100%; border-collapse: collapse; margin: 8px 0;">
        <tr>
          <td style="padding: 4px 0;"><span style="display: inline-block; padding: 4px 12px; border-radius: 9999px; font-size: 12px; font-weight: 600; background-color: #FEE2E2; color: #DC2626;">Hot</span></td>
          <td style="text-align: right; font-weight: 600;">${data.hotLeads}</td>
        </tr>
        <tr>
          <td style="padding: 4px 0;"><span style="display: inline-block; padding: 4px 12px; border-radius: 9999px; font-size: 12px; font-weight: 600; background-color: #FEF3C7; color: #D97706;">Warm</span></td>
          <td style="text-align: right; font-weight: 600;">${data.warmLeads}</td>
        </tr>
        <tr>
          <td style="padding: 4px 0;"><span style="display: inline-block; padding: 4px 12px; border-radius: 9999px; font-size: 12px; font-weight: 600; background-color: #DBEAFE; color: #2563EB;">Cold</span></td>
          <td style="text-align: right; font-weight: 600;">${data.coldLeads}</td>
        </tr>
      </table>
      ${data.topWidget ? `<p>Top performing widget: <strong>${data.topWidget}</strong></p>` : ''}
      <div style="text-align: center; margin: 24px 0;">
        <a href="${dashboardUrl}" style="display: inline-block; padding: 12px 24px; background-color: #3B82F6; color: #FFFFFF; text-decoration: none; border-radius: 6px; font-weight: bold;">
          View Dashboard
        </a>
      </div>
      <p style="color: #6B7280; font-size: 12px; margin-top: 24px;">
        You're receiving this because you have weekly digest emails enabled. Manage your notification preferences in your dashboard settings.
      </p>
    </div>
  `;
}

export default async function handler(): Promise<void> {
  const supabase = createAdminClient();
  const resend = createResendClient();
  const fromAddress = process.env.EMAIL_FROM ?? 'HawkLeads <noreply@hawkleads.app>';

  const now = new Date();
  const weekEnd = now.toISOString().split('T')[0] ?? '';
  const weekStartDate = new Date(now.getTime() - SEVEN_DAYS_MS);
  const weekStart = weekStartDate.toISOString().split('T')[0] ?? '';

  console.log(`[send-weekly-digest] Starting digest for ${weekStart} to ${weekEnd}`);

  let offset = 0;
  let hasMore = true;
  let totalSent = 0;
  let totalFailed = 0;

  while (hasMore) {
    // Find accounts with digest enabled
    const { data: accounts, error } = await supabase
      .from('accounts')
      .select('*, members(user_id, display_name), notification_preferences(email_weekly_digest)')
      .is('deleted_at', null)
      .eq('is_suspended', false)
      .range(offset, offset + BATCH_SIZE - 1);

    if (error) {
      console.error('[send-weekly-digest] Failed to query accounts:', error.message);
      break;
    }

    if (!accounts || accounts.length === 0) {
      hasMore = false;
      break;
    }

    for (const rawAccount of accounts) {
      const account = rawAccount as unknown as DigestAccount;

      // Check if digest is enabled (default to false)
      const prefs = account.notification_preferences;
      const digestEnabled = Array.isArray(prefs) && prefs.length > 0 && prefs[0]?.email_weekly_digest === true;
      if (!digestEnabled) continue;

      if (!account.notification_email) continue;

      try {
        // Fetch analytics for the past 7 days
        const { data: analytics } = await supabase
          .from('widget_analytics')
          .select('impressions, opens, submissions, hot_count, warm_count, cold_count, avg_score, widget_id')
          .eq('account_id', account.id)
          .gte('date', weekStart)
          .lte('date', weekEnd);

        if (!analytics || analytics.length === 0) continue;

        const totalSubmissions = analytics.reduce((s, a) => s + a.submissions, 0);
        const totalOpens = analytics.reduce((s, a) => s + a.opens, 0);
        const hotLeads = analytics.reduce((s, a) => s + a.hot_count, 0);
        const warmLeads = analytics.reduce((s, a) => s + a.warm_count, 0);
        const coldLeads = analytics.reduce((s, a) => s + a.cold_count, 0);

        const scoresWithData = analytics.filter((a) => a.avg_score !== null);
        const avgScore = scoresWithData.length > 0
          ? scoresWithData.reduce((s, a) => s + (a.avg_score ?? 0), 0) / scoresWithData.length
          : 0;

        const conversionRate = totalOpens > 0
          ? (totalSubmissions / totalOpens) * 100
          : 0;

        // Find top widget by submissions
        const widgetSubs = new Map<string, number>();
        for (const row of analytics) {
          widgetSubs.set(row.widget_id, (widgetSubs.get(row.widget_id) ?? 0) + row.submissions);
        }
        let topWidgetId: string | null = null;
        let maxSubs = 0;
        for (const [wId, count] of widgetSubs) {
          if (count > maxSubs) {
            maxSubs = count;
            topWidgetId = wId;
          }
        }

        let topWidgetName: string | null = null;
        if (topWidgetId) {
          const { data: widget } = await supabase
            .from('widgets')
            .select('name')
            .eq('id', topWidgetId)
            .single();
          topWidgetName = widget?.name ?? null;
        }

        // Get owner name
        const owner = Array.isArray(account.members) && account.members.length > 0
          ? account.members[0]
          : null;
        const fullName = owner?.display_name ?? account.name;
        const firstName = fullName.split(' ')[0] ?? fullName;

        const html = buildDigestHtml({
          accountName: account.name,
          firstName,
          weekStart,
          weekEnd,
          totalSubmissions,
          hotLeads,
          warmLeads,
          coldLeads,
          avgScore,
          topWidget: topWidgetName,
          conversionRate,
        });

        await resend.emails.send({
          from: fromAddress,
          to: account.notification_email,
          subject: `${APP_NAME} Weekly Report: ${totalSubmissions} submissions`,
          html,
          text: `Weekly Report for ${account.name} (${formatDate(weekStart)} - ${formatDate(weekEnd)}). Submissions: ${totalSubmissions}, Hot: ${hotLeads}, Warm: ${warmLeads}, Cold: ${coldLeads}. Avg Score: ${Math.round(avgScore)}. View dashboard: ${APP_URL}/dashboard`,
        });

        totalSent++;
      } catch (err) {
        console.error(`[send-weekly-digest] Failed for account ${account.id}:`, err instanceof Error ? err.message : String(err));
        totalFailed++;
      }
    }

    if (accounts.length < BATCH_SIZE) {
      hasMore = false;
    } else {
      offset += BATCH_SIZE;
    }
  }

  console.log(`[send-weekly-digest] Complete: ${totalSent} sent, ${totalFailed} failed`);
}
