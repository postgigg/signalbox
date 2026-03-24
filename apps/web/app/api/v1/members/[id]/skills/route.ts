import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

const SKILL_TAG_PATTERN = /^[a-zA-Z0-9-]+$/;
const MAX_SKILLS = 20;
const MAX_SKILL_LENGTH = 50;

const putSchema = z.object({
  skills: z
    .array(
      z.string().min(1).max(MAX_SKILL_LENGTH).regex(SKILL_TAG_PATTERN, {
        message: 'Skill tags must be alphanumeric with hyphens only',
      }),
    )
    .max(MAX_SKILLS),
});

interface RouteParams {
  params: Promise<{ id: string }>;
}

async function resolveRequester(
  supabase: Awaited<ReturnType<typeof createClient>>,
  admin: ReturnType<typeof createAdminClient>,
): Promise<{ member: { id: string; account_id: string; role: string } } | { error: NextResponse }> {
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return { error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) };
  }

  const { data: member } = await admin
    .from('members')
    .select('id, account_id, role')
    .eq('user_id', user.id)
    .limit(1)
    .single();

  if (!member) {
    return { error: NextResponse.json({ error: 'Not a member' }, { status: 403 }) };
  }

  return { member };
}

export async function GET(
  _request: NextRequest,
  { params }: RouteParams,
): Promise<NextResponse> {
  const { id } = await params;
  const supabase = await createClient();
  const admin = createAdminClient();

  const result = await resolveRequester(supabase, admin);
  if ('error' in result) return result.error;
  const { member: requester } = result;

  // Verify target member belongs to same account
  const { data: target } = await admin
    .from('members')
    .select('id, account_id')
    .eq('id', id)
    .eq('account_id', requester.account_id)
    .single();

  if (!target) {
    return NextResponse.json({ error: 'Member not found' }, { status: 404 });
  }

  const { data: rows, error: queryError } = await admin
    .from('member_skills')
    .select('skill_tag')
    .eq('member_id', id)
    .eq('account_id', requester.account_id);

  if (queryError) {
    return NextResponse.json({ error: 'Failed to fetch skills' }, { status: 500 });
  }

  const skills = (rows as Array<{ skill_tag: string }>).map((r: { skill_tag: string }) => r.skill_tag);
  return NextResponse.json({ skills });
}

export async function PUT(
  request: NextRequest,
  { params }: RouteParams,
): Promise<NextResponse> {
  const { id } = await params;
  const supabase = await createClient();
  const admin = createAdminClient();

  const result = await resolveRequester(supabase, admin);
  if ('error' in result) return result.error;
  const { member: requester } = result;

  // Only owner/admin can modify skills
  if (requester.role !== 'owner' && requester.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  // Verify target member belongs to same account
  const { data: target } = await admin
    .from('members')
    .select('id, account_id')
    .eq('id', id)
    .eq('account_id', requester.account_id)
    .single();

  if (!target) {
    return NextResponse.json({ error: 'Member not found' }, { status: 404 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const parsed = putSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Validation failed', details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  // Deduplicate skills
  const uniqueSkills = [...new Set(parsed.data.skills)];

  // Delete existing then insert new (within admin client)
  const { error: deleteError } = await admin
    .from('member_skills')
    .delete()
    .eq('member_id', id)
    .eq('account_id', requester.account_id);

  if (deleteError) {
    return NextResponse.json({ error: 'Failed to update skills' }, { status: 500 });
  }

  if (uniqueSkills.length > 0) {
    const rows = uniqueSkills.map((tag) => ({
      member_id: id,
      account_id: requester.account_id,
      skill_tag: tag,
    }));

    const { error: insertError } = await admin
      .from('member_skills')
      .insert(rows);

    if (insertError) {
      return NextResponse.json({ error: 'Failed to insert skills' }, { status: 500 });
    }
  }

  return NextResponse.json({ skills: uniqueSkills });
}
