import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createAdminClient } from '@/lib/supabase/admin';
import { corsJson, corsOptions } from '@/lib/cors';
import { RATE_LIMITS } from '@/lib/constants';
import { getClientIp } from '@/lib/ip';
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const querySchema = z.object({
  token: z.string().min(1),
  password: z.string().optional(),
  days: z.coerce.number().int().min(1).max(90).default(30),
});

export async function OPTIONS(): Promise<NextResponse> {
  return corsOptions();
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  const ip = getClientIp(request);

  // Rate limit
  const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
  const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (redisUrl && redisToken) {
    const redis = new Redis({ url: redisUrl, token: redisToken });
    const limiter = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(RATE_LIMITS.shared_analytics.tokens, RATE_LIMITS.shared_analytics.window),
      prefix: RATE_LIMITS.shared_analytics.prefix,
    });
    const rl = await limiter.limit(ip);
    if (!rl.success) {
      return corsJson({ error: 'Rate limit exceeded' }, { status: 429 });
    }
  }

  const searchParams = Object.fromEntries(request.nextUrl.searchParams.entries());
  const parsed = querySchema.safeParse(searchParams);
  if (!parsed.success) {
    return corsJson({ error: 'Invalid query parameters' }, { status: 400 });
  }

  const { token, password, days } = parsed.data;
  const admin = createAdminClient();

  // Fetch the shared link
  const { data: link, error: linkError } = await admin
    .from('shared_analytics_links')
    .select('*')
    .eq('token', token)
    .single();

  if (linkError || !link) {
    return corsJson({ error: 'Not found' }, { status: 404 });
  }

  if (!link.is_active) {
    return corsJson({ error: 'Not found' }, { status: 404 });
  }

  // Check expiry
  if (link.expires_at !== null && new Date(link.expires_at) < new Date()) {
    return corsJson({ error: 'This link has expired' }, { status: 410 });
  }

  // Password check
  if (link.password_hash !== null) {
    if (!password) {
      return corsJson({ error: 'Password required' }, { status: 401 });
    }

    // Rate limit password attempts
    if (redisUrl && redisToken) {
      const redis = new Redis({ url: redisUrl, token: redisToken });
      const pwLimiter = new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(RATE_LIMITS.shared_analytics_password.tokens, RATE_LIMITS.shared_analytics_password.window),
        prefix: RATE_LIMITS.shared_analytics_password.prefix,
      });
      const pwRl = await pwLimiter.limit(`pw:${token}`);
      if (!pwRl.success) {
        return corsJson({ error: 'Too many password attempts' }, { status: 429 });
      }
    }

    const hashBuffer = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(password));
    const hash = Array.from(new Uint8Array(hashBuffer)).map((b) => b.toString(16).padStart(2, '0')).join('');
    if (hash !== link.password_hash) {
      return corsJson({ error: 'Invalid password' }, { status: 401 });
    }
  }

  // Update access tracking
  await admin
    .from('shared_analytics_links')
    .update({
      last_accessed_at: new Date().toISOString(),
      access_count: link.access_count + 1,
    })
    .eq('id', link.id);

  // Build date range
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  const startDateStr = startDate.toISOString().split('T')[0]!;

  // Fetch analytics data based on allowed metrics
  let analyticsQuery = admin
    .from('widget_analytics')
    .select('date, submissions, hot_count, warm_count, cold_count, impressions, completions, avg_score')
    .eq('account_id', link.account_id)
    .gte('date', startDateStr)
    .order('date', { ascending: true });

  if (link.widget_id !== null) {
    analyticsQuery = analyticsQuery.eq('widget_id', link.widget_id);
  }

  const { data: analytics } = await analyticsQuery;

  interface AnalyticsRow {
    date: string;
    submissions: number;
    hot_count: number;
    warm_count: number;
    cold_count: number;
    impressions: number;
    completions: number;
    avg_score: number | null;
  }

  const filteredAnalytics: AnalyticsRow[] = (analytics ?? []) as AnalyticsRow[];

  // Build response based on allowed_metrics
  const response: Record<string, unknown> = { name: link.name };

  const metrics = link.allowed_metrics;

  if (metrics.includes('submissions')) {
    response.totalSubmissions = filteredAnalytics.reduce(
      (sum: number, row: AnalyticsRow) => sum + row.submissions, 0,
    );
  }

  if (metrics.includes('tier_breakdown')) {
    response.tierBreakdown = {
      hot: filteredAnalytics.reduce((sum: number, row: AnalyticsRow) => sum + row.hot_count, 0),
      warm: filteredAnalytics.reduce((sum: number, row: AnalyticsRow) => sum + row.warm_count, 0),
      cold: filteredAnalytics.reduce((sum: number, row: AnalyticsRow) => sum + row.cold_count, 0),
    };
  }

  if (metrics.includes('conversion_rate')) {
    const totalImpressions = filteredAnalytics.reduce(
      (sum: number, row: AnalyticsRow) => sum + row.impressions, 0,
    );
    const totalSubmissions = filteredAnalytics.reduce(
      (sum: number, row: AnalyticsRow) => sum + row.submissions, 0,
    );
    response.conversionRate = totalImpressions > 0
      ? Math.round((totalSubmissions / totalImpressions) * 10000) / 100
      : 0;
  }

  if (metrics.includes('over_time')) {
    response.overTime = filteredAnalytics.map((row: AnalyticsRow) => ({
      date: row.date,
      submissions: row.submissions,
      hotCount: row.hot_count,
      warmCount: row.warm_count,
      coldCount: row.cold_count,
    }));
  }

  return corsJson(response);
}
