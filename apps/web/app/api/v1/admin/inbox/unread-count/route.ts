import { NextResponse } from 'next/server';

import { createAdminClient } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/server';

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

export async function GET(): Promise<NextResponse> {
  const admin = await verifyAdmin();
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const db = createAdminClient();
  const { count, error } = await db
    .from('inbound_emails')
    .select('id', { count: 'exact', head: true })
    .eq('is_read', false)
    .eq('is_archived', false);

  if (error) {
    return NextResponse.json({ error: 'Failed to fetch unread count' }, { status: 500 });
  }

  return NextResponse.json({ count: count ?? 0 });
}
