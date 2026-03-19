import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createAdminClient } from '@/lib/supabase/admin';
import { authenticateRequest, requireRole } from '@/lib/auth';
import { getPlanLimits } from '@/lib/plan-limits';

export const runtime = 'nodejs';

const createClientSchema = z.object({
  name: z.string().trim().min(1).max(200),
  slug: z.string().trim().min(1).max(100).regex(/^[a-z0-9-]+$/),
  contact_name: z.string().trim().max(200).optional(),
  contact_email: z.string().email().max(320).optional(),
  notes: z.string().max(2000).optional(),
}).strict();

export async function GET(
  request: NextRequest,
): Promise<NextResponse> {
  const authResult = await authenticateRequest(request);
  if ('error' in authResult) return authResult.error;
  const { account } = authResult.ctx;

  const limits = getPlanLimits(account.plan);
  if (!limits.prioritySupport && account.plan !== 'agency') {
    return NextResponse.json(
      { error: 'Multi-client dashboard is only available on the Agency plan' },
      { status: 403 },
    );
  }

  const admin = createAdminClient();

  const { data: clients, error } = await admin
    .from('client_accounts')
    .select('*')
    .eq('parent_account_id', account.id)
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: 'Failed to fetch clients' }, { status: 500 });
  }

  // Get widget and lead counts per client
  const clientIds = clients?.map((c: { id: string }) => c.id) ?? [];
  const widgetCounts: Record<string, number> = {};
  const leadCounts: Record<string, number> = {};

  if (clientIds.length > 0) {
    const { data: widgets } = await admin
      .from('widgets')
      .select('id, client_account_id')
      .eq('account_id', account.id)
      .in('client_account_id', clientIds);

    if (widgets) {
      for (const w of widgets) {
        const clientAccountId = w.client_account_id as string | null;
        if (clientAccountId) {
          widgetCounts[clientAccountId] = (widgetCounts[clientAccountId] ?? 0) + 1;
        }
      }
    }

    const widgetIds = widgets?.map((w: { id: string }) => w.id) ?? [];
    if (widgetIds.length > 0) {
      const { data: submissions } = await admin
        .from('submissions')
        .select('widget_id')
        .eq('account_id', account.id)
        .in('widget_id', widgetIds);

      if (submissions && widgets) {
        const widgetToClient: Record<string, string> = {};
        for (const w of widgets) {
          const clientAccountId = w.client_account_id as string | null;
          if (clientAccountId) {
            widgetToClient[w.id] = clientAccountId;
          }
        }
        for (const s of submissions) {
          const clientId = widgetToClient[s.widget_id];
          if (clientId) {
            leadCounts[clientId] = (leadCounts[clientId] ?? 0) + 1;
          }
        }
      }
    }
  }

  const enriched = (clients ?? []).map((c: { id: string; [key: string]: unknown }) => ({
    ...c,
    widget_count: widgetCounts[c.id] ?? 0,
    lead_count: leadCounts[c.id] ?? 0,
  }));

  return NextResponse.json({ data: enriched });
}

export async function POST(
  request: NextRequest,
): Promise<NextResponse> {
  const authResult = await authenticateRequest(request);
  if ('error' in authResult) return authResult.error;
  const { member, account } = authResult.ctx;

  const roleError = requireRole(member, ['owner', 'admin']);
  if (roleError) return roleError;

  if (account.plan !== 'agency') {
    return NextResponse.json(
      { error: 'Multi-client dashboard is only available on the Agency plan' },
      { status: 403 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const parsed = createClientSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Validation failed', details: parsed.error.flatten().fieldErrors },
      { status: 400 },
    );
  }

  const admin = createAdminClient();

  const { data: newClient, error: insertError } = await admin
    .from('client_accounts')
    .insert({
      parent_account_id: account.id,
      name: parsed.data.name,
      slug: parsed.data.slug,
      contact_name: parsed.data.contact_name ?? null,
      contact_email: parsed.data.contact_email ?? null,
      notes: parsed.data.notes ?? null,
    })
    .select('*')
    .single();

  if (insertError) {
    if (insertError.code === '23505') {
      return NextResponse.json(
        { error: 'A client with this slug already exists' },
        { status: 409 },
      );
    }
    return NextResponse.json({ error: 'Failed to create client' }, { status: 500 });
  }

  return NextResponse.json({ data: newClient }, { status: 201 });
}
