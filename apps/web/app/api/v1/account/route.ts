import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createAdminClient } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/server';
import { authenticateRequest, requireRole } from '@/lib/auth';
import { TRIAL_DURATION_DAYS } from '@/lib/constants';
import type { Json } from '@/lib/supabase/types';

export const runtime = 'nodejs';

const MAX_ACCOUNTS_PER_EMAIL = 3;

const createAccountSchema = z.object({
  name: z.string().min(1).max(100),
  slug: z
    .string()
    .min(3)
    .max(50)
    .regex(
      /^[a-z0-9][a-z0-9-]*[a-z0-9]$/,
      'Slug must be lowercase alphanumeric with hyphens, starting and ending with a letter or number',
    ),
  timezone: z.string().default('UTC'),
  notificationEmail: z.string().email().optional(),
}).strict();

const patchAccountSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  timezone: z.string().max(50).optional(),
  notification_email: z.string().email().nullable().optional(),
  hot_lead_threshold: z.number().int().min(1).max(100).optional(),
  warm_lead_threshold: z.number().int().min(0).max(100).optional(),
}).strict();

const DEFAULT_THEME: Json = {
  primaryColor: '#0F172A',
  accentColor: '#3B82F6',
  backgroundColor: '#FFFFFF',
  textColor: '#1E293B',
  borderRadius: 12,
  fontFamily: 'system',
};

const DEFAULT_CONFIRMATION: Json = {
  title: 'Thank you!',
  message: 'We received your submission and will be in touch soon.',
  showScore: false,
};

const DEFAULT_STEPS: Json = [
  {
    id: 'step-1',
    question: 'What are you looking for?',
    options: [
      { id: 'opt-1a', label: 'Product information', scoreWeight: 5 },
      { id: 'opt-1b', label: 'Pricing details', scoreWeight: 10 },
      { id: 'opt-1c', label: 'Technical support', scoreWeight: 3 },
    ],
  },
  {
    id: 'step-2',
    question: 'What is your timeline?',
    options: [
      { id: 'opt-2a', label: 'Immediately', scoreWeight: 15 },
      { id: 'opt-2b', label: 'Within a month', scoreWeight: 10 },
      { id: 'opt-2c', label: 'Just exploring', scoreWeight: 2 },
    ],
  },
];

export async function POST(request: NextRequest): Promise<NextResponse> {
  // Authenticate user (but they may not have an account yet)
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json(
      { error: 'Authentication required' },
      { status: 401 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const parsed = createAccountSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: 'Validation failed',
        details: parsed.error.flatten().fieldErrors,
      },
      { status: 400 },
    );
  }

  const admin = createAdminClient();

  // Check max accounts per user
  const { count: existingCount, error: countError } = await admin
    .from('members')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', user.id);

  if (countError) {
    return NextResponse.json(
      { error: 'Failed to check existing accounts' },
      { status: 500 },
    );
  }

  if ((existingCount ?? 0) >= MAX_ACCOUNTS_PER_EMAIL) {
    return NextResponse.json(
      {
        error: 'Account limit reached',
        details: `Maximum of ${MAX_ACCOUNTS_PER_EMAIL} accounts per user`,
      },
      { status: 403 },
    );
  }

  // Check slug uniqueness
  const { data: slugExists } = await admin
    .from('accounts')
    .select('id')
    .eq('slug', parsed.data.slug)
    .maybeSingle();

  if (slugExists) {
    return NextResponse.json(
      { error: 'Slug is already taken' },
      { status: 409 },
    );
  }

  // Calculate trial end date
  const trialEndsAt = new Date();
  trialEndsAt.setDate(trialEndsAt.getDate() + TRIAL_DURATION_DAYS);

  // Create account
  const { data: account, error: accountError } = await admin
    .from('accounts')
    .insert({
      name: parsed.data.name,
      slug: parsed.data.slug,
      owner_id: user.id,
      plan: 'trial',
      subscription_status: 'trialing',
      trial_ends_at: trialEndsAt.toISOString(),
      timezone: parsed.data.timezone,
      notification_email: parsed.data.notificationEmail ?? user.email ?? null,
    })
    .select('*')
    .single();

  if (accountError || !account) {
    return NextResponse.json(
      { error: 'Failed to create account' },
      { status: 500 },
    );
  }

  // Create owner membership
  const { error: memberError } = await admin.from('members').insert({
    account_id: account.id,
    user_id: user.id,
    role: 'owner',
    accepted_at: new Date().toISOString(),
  });

  if (memberError) {
    // Roll back account creation
    await admin.from('accounts').delete().eq('id', account.id);
    return NextResponse.json(
      { error: 'Failed to create membership' },
      { status: 500 },
    );
  }

  // Create default widget
  const { data: widget, error: widgetError } = await admin
    .from('widgets')
    .insert({
      account_id: account.id,
      name: `${parsed.data.name} Widget`,
      theme: DEFAULT_THEME,
      confirmation: DEFAULT_CONFIRMATION,
      submission_limit: 100, // trial limit
    })
    .select('*')
    .single();

  if (widgetError || !widget) {
    // Roll back
    await admin.from('members').delete().eq('account_id', account.id);
    await admin.from('accounts').delete().eq('id', account.id);
    return NextResponse.json(
      { error: 'Failed to create default widget' },
      { status: 500 },
    );
  }

  // Create default flow for the widget
  const { error: flowError } = await admin.from('flows').insert({
    widget_id: widget.id,
    version: 1,
    is_active: true,
    steps: DEFAULT_STEPS,
  });

  if (flowError) {
    // Roll back
    await admin.from('widgets').delete().eq('id', widget.id);
    await admin.from('members').delete().eq('account_id', account.id);
    await admin.from('accounts').delete().eq('id', account.id);
    return NextResponse.json(
      { error: 'Failed to create default flow' },
      { status: 500 },
    );
  }

  return NextResponse.json(
    {
      data: {
        account,
        widget,
      },
    },
    { status: 201 },
  );
}

export async function PATCH(request: NextRequest): Promise<NextResponse> {
  const authResult = await authenticateRequest(request);
  if ('error' in authResult) return authResult.error;
  const { member, account } = authResult.ctx;

  // Only owner or admin can update account
  const roleError = requireRole(member, ['owner', 'admin']);
  if (roleError) return roleError;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const parsed = patchAccountSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: 'Validation failed',
        details: parsed.error.flatten().fieldErrors,
      },
      { status: 400 },
    );
  }

  // Validate threshold ordering
  const hotThreshold =
    parsed.data.hot_lead_threshold ?? account.hot_lead_threshold;
  const warmThreshold =
    parsed.data.warm_lead_threshold ?? account.warm_lead_threshold;

  if (warmThreshold >= hotThreshold) {
    return NextResponse.json(
      {
        error: 'Validation failed',
        details: 'warm_lead_threshold must be less than hot_lead_threshold',
      },
      { status: 400 },
    );
  }

  const admin = createAdminClient();

  const updates: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };

  if (parsed.data.name !== undefined) updates['name'] = parsed.data.name;
  if (parsed.data.timezone !== undefined) updates['timezone'] = parsed.data.timezone;
  if (parsed.data.notification_email !== undefined) updates['notification_email'] = parsed.data.notification_email;
  if (parsed.data.hot_lead_threshold !== undefined) updates['hot_lead_threshold'] = parsed.data.hot_lead_threshold;
  if (parsed.data.warm_lead_threshold !== undefined) updates['warm_lead_threshold'] = parsed.data.warm_lead_threshold;

  const { data: updated, error: updateError } = await admin
    .from('accounts')
    .update(updates)
    .eq('id', account.id)
    .select('*')
    .single();

  if (updateError || !updated) {
    return NextResponse.json(
      { error: 'Failed to update account' },
      { status: 500 },
    );
  }

  return NextResponse.json({ data: updated });
}
