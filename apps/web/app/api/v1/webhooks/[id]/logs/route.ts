import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

const querySchema = z.object({
  cursor: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(50).default(50),
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  const { id } = await params;

  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: member } = await supabase
    .from('members')
    .select('account_id')
    .eq('user_id', user.id)
    .limit(1)
    .single();

  if (!member) {
    return NextResponse.json({ error: 'Account not found' }, { status: 404 });
  }

  // Parse query params
  const searchParams = Object.fromEntries(request.nextUrl.searchParams.entries());
  const parsed = querySchema.safeParse(searchParams);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid query parameters' }, { status: 400 });
  }

  const { cursor, limit } = parsed.data;
  const admin = createAdminClient();

  // Verify endpoint belongs to account
  const { data: endpoint } = await admin
    .from('webhook_endpoints')
    .select('id')
    .eq('id', id)
    .eq('account_id', member.account_id)
    .single();

  if (!endpoint) {
    return NextResponse.json({ error: 'Webhook endpoint not found' }, { status: 404 });
  }

  let query = admin
    .from('webhook_event_log')
    .select('id, event, response_status, duration_ms, success, error_message, created_at')
    .eq('webhook_endpoint_id', id)
    .order('created_at', { ascending: false })
    .limit(limit + 1); // Fetch one extra to determine if there's a next page

  if (cursor) {
    query = query.lt('created_at', cursor);
  }

  const { data: logs, error: logsError } = await query;

  if (logsError) {
    return NextResponse.json({ error: 'Failed to fetch logs' }, { status: 500 });
  }

  const hasMore = (logs?.length ?? 0) > limit;
  const items = logs?.slice(0, limit) ?? [];
  const nextCursor = hasMore && items.length > 0
    ? items[items.length - 1]?.created_at ?? null
    : null;

  return NextResponse.json({
    data: items,
    nextCursor,
    hasMore,
  });
}
