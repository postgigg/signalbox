import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

import { RATE_LIMITS } from './constants';

// ---------------------------------------------------------------------------
// Redis client
// ---------------------------------------------------------------------------

function isRedisConfigured(): boolean {
  return Boolean(process.env.UPSTASH_REDIS_REST_URL) && Boolean(process.env.UPSTASH_REDIS_REST_TOKEN);
}

function getRedis(): Redis {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) {
    throw new Error(
      'Missing UPSTASH_REDIS_REST_URL or UPSTASH_REDIS_REST_TOKEN environment variables'
    );
  }

  return new Redis({ url, token });
}

// ---------------------------------------------------------------------------
// Rate limiter factory
// ---------------------------------------------------------------------------

type SlidingWindowDuration =
  | `${number} ms`
  | `${number} s`
  | `${number} m`
  | `${number} h`
  | `${number} d`;

function createRateLimiter(
  prefix: string,
  tokens: number,
  window: SlidingWindowDuration
): Ratelimit | null {
  if (!isRedisConfigured()) {
    return null as unknown as Ratelimit;
  }
  return new Ratelimit({
    redis: getRedis(),
    limiter: Ratelimit.slidingWindow(tokens, window),
    prefix,
    analytics: true,
  });
}

// ---------------------------------------------------------------------------
// Pre-configured rate limiters
// ---------------------------------------------------------------------------

/** Rate limiter for widget submissions — 10 requests per minute per IP. */
export function submitLimit(): Ratelimit {
  return createRateLimiter(
    RATE_LIMITS.submit.prefix,
    RATE_LIMITS.submit.tokens,
    RATE_LIMITS.submit.window
  );
}

/** Rate limiter for widget config fetches — 30 requests per minute per IP. */
export function configLimit(): Ratelimit {
  return createRateLimiter(
    RATE_LIMITS.config.prefix,
    RATE_LIMITS.config.tokens,
    RATE_LIMITS.config.window
  );
}

/** Rate limiter for authentication attempts — 5 requests per 15 minutes per IP. */
export function authLimit(): Ratelimit {
  return createRateLimiter(
    RATE_LIMITS.auth.prefix,
    RATE_LIMITS.auth.tokens,
    RATE_LIMITS.auth.window
  );
}

/** Rate limiter for API key requests — 60 requests per minute per key. */
export function apiLimit(): Ratelimit {
  return createRateLimiter(
    RATE_LIMITS.api.prefix,
    RATE_LIMITS.api.tokens,
    RATE_LIMITS.api.window
  );
}

/** Global rate limiter for widget submissions — 3 requests per minute per IP. */
export function globalLimit(): Ratelimit {
  return createRateLimiter(
    RATE_LIMITS.submit_global.prefix,
    RATE_LIMITS.submit_global.tokens,
    RATE_LIMITS.submit_global.window
  );
}

// ---------------------------------------------------------------------------
// Helper to check rate limit and build response
// ---------------------------------------------------------------------------

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
}

/**
 * Check rate limit for a given identifier (IP, API key, user ID, etc.).
 * Returns structured result with headers-friendly fields.
 */
export async function checkRateLimit(
  limiter: Ratelimit,
  identifier: string
): Promise<RateLimitResult> {
  if (!isRedisConfigured()) {
    return { success: true, limit: 999, remaining: 999, reset: Date.now() + 60000 };
  }
  const result = await limiter.limit(identifier);
  return {
    success: result.success,
    limit: result.limit,
    remaining: result.remaining,
    reset: result.reset,
  };
}

/**
 * Build rate limit headers for the response.
 */
export function rateLimitHeaders(
  result: RateLimitResult
): Record<string, string> {
  const headers: Record<string, string> = {
    'X-RateLimit-Limit': String(result.limit),
    'X-RateLimit-Remaining': String(result.remaining),
    'X-RateLimit-Reset': String(result.reset),
  };

  if (!result.success) {
    headers['Retry-After'] = String(
      Math.ceil((result.reset - Date.now()) / 1000)
    );
  }

  return headers;
}
