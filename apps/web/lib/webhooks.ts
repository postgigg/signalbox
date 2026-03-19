import { createAdminClient } from '@/lib/supabase/admin';
import crypto from 'crypto';
import { validateWebhookUrl } from '@/lib/url-validation';

interface WebhookPayload {
  event: string;
  data: Record<string, unknown>;
  timestamp: string;
}

/**
 * Fire webhooks for an account asynchronously.
 * This is a fire-and-forget operation intended to be called without awaiting.
 * Each delivery attempt is logged to webhook_event_log for debugging.
 */
export async function fireWebhooks(
  accountId: string,
  event: string,
  data: Record<string, unknown>,
): Promise<void> {
  const admin = createAdminClient();

  const { data: endpoints } = await admin
    .from('webhook_endpoints')
    .select('*')
    .eq('account_id', accountId)
    .eq('is_active', true)
    .contains('events', [event]);

  if (!endpoints || endpoints.length === 0) return;

  const payload: WebhookPayload = {
    event,
    data,
    timestamp: new Date().toISOString(),
  };

  const body = JSON.stringify(payload);

  await Promise.allSettled(
    endpoints.map(async (endpoint) => {
      // Validate webhook URL before dispatching
      const urlCheck = validateWebhookUrl(endpoint.url);
      if (!urlCheck.valid) {
        await admin
          .from('webhook_endpoints')
          .update({
            last_triggered_at: new Date().toISOString(),
            last_status_code: 0,
            failure_count: endpoint.failure_count + 1,
          })
          .eq('id', endpoint.id);

        // Log the failed attempt
        await admin.from('webhook_event_log').insert({
          account_id: accountId,
          webhook_endpoint_id: endpoint.id,
          event,
          request_body: payload as unknown as Record<string, unknown>,
          response_status: 0,
          success: false,
          error_message: `Invalid URL: ${urlCheck.reason ?? 'unknown'}`,
        });
        return;
      }

      const signature = crypto
        .createHmac('sha256', endpoint.secret)
        .update(body)
        .digest('hex');

      const startTime = Date.now();

      try {
        const response = await fetch(endpoint.url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-SignalBox-Signature': signature,
            'X-SignalBox-Event': event,
          },
          body,
          signal: AbortSignal.timeout(10_000),
          redirect: 'error',
        });

        const durationMs = Date.now() - startTime;
        const rawBody = await response.text().catch(() => '');
        const truncatedBody = rawBody.slice(0, 2000);

        await admin
          .from('webhook_endpoints')
          .update({
            last_triggered_at: new Date().toISOString(),
            last_status_code: response.status,
            failure_count: response.ok ? 0 : endpoint.failure_count + 1,
          })
          .eq('id', endpoint.id);

        // Log the delivery attempt
        await admin.from('webhook_event_log').insert({
          account_id: accountId,
          webhook_endpoint_id: endpoint.id,
          event,
          request_body: payload as unknown as Record<string, unknown>,
          response_status: response.status,
          response_body: truncatedBody,
          duration_ms: durationMs,
          success: response.ok,
          error_message: response.ok ? null : `HTTP ${String(response.status)}`,
        });
      } catch (err) {
        const durationMs = Date.now() - startTime;
        const errorMessage = err instanceof Error ? err.message : 'Request failed';

        await admin
          .from('webhook_endpoints')
          .update({
            last_triggered_at: new Date().toISOString(),
            last_status_code: 0,
            failure_count: endpoint.failure_count + 1,
          })
          .eq('id', endpoint.id);

        // Log the failed attempt
        await admin.from('webhook_event_log').insert({
          account_id: accountId,
          webhook_endpoint_id: endpoint.id,
          event,
          request_body: payload as unknown as Record<string, unknown>,
          response_status: 0,
          duration_ms: durationMs,
          success: false,
          error_message: errorMessage,
        });
      }
    }),
  );
}
