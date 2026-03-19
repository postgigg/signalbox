import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { RATE_LIMITS } from '@/lib/constants';
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';
import crypto from 'crypto';
import { validateWebhookUrl } from '@/lib/url-validation';

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  const { id } = await params;

  // Auth check
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Rate limit: 5 test webhooks per minute per account
  // Use a simple approach - create rate limiter inline using RATE_LIMITS.webhook_test config
  const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
  const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (redisUrl && redisToken) {
    const redis = new Redis({ url: redisUrl, token: redisToken });
    const limiter = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(RATE_LIMITS.webhook_test.tokens, RATE_LIMITS.webhook_test.window),
      prefix: RATE_LIMITS.webhook_test.prefix,
    });
    const rl = await limiter.limit(user.id);
    if (!rl.success) {
      return NextResponse.json({ error: 'Too many test requests. Try again in a minute.' }, { status: 429 });
    }
  }

  // Get member's account
  const { data: member } = await supabase
    .from('members')
    .select('account_id, role')
    .eq('user_id', user.id)
    .limit(1)
    .single();

  if (!member || member.role === 'viewer') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const admin = createAdminClient();

  // Fetch the webhook endpoint
  const { data: endpoint, error: endpointError } = await admin
    .from('webhook_endpoints')
    .select('*')
    .eq('id', id)
    .eq('account_id', member.account_id)
    .single();

  if (endpointError || !endpoint) {
    return NextResponse.json({ error: 'Webhook endpoint not found' }, { status: 404 });
  }

  // Validate URL
  const urlCheck = validateWebhookUrl(endpoint.url);
  if (!urlCheck.valid) {
    return NextResponse.json({ error: 'Invalid webhook URL: ' + (urlCheck.error ?? 'unknown') }, { status: 400 });
  }

  // Build test payload
  const testPayload = {
    event: 'test',
    data: {
      message: 'This is a test webhook from SignalBox',
      submissionId: '00000000-0000-0000-0000-000000000000',
      widgetId: '00000000-0000-0000-0000-000000000000',
      widgetKey: 'test_widget',
      visitorName: 'Test User',
      visitorEmail: 'test@example.com',
      leadTier: 'warm',
      leadScore: 65,
      rawScore: 8,
      answers: [],
      createdAt: new Date().toISOString(),
    },
    timestamp: new Date().toISOString(),
  };

  const body = JSON.stringify(testPayload);
  const signature = crypto
    .createHmac('sha256', endpoint.secret)
    .update(body)
    .digest('hex');

  const startTime = Date.now();
  let responseStatus: number | null = null;
  let responseBody: string | null = null;
  let success = false;
  let errorMessage: string | null = null;

  try {
    const response = await fetch(endpoint.url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-SignalBox-Signature': signature,
        'X-SignalBox-Event': 'test',
      },
      body,
      signal: AbortSignal.timeout(10_000),
      redirect: 'error',
    });

    responseStatus = response.status;
    const rawBody = await response.text().catch(() => '');
    responseBody = rawBody.slice(0, 2000); // Truncate to 2000 chars
    success = response.ok;
  } catch (err) {
    errorMessage = err instanceof Error ? err.message : 'Request failed';
    responseStatus = 0;
  }

  const durationMs = Date.now() - startTime;

  // Log the delivery attempt
  await admin.from('webhook_event_log').insert({
    account_id: member.account_id,
    webhook_endpoint_id: endpoint.id,
    event: 'test',
    request_body: JSON.parse(JSON.stringify(testPayload)),
    response_status: responseStatus,
    response_body: responseBody,
    duration_ms: durationMs,
    success,
    error_message: errorMessage,
  });

  // Update endpoint tracking
  await admin
    .from('webhook_endpoints')
    .update({
      last_triggered_at: new Date().toISOString(),
      last_status_code: responseStatus,
      failure_count: success ? 0 : endpoint.failure_count + 1,
    })
    .eq('id', endpoint.id);

  return NextResponse.json({
    success,
    responseStatus,
    responseBody,
    durationMs,
    errorMessage,
  });
}
