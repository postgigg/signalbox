import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

import { createAdminClient } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/server';
import { logAdminAction } from '@/lib/audit';

const SUPER_ADMIN_EMAILS = (process.env.SUPER_ADMIN_EMAILS ?? '')
  .split(',')
  .map((email) => email.trim().toLowerCase())
  .filter(Boolean);

async function verifyAdmin(): Promise<{ email: string } | null> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user?.email) return null;
  if (!SUPER_ADMIN_EMAILS.includes(user.email.toLowerCase())) return null;
  return { email: user.email.toLowerCase() };
}

const batchSchema = z.object({
  ids: z.array(z.string().uuid()).min(1).max(50),
  action: z.enum(['mark_read', 'mark_unread', 'archive', 'unarchive', 'delete']),
}).strict();

const ACTION_UPDATES: Record<string, Record<string, boolean>> = {
  mark_read: { is_read: true },
  mark_unread: { is_read: false },
  archive: { is_archived: true },
  unarchive: { is_archived: false },
};

export async function POST(request: NextRequest): Promise<NextResponse> {
  const admin = await verifyAdmin();
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const rawBody: unknown = await request.json().catch(() => null);
  const parsed = batchSchema.safeParse(rawBody);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Validation failed', details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const { ids, action } = parsed.data;
  const db = createAdminClient();

  if (action === 'delete') {
    const { error } = await db
      .from('inbound_emails')
      .delete()
      .in('id', ids);

    if (error) {
      return NextResponse.json({ error: 'Failed to delete emails' }, { status: 500 });
    }
  } else {
    const updates = ACTION_UPDATES[action];
    if (!updates) {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    const { error } = await db
      .from('inbound_emails')
      .update(updates)
      .in('id', ids);

    if (error) {
      return NextResponse.json({ error: 'Failed to update emails' }, { status: 500 });
    }
  }

  logAdminAction({
    admin_email: admin.email,
    action: `batch_${action}`,
    target_type: 'inbound_email',
    target_id: ids.join(','),
    details: { count: ids.length },
  });

  return NextResponse.json({ success: true, affected: ids.length });
}
