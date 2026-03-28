import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

const MAX_TERRITORIES = 50;
const COUNTRY_CODE_PATTERN = /^[A-Z]{2}$/;

const territoryItemSchema = z.object({
  countryCode: z.string().regex(COUNTRY_CODE_PATTERN, {
    message: 'Country code must be a 2-letter ISO code',
  }),
  regionName: z.string().max(200).nullish(),
});

const putSchema = z.object({
  territories: z.array(territoryItemSchema).max(MAX_TERRITORIES),
});

interface TerritoryResponse {
  countryCode: string;
  regionName: string | null;
}

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

function formatTerritories(
  rows: Array<{ country_code: string; region_name: string | null }>,
): TerritoryResponse[] {
  return rows.map((r) => ({
    countryCode: r.country_code,
    regionName: r.region_name,
  }));
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
    .from('member_territories')
    .select('country_code, region_name')
    .eq('member_id', id)
    .eq('account_id', requester.account_id);

  if (queryError) {
    return NextResponse.json({ error: 'Failed to fetch territories' }, { status: 500 });
  }

  return NextResponse.json({ territories: formatTerritories(rows) });
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

  if (requester.role !== 'owner' && requester.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

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

  const { error: deleteError } = await admin
    .from('member_territories')
    .delete()
    .eq('member_id', id)
    .eq('account_id', requester.account_id);

  if (deleteError) {
    return NextResponse.json({ error: 'Failed to update territories' }, { status: 500 });
  }

  const { territories } = parsed.data;

  if (territories.length > 0) {
    const rows = territories.map((t) => ({
      member_id: id,
      account_id: requester.account_id,
      country_code: t.countryCode,
      region_name: t.regionName ?? null,
    }));

    const { error: insertError } = await admin
      .from('member_territories')
      .insert(rows);

    if (insertError) {
      return NextResponse.json({ error: 'Failed to insert territories' }, { status: 500 });
    }
  }

  const responseItems: TerritoryResponse[] = territories.map((t) => ({
    countryCode: t.countryCode,
    regionName: t.regionName ?? null,
  }));

  return NextResponse.json({ territories: responseItems });
}
