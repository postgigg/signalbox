import { NextRequest, NextResponse } from 'next/server';

import { authenticateRequest, requireRole } from '@/lib/auth';
import { createAdminClient } from '@/lib/supabase/admin';

export const runtime = 'nodejs';

export async function POST(request: NextRequest): Promise<NextResponse> {
  const authResult = await authenticateRequest(request);
  if ('error' in authResult) return authResult.error;
  const { member, account } = authResult.ctx;

  const roleError = requireRole(member, ['owner', 'admin']);
  if (roleError) return roleError;

  const admin = createAdminClient();
  const accountId = account.id;

  // Fetch all account data in parallel
  const [
    accountResult,
    membersResult,
    widgetsResult,
    submissionsResult,
    flowsResult,
    routingRulesResult,
    webhooksResult,
    apiKeysResult,
  ] = await Promise.all([
    admin.from('accounts').select('id, name, slug, plan, subscription_status, timezone, created_at').eq('id', accountId).single(),
    admin.from('members').select('id, invited_email, role, created_at').eq('account_id', accountId),
    admin.from('widgets').select('id, name, domain, is_active, created_at').eq('account_id', accountId),
    admin.from('submissions').select('id, visitor_name, visitor_email, lead_score, lead_tier, status, answers, created_at').eq('account_id', accountId).order('created_at', { ascending: false }).limit(10000),
    admin.from('flows').select('id, widget_id, version, is_active, steps, created_at').eq('widget_id', (await admin.from('widgets').select('id').eq('account_id', accountId)).data?.map((w: { id: string }) => w.id)[0] ?? ''),
    admin.from('routing_rules').select('id, name, routing_strategy, match_tier, priority, is_active, created_at').eq('account_id', accountId),
    admin.from('webhooks').select('id, url, events, is_active, created_at').eq('account_id', accountId),
    admin.from('api_keys').select('id, name, role, is_active, created_at, expires_at').eq('account_id', accountId),
  ]);

  const exportData = {
    exportedAt: new Date().toISOString(),
    account: accountResult.data,
    members: membersResult.data ?? [],
    widgets: widgetsResult.data ?? [],
    submissions: submissionsResult.data ?? [],
    flows: flowsResult.data ?? [],
    routingRules: routingRulesResult.data ?? [],
    webhooks: webhooksResult.data ?? [],
    apiKeys: (apiKeysResult.data ?? []).map((k: { id: string; name: string | null; role: string; is_active: boolean; created_at: string; expires_at: string | null }) => ({
      id: k.id,
      name: k.name,
      role: k.role,
      isActive: k.is_active,
      createdAt: k.created_at,
      expiresAt: k.expires_at,
    })),
  };

  const json = JSON.stringify(exportData, null, 2);

  return new NextResponse(json, {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Content-Disposition': 'attachment; filename="hawkleads-data-export.json"',
    },
  });
}
