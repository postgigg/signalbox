import { createAdminClient } from '@/lib/supabase/admin';
import crypto from 'crypto';

interface WebhookPayload {
  event: string;
  data: Record<string, unknown>;
  timestamp: string;
}

/**
 * Fire webhooks for an account asynchronously.
 * This is a fire-and-forget operation intended to be called without awaiting.
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
      const signature = crypto
        .createHmac('sha256', endpoint.secret)
        .update(body)
        .digest('hex');

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
        });

        await admin
          .from('webhook_endpoints')
          .update({
            last_triggered_at: new Date().toISOString(),
            last_status_code: response.status,
            failure_count: response.ok ? 0 : endpoint.failure_count + 1,
          })
          .eq('id', endpoint.id);
      } catch {
        await admin
          .from('webhook_endpoints')
          .update({
            last_triggered_at: new Date().toISOString(),
            last_status_code: 0,
            failure_count: endpoint.failure_count + 1,
          })
          .eq('id', endpoint.id);
      }
    }),
  );
}
