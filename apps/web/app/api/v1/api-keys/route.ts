import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createAdminClient } from '@/lib/supabase/admin';
import { authenticateRequest, requireRole, sha256Hex } from '@/lib/auth';
import { getPlanLimits } from '@/lib/plan-limits';
import { API_KEY_PREFIX } from '@/lib/constants';

export const runtime = 'nodejs';

const createKeySchema = z.object({
  name: z.string().trim().min(1).max(100),
  role: z.enum(['admin', 'viewer']).default('admin'),
}).strict();

export async function GET(
  request: NextRequest,
): Promise<NextResponse> {
  const authResult = await authenticateRequest(request);
  if ('error' in authResult) return authResult.error;
  const { account } = authResult.ctx;

  const admin = createAdminClient();

  const { data: keys, error } = await admin
    .from('api_keys')
    .select('id, name, key_prefix, last_used_at, is_active, created_at')
    .eq('account_id', account.id)
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: 'Failed to fetch API keys' }, { status: 500 });
  }

  const limits = getPlanLimits(account.plan);

  return NextResponse.json({
    data: keys,
    limits: {
      apiAccess: limits.apiAccess,
      maxKeys: limits.apiKeys,
      activeKeys: keys?.filter((k: { is_active: boolean }) => k.is_active).length ?? 0,
    },
  });
}

export async function POST(
  request: NextRequest,
): Promise<NextResponse> {
  const authResult = await authenticateRequest(request);
  if ('error' in authResult) return authResult.error;
  const { member, account } = authResult.ctx;

  const roleError = requireRole(member, ['owner', 'admin']);
  if (roleError) return roleError;

  const limits = getPlanLimits(account.plan);
  if (!limits.apiAccess) {
    return NextResponse.json(
      { error: 'API access is not available on your current plan' },
      { status: 403 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const parsed = createKeySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Validation failed', details: parsed.error.flatten().fieldErrors },
      { status: 400 },
    );
  }

  const admin = createAdminClient();

  // Check key count limit
  const { count, error: countError } = await admin
    .from('api_keys')
    .select('id', { count: 'exact', head: true })
    .eq('account_id', account.id)
    .eq('is_active', true);

  if (countError) {
    return NextResponse.json({ error: 'Failed to check key limit' }, { status: 500 });
  }

  if ((count ?? 0) >= limits.apiKeys) {
    return NextResponse.json(
      { error: `API key limit reached (${String(limits.apiKeys)} keys on your plan)` },
      { status: 403 },
    );
  }

  // Generate key
  const rawKey = `${API_KEY_PREFIX}${crypto.randomUUID().replace(/-/g, '')}`;
  const keyPrefix = rawKey.slice(0, 12);
  const keyHash = await sha256Hex(rawKey);

  const { data: newKey, error: insertError } = await admin
    .from('api_keys')
    .insert({
      account_id: account.id,
      name: parsed.data.name,
      key_prefix: keyPrefix,
      key_hash: keyHash,
      role: parsed.data.role,
    })
    .select('id, name, key_prefix, role, created_at')
    .single();

  if (insertError || !newKey) {
    return NextResponse.json({ error: 'Failed to create API key' }, { status: 500 });
  }

  return NextResponse.json(
    {
      data: newKey,
      rawKey,
    },
    { status: 201 },
  );
}
