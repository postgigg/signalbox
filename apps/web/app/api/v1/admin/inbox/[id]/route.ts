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
  if (SUPER_ADMIN_EMAILS.length > 0 && !SUPER_ADMIN_EMAILS.includes(user.email.toLowerCase())) return null;
  return { email: user.email.toLowerCase() };
}

const updateEmailSchema = z.object({
  is_read: z.boolean().optional(),
  is_archived: z.boolean().optional(),
  is_starred: z.boolean().optional(),
}).strict();

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(
  _request: NextRequest,
  context: RouteParams,
): Promise<NextResponse> {
  const admin = await verifyAdmin();
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await context.params;
  const idParsed = z.string().uuid().safeParse(id);
  if (!idParsed.success) {
    return NextResponse.json({ error: 'Invalid email ID' }, { status: 400 });
  }

  const db = createAdminClient();
  const { data: email, error } = await db
    .from('inbound_emails')
    .select('*')
    .eq('id', idParsed.data)
    .single();

  if (error || !email) {
    return NextResponse.json({ error: 'Email not found' }, { status: 404 });
  }

  if (!email.is_read) {
    const { error: updateError } = await db
      .from('inbound_emails')
      .update({ is_read: true })
      .eq('id', idParsed.data);

    if (!updateError) {
      email.is_read = true;
    }
  }

  return NextResponse.json({ data: email });
}

export async function PATCH(
  request: NextRequest,
  context: RouteParams,
): Promise<NextResponse> {
  const admin = await verifyAdmin();
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await context.params;
  const idParsed = z.string().uuid().safeParse(id);
  if (!idParsed.success) {
    return NextResponse.json({ error: 'Invalid email ID' }, { status: 400 });
  }

  const rawBody: unknown = await request.json().catch(() => null);
  const parsed = updateEmailSchema.safeParse(rawBody);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Validation failed', details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const db = createAdminClient();
  const updates: Record<string, boolean> = {};
  if (parsed.data.is_read !== undefined) updates.is_read = parsed.data.is_read;
  if (parsed.data.is_archived !== undefined) updates.is_archived = parsed.data.is_archived;
  if (parsed.data.is_starred !== undefined) updates.is_starred = parsed.data.is_starred;

  const { data: email, error } = await db
    .from('inbound_emails')
    .update(updates)
    .eq('id', idParsed.data)
    .select()
    .single();

  if (error || !email) {
    return NextResponse.json({ error: 'Failed to update email' }, { status: 500 });
  }

  logAdminAction({
    admin_email: admin.email,
    action: 'update_inbox_email',
    target_type: 'inbound_email',
    target_id: idParsed.data,
    details: JSON.parse(JSON.stringify(parsed.data)) as Record<string, string>,
  });

  return NextResponse.json({ data: email });
}

export async function DELETE(
  _request: NextRequest,
  context: RouteParams,
): Promise<NextResponse> {
  const admin = await verifyAdmin();
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await context.params;
  const idParsed = z.string().uuid().safeParse(id);
  if (!idParsed.success) {
    return NextResponse.json({ error: 'Invalid email ID' }, { status: 400 });
  }

  const db = createAdminClient();
  const { error } = await db
    .from('inbound_emails')
    .delete()
    .eq('id', idParsed.data);

  if (error) {
    return NextResponse.json({ error: 'Failed to delete email' }, { status: 500 });
  }

  logAdminAction({
    admin_email: admin.email,
    action: 'delete_inbox_email',
    target_type: 'inbound_email',
    target_id: idParsed.data,
  });

  return NextResponse.json({ success: true }, { status: 200 });
}
