import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createAdminClient } from '@/lib/supabase/admin';
import { authenticateRequest, requireRole } from '@/lib/auth';
import { getPlanLimits } from '@/lib/plan-limits';
import type { Json } from '@/lib/supabase/types';

export const runtime = 'nodejs';

const createWidgetSchema = z.object({
  name: z.string().min(1).max(100),
  domain: z.string().max(253).optional(),
  templateId: z.string().uuid().optional(),
  industry: z.string().max(50).optional(),
}).strict();

const DEFAULT_THEME: Json = {
  primaryColor: '#6366f1',
  backgroundColor: '#ffffff',
  textColor: '#1f2937',
  borderRadius: 12,
  fontFamily: 'Inter, system-ui, sans-serif',
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

export async function GET(request: NextRequest): Promise<NextResponse> {
  const authResult = await authenticateRequest(request);
  if ('error' in authResult) return authResult.error;
  const { account } = authResult.ctx;

  const admin = createAdminClient();

  const { data: widgets, error } = await admin
    .from('widgets')
    .select('*')
    .eq('account_id', account.id)
    .eq('is_active', true)
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json(
      { error: 'Failed to fetch widgets' },
      { status: 500 },
    );
  }

  return NextResponse.json({ data: widgets });
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  const authResult = await authenticateRequest(request);
  if ('error' in authResult) return authResult.error;
  const { member, account } = authResult.ctx;

  // Only owner or admin can create widgets
  const roleError = requireRole(member, ['owner', 'admin']);
  if (roleError) return roleError;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const parsed = createWidgetSchema.safeParse(body);
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

  // Check widget count vs plan limits
  const limits = getPlanLimits(account.plan);

  const { count: widgetCount, error: countError } = await admin
    .from('widgets')
    .select('id', { count: 'exact', head: true })
    .eq('account_id', account.id)
    .eq('is_active', true);

  if (countError) {
    return NextResponse.json(
      { error: 'Failed to check widget count' },
      { status: 500 },
    );
  }

  if ((widgetCount ?? 0) >= limits.widgets) {
    return NextResponse.json(
      {
        error: 'Widget limit reached',
        details: `Your ${account.plan} plan allows ${limits.widgets} active widget(s)`,
      },
      { status: 403 },
    );
  }

  // Determine flow steps — from template or default
  let flowSteps: Json = DEFAULT_STEPS;

  if (parsed.data.templateId) {
    const { data: template } = await admin
      .from('flow_templates')
      .select('steps')
      .eq('id', parsed.data.templateId)
      .single();

    if (template) {
      flowSteps = template.steps;
    }
  } else if (parsed.data.industry && parsed.data.industry !== 'blank') {
    const { data: template } = await admin
      .from('flow_templates')
      .select('steps')
      .eq('industry', parsed.data.industry)
      .limit(1)
      .maybeSingle();

    if (template) {
      flowSteps = template.steps;
    }
  }

  // Create widget
  const { data: widget, error: insertError } = await admin
    .from('widgets')
    .insert({
      account_id: account.id,
      name: parsed.data.name,
      domain: parsed.data.domain ?? null,
      theme: DEFAULT_THEME,
      confirmation: DEFAULT_CONFIRMATION,
      submission_limit: limits.submissionsPerMonth,
    })
    .select('*')
    .single();

  if (insertError || !widget) {
    return NextResponse.json(
      { error: 'Failed to create widget' },
      { status: 500 },
    );
  }

  // Create default flow
  const { error: flowInsertError } = await admin.from('flows').insert({
    widget_id: widget.id,
    version: 1,
    is_active: true,
    steps: flowSteps,
  });

  if (flowInsertError) {
    // Roll back widget creation if flow creation fails
    await admin.from('widgets').delete().eq('id', widget.id);
    return NextResponse.json(
      { error: 'Failed to create default flow' },
      { status: 500 },
    );
  }

  return NextResponse.json({ data: widget }, { status: 201 });
}
