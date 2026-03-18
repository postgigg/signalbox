import { NextRequest, NextResponse } from 'next/server';
import { timingSafeEqual } from 'crypto';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { apiLimit, checkRateLimit } from '@/lib/rate-limit';
import { API_KEY_PREFIX } from '@/lib/constants';
import type { Member, Account, MemberRole } from '@/lib/supabase/types';

export interface AuthContext {
  userId: string;
  member: Member;
  account: Account;
}

async function sha256Hex(input: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(input);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Try API key authentication from Authorization: Bearer header.
 * Returns AuthContext on success, null if no bearer token present,
 * or a NextResponse error if the key is invalid.
 */
async function authenticateApiKey(
  request: NextRequest,
): Promise<{ ctx: AuthContext } | { error: NextResponse } | null> {
  const authHeader = request.headers.get('authorization');
  if (!authHeader) return null;

  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') return null;

  const rawKey = parts[1];
  if (!rawKey || !rawKey.startsWith(API_KEY_PREFIX)) return null;

  // Rate limit by key prefix
  const keyPrefix = rawKey.slice(0, 12);
  const rateLimitResult = await checkRateLimit(apiLimit(), keyPrefix);
  if (!rateLimitResult.success) {
    return {
      error: NextResponse.json(
        { error: 'Rate limit exceeded' },
        { status: 429, headers: { 'Retry-After': String(Math.ceil((rateLimitResult.reset - Date.now()) / 1000)) } },
      ),
    };
  }

  const keyHash = await sha256Hex(rawKey);
  const admin = createAdminClient();

  const { data: apiKey, error: keyError } = await admin
    .from('api_keys')
    .select('id, account_id, key_hash, role, is_active, expires_at')
    .eq('key_hash', keyHash)
    .eq('is_active', true)
    .limit(1)
    .maybeSingle();

  if (keyError || !apiKey) {
    return {
      error: NextResponse.json(
        { error: 'Invalid API key' },
        { status: 401 },
      ),
    };
  }

  // Timing-safe comparison of hash (defense in depth)
  const storedHash = Buffer.from(apiKey.key_hash, 'hex');
  const computedHash = Buffer.from(keyHash, 'hex');
  if (storedHash.length !== computedHash.length || !timingSafeEqual(storedHash, computedHash)) {
    return {
      error: NextResponse.json(
        { error: 'Invalid API key' },
        { status: 401 },
      ),
    };
  }

  if (apiKey.expires_at !== null && new Date(apiKey.expires_at) < new Date()) {
    return {
      error: NextResponse.json(
        { error: 'API key has expired' },
        { status: 401 },
      ),
    };
  }

  const { data: account, error: accountError } = await admin
    .from('accounts')
    .select('*')
    .eq('id', apiKey.account_id)
    .single();

  if (accountError || !account) {
    return {
      error: NextResponse.json(
        { error: 'Account not found' },
        { status: 404 },
      ),
    };
  }

  // Update last_used_at fire-and-forget
  void Promise.resolve(
    admin
      .from('api_keys')
      .update({ last_used_at: new Date().toISOString() })
      .eq('id', apiKey.id)
  ).catch(() => { /* noop */ });

  // Build synthetic member for API key auth using the stored role
  const apiKeyRole = apiKey.role === 'viewer' ? 'viewer' as const : 'admin' as const;
  const syntheticMember: Member = {
    id: apiKey.id,
    account_id: account.id,
    user_id: account.owner_id,
    role: apiKeyRole,
    invited_email: null,
    invited_at: null,
    accepted_at: null,
    created_at: account.created_at,
  };

  return { ctx: { userId: account.owner_id, member: syntheticMember, account } };
}

/**
 * Authenticate a request and resolve the user's member + account.
 * Supports both API key auth (Bearer token) and session auth (cookie).
 * Returns null and a NextResponse error if authentication fails.
 */
export async function authenticateRequest(
  request: NextRequest,
): Promise<{ ctx: AuthContext } | { error: NextResponse }> {
  // Try API key auth first
  const apiKeyResult = await authenticateApiKey(request);
  if (apiKeyResult !== null) {
    return apiKeyResult;
  }

  // Fall through to session auth
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return {
      error: NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 },
      ),
    };
  }

  const admin = createAdminClient();

  const { data: member, error: memberError } = await admin
    .from('members')
    .select('*')
    .eq('user_id', user.id)
    .limit(1)
    .single();

  if (memberError || !member) {
    return {
      error: NextResponse.json(
        { error: 'No account membership found' },
        { status: 403 },
      ),
    };
  }

  const { data: account, error: accountError } = await admin
    .from('accounts')
    .select('*')
    .eq('id', member.account_id)
    .single();

  if (accountError || !account) {
    return {
      error: NextResponse.json(
        { error: 'Account not found' },
        { status: 404 },
      ),
    };
  }

  return { ctx: { userId: user.id, member, account } };
}

/** Check whether the member has one of the required roles */
export function requireRole(
  member: Member,
  roles: MemberRole[],
): NextResponse | null {
  if (!roles.includes(member.role)) {
    return NextResponse.json(
      { error: 'Insufficient permissions', details: `Required role: ${roles.join(' or ')}` },
      { status: 403 },
    );
  }
  return null;
}

/** Export sha256Hex for use in API key creation */
export { sha256Hex };
