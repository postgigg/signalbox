import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

import { forgotPasswordLimit, checkRateLimit, rateLimitHeaders } from '@/lib/rate-limit';
import { getClientIp } from '@/lib/ip';
import { createClient } from '@/lib/supabase/server';

const ForgotPasswordSchema = z.object({
  email: z.string().email().max(320).toLowerCase(),
});

export async function POST(request: NextRequest): Promise<NextResponse> {
  // 1. Rate limit check
  const ip = getClientIp(request);
  const rl = await checkRateLimit(forgotPasswordLimit(), ip);
  if (!rl.success) {
    return NextResponse.json(
      { error: 'Too many requests. Please try again later.' },
      { status: 429, headers: rateLimitHeaders(rl) }
    );
  }

  // 2. Parse + validate body
  const body: unknown = await request.json().catch(() => null);
  const parsed = ForgotPasswordSchema.safeParse(body);

  if (!parsed.success) {
    // Always return success to prevent email enumeration
    return NextResponse.json({ success: true });
  }

  // 3. Send reset email (always return success regardless of outcome)
  try {
    const supabase = await createClient();
    const origin = request.headers.get('origin') ?? request.nextUrl.origin;

    await supabase.auth.resetPasswordForEmail(parsed.data.email, {
      redirectTo: `${origin}/api/auth/callback?type=recovery`,
    });
  } catch {
    // Swallow errors to prevent email enumeration
  }

  return NextResponse.json({ success: true });
}
