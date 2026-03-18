import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Resend } from 'resend';
import crypto from 'crypto';
import { URL } from 'url';
import net from 'net';
import type { Database } from '../../lib/supabase/types';

type WebhookEndpointRow = Database['public']['Tables']['webhook_endpoints']['Row'];
type SubmissionRow = Database['public']['Tables']['submissions']['Row'];
type AccountRow = Database['public']['Tables']['accounts']['Row'];

const BATCH_SIZE = 50;
const MAX_FAILURE_COUNT = 10;
const FAILURE_NOTIFICATION_THRESHOLD = 3;
const WEBHOOK_TIMEOUT_MS = 10_000;
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

/**
 * Check if an IP address is internal/private (SSRF prevention).
 */
function isInternalIp(ip: string): boolean {
  if (net.isIPv4(ip)) {
    const parts = ip.split('.').map(Number);
    // 10.0.0.0/8
    if (parts[0] === 10) return true;
    // 172.16.0.0/12
    if (parts[0] === 172 && parts[1] !== undefined && parts[1] >= 16 && parts[1] <= 31) return true;
    // 192.168.0.0/16
    if (parts[0] === 192 && parts[1] === 168) return true;
    // 127.0.0.0/8
    if (parts[0] === 127) return true;
    // 0.0.0.0/8
    if (parts[0] === 0) return true;
    // 169.254.0.0/16 (link-local)
    if (parts[0] === 169 && parts[1] === 254) return true;
  }

  if (net.isIPv6(ip)) {
    const normalized = ip.toLowerCase();
    // Loopback
    if (normalized === '::1' || normalized === '0000:0000:0000:0000:0000:0000:0000:0001') return true;
    // Link-local
    if (normalized.startsWith('fe80:')) return true;
    // Unique local
    if (normalized.startsWith('fc') || normalized.startsWith('fd')) return true;
  }

  return false;
}

/**
 * Validate webhook URL is safe to call (SSRF prevention).
 */
async function isUrlSafe(urlString: string): Promise<boolean> {
  try {
    const parsed = new URL(urlString);

    // Only allow https
    if (parsed.protocol !== 'https:') return false;

    // Block common internal hostnames
    const blockedHostnames = ['localhost', '127.0.0.1', '0.0.0.0', '[::1]', 'metadata.google.internal'];
    if (blockedHostnames.includes(parsed.hostname)) return false;

    // Check if hostname is a raw IP
    if (net.isIP(parsed.hostname)) {
      return !isInternalIp(parsed.hostname);
    }

    // Resolve DNS and check the IP
    // In Netlify Functions, dns.resolve may not be available, so we do a basic hostname check
    const internalPatterns = [
      /^10\./,
      /^172\.(1[6-9]|2\d|3[01])\./,
      /^192\.168\./,
      /^127\./,
      /^0\./,
      /^169\.254\./,
    ];

    for (const pattern of internalPatterns) {
      if (pattern.test(parsed.hostname)) return false;
    }

    return true;
  } catch {
    return false;
  }
}

interface WebhookPayload {
  event: string;
  data: {
    submission_id: string;
    widget_id: string;
    visitor_name: string;
    visitor_email: string;
    visitor_phone: string | null;
    lead_score: number;
    lead_tier: string;
    status: string;
    answers: unknown;
    created_at: string;
  };
  timestamp: string;
  webhook_id: string;
}

function buildPayload(submission: SubmissionRow, webhookId: string): WebhookPayload {
  return {
    event: 'submission.created',
    data: {
      submission_id: submission.id,
      widget_id: submission.widget_id,
      visitor_name: submission.visitor_name,
      visitor_email: submission.visitor_email,
      visitor_phone: submission.visitor_phone,
      lead_score: submission.lead_score,
      lead_tier: submission.lead_tier,
      status: submission.status,
      answers: submission.answers,
      created_at: submission.created_at,
    },
    timestamp: new Date().toISOString(),
    webhook_id: webhookId,
  };
}

function signPayload(body: string, secret: string): string {
  return crypto.createHmac('sha256', secret).update(body).digest('hex');
}

async function sendWebhookFailureEmail(
  resend: Resend,
  fromAddress: string,
  notificationEmail: string,
  endpoint: WebhookEndpointRow,
  failureCount: number,
): Promise<void> {
  const subject = `Webhook delivery failures for ${endpoint.url}`;
  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #EF4444;">Webhook Delivery Failures</h2>
      <p>Your webhook endpoint has experienced ${failureCount} consecutive delivery failures.</p>
      <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
        <tr>
          <td style="padding: 8px; font-weight: bold; border-bottom: 1px solid #E5E7EB;">Endpoint URL</td>
          <td style="padding: 8px; border-bottom: 1px solid #E5E7EB;">${endpoint.url}</td>
        </tr>
        <tr>
          <td style="padding: 8px; font-weight: bold; border-bottom: 1px solid #E5E7EB;">Failure Count</td>
          <td style="padding: 8px; border-bottom: 1px solid #E5E7EB;">${failureCount}</td>
        </tr>
        <tr>
          <td style="padding: 8px; font-weight: bold; border-bottom: 1px solid #E5E7EB;">Last Status Code</td>
          <td style="padding: 8px; border-bottom: 1px solid #E5E7EB;">${endpoint.last_status_code ?? 'N/A'}</td>
        </tr>
        <tr>
          <td style="padding: 8px; font-weight: bold;">Status</td>
          <td style="padding: 8px;">${failureCount >= MAX_FAILURE_COUNT ? 'Deactivated' : 'Active (retrying)'}</td>
        </tr>
      </table>
      ${failureCount >= MAX_FAILURE_COUNT
        ? '<p style="color: #EF4444; font-weight: bold;">This webhook has been automatically deactivated after 10 consecutive failures. Please fix the endpoint and re-enable it in your settings.</p>'
        : '<p>We will continue retrying delivery. If failures reach 10, the webhook will be automatically deactivated.</p>'
      }
      <a href="${APP_URL}/settings/webhooks"
         style="display: inline-block; padding: 12px 24px; background-color: #3B82F6; color: #FFFFFF; text-decoration: none; border-radius: 6px; font-weight: bold;">
        Manage Webhooks
      </a>
    </div>
  `;

  try {
    await resend.emails.send({
      from: fromAddress,
      to: notificationEmail,
      subject,
      html,
      text: `Webhook delivery failures for ${endpoint.url}. Failure count: ${failureCount}. ${failureCount >= MAX_FAILURE_COUNT ? 'The webhook has been deactivated.' : 'Retries will continue.'}`,
    });
  } catch (emailErr) {
    console.error(`[retry-webhooks] Failed to send failure notification email:`, emailErr instanceof Error ? emailErr.message : String(emailErr));
  }
}

export default async function handler(): Promise<void> {
  const supabase = createAdminClient();
  const resend = createResendClient();
  const fromAddress = process.env.EMAIL_FROM ?? 'SignalBox <noreply@signalbox.app>';

  // Find webhook endpoints that have failed but are still retryable
  const { data: failingEndpoints, error: endpointsError } = await supabase
    .from('webhook_endpoints')
    .select('*')
    .eq('is_active', true)
    .gt('failure_count', 0)
    .lt('failure_count', MAX_FAILURE_COUNT);

  if (endpointsError) {
    console.error('[retry-webhooks] Failed to query failing endpoints:', endpointsError.message);
    return;
  }

  if (!failingEndpoints || failingEndpoints.length === 0) {
    console.log('[retry-webhooks] No failing webhook endpoints found');
    return;
  }

  console.log(`[retry-webhooks] Processing ${failingEndpoints.length} failing webhook endpoints`);

  let totalRetried = 0;
  let totalFailed = 0;

  for (const endpoint of failingEndpoints) {
    // Validate URL safety before attempting delivery
    const urlSafe = await isUrlSafe(endpoint.url);
    if (!urlSafe) {
      console.warn(`[retry-webhooks] Unsafe URL detected, deactivating endpoint ${endpoint.id}: ${endpoint.url}`);
      await supabase
        .from('webhook_endpoints')
        .update({ is_active: false, failure_count: MAX_FAILURE_COUNT })
        .eq('id', endpoint.id);
      continue;
    }

    // Find recent undelivered submissions for this endpoint's account
    // We look at submissions created since the endpoint last successfully triggered,
    // or in the last 24 hours if never triggered.
    const sinceDate = endpoint.last_triggered_at
      ? new Date(new Date(endpoint.last_triggered_at).getTime() - 5 * 60 * 1000).toISOString()
      : new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

    const { data: submissions, error: subsError } = await supabase
      .from('submissions')
      .select('*')
      .eq('account_id', endpoint.account_id)
      .gt('created_at', sinceDate)
      .order('created_at', { ascending: true })
      .limit(BATCH_SIZE);

    if (subsError) {
      console.error(`[retry-webhooks] Failed to query submissions for endpoint ${endpoint.id}:`, subsError.message);
      continue;
    }

    if (!submissions || submissions.length === 0) {
      continue;
    }

    for (const submission of submissions) {
      const payload = buildPayload(submission, endpoint.id);
      const body = JSON.stringify(payload);
      const timestamp = new Date().toISOString();
      const signature = signPayload(body, endpoint.secret);

      try {
        const response = await fetch(endpoint.url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-SignalBox-Signature': signature,
            'X-SignalBox-Timestamp': timestamp,
          },
          body,
          signal: AbortSignal.timeout(WEBHOOK_TIMEOUT_MS),
          redirect: 'error', // Do not follow redirects (SSRF prevention)
        });

        if (response.ok) {
          // Reset failure count on success
          await supabase
            .from('webhook_endpoints')
            .update({
              last_triggered_at: new Date().toISOString(),
              last_status_code: response.status,
              failure_count: 0,
            })
            .eq('id', endpoint.id);

          totalRetried++;
          // Once we get a successful delivery, the endpoint is healthy — stop retrying for this endpoint
          break;
        } else {
          const newFailureCount = endpoint.failure_count + 1;

          const updateData: Database['public']['Tables']['webhook_endpoints']['Update'] = {
            last_triggered_at: new Date().toISOString(),
            last_status_code: response.status,
            failure_count: newFailureCount,
          };

          // Deactivate if max failures reached
          if (newFailureCount >= MAX_FAILURE_COUNT) {
            updateData.is_active = false;
          }

          await supabase
            .from('webhook_endpoints')
            .update(updateData)
            .eq('id', endpoint.id);

          // Send notification email at threshold or deactivation
          if (newFailureCount === FAILURE_NOTIFICATION_THRESHOLD || newFailureCount >= MAX_FAILURE_COUNT) {
            const { data: account } = await supabase
              .from('accounts')
              .select('notification_email')
              .eq('id', endpoint.account_id)
              .single();

            if (account?.notification_email) {
              await sendWebhookFailureEmail(resend, fromAddress, account.notification_email, endpoint, newFailureCount);
            }
          }

          totalFailed++;
          break; // Don't retry more submissions for this already-failing endpoint
        }
      } catch (err) {
        const newFailureCount = endpoint.failure_count + 1;

        const updateData: Database['public']['Tables']['webhook_endpoints']['Update'] = {
          last_triggered_at: new Date().toISOString(),
          last_status_code: 0,
          failure_count: newFailureCount,
        };

        if (newFailureCount >= MAX_FAILURE_COUNT) {
          updateData.is_active = false;
        }

        await supabase
          .from('webhook_endpoints')
          .update(updateData)
          .eq('id', endpoint.id);

        if (newFailureCount === FAILURE_NOTIFICATION_THRESHOLD || newFailureCount >= MAX_FAILURE_COUNT) {
          const { data: account } = await supabase
            .from('accounts')
            .select('notification_email')
            .eq('id', endpoint.account_id)
            .single();

          if (account?.notification_email) {
            await sendWebhookFailureEmail(resend, fromAddress, account.notification_email, endpoint, newFailureCount);
          }
        }

        console.error(`[retry-webhooks] Delivery failed for endpoint ${endpoint.id}:`, err instanceof Error ? err.message : String(err));
        totalFailed++;
        break;
      }
    }
  }

  console.log(`[retry-webhooks] Complete: ${totalRetried} retried successfully, ${totalFailed} failed`);
}
