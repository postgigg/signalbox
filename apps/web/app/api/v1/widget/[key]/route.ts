import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { configLimit, checkRateLimit } from '@/lib/rate-limit';
import { corsJson, corsOptions } from '@/lib/cors';

export const runtime = 'nodejs';

export async function OPTIONS(): Promise<NextResponse> {
  return corsOptions();
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ key: string }> },
): Promise<NextResponse> {
  const { key } = await params;

  // Rate limit by widget key
  const rl = await checkRateLimit(configLimit(), key);
  if (!rl.success) {
    return corsJson(
      { error: 'Rate limit exceeded' },
      { status: 429 },
    );
  }

  const admin = createAdminClient();

  // Fetch widget with its active flow
  const { data: widget, error: widgetError } = await admin
    .from('widgets')
    .select('*')
    .eq('widget_key', key)
    .single();

  if (widgetError || !widget) {
    return corsJson({ error: 'Widget not found' }, { status: 404 });
  }

  if (!widget.is_active) {
    return corsJson({ error: 'Widget is no longer active' }, { status: 410 });
  }

  // Check account status
  const { data: account, error: accountError } = await admin
    .from('accounts')
    .select('is_suspended, subscription_status, trial_ends_at, plan')
    .eq('id', widget.account_id)
    .single();

  if (accountError || !account) {
    return corsJson({ error: 'Account not found' }, { status: 404 });
  }

  if (account.is_suspended) {
    return corsJson({ error: 'Account suspended' }, { status: 402 });
  }

  const isCanceled = account.subscription_status === 'canceled';
  const isUnpaid = account.subscription_status === 'unpaid';
  const isTrialExpired =
    account.subscription_status === 'trialing' &&
    account.trial_ends_at !== null &&
    new Date(account.trial_ends_at) < new Date();

  if (isCanceled || isUnpaid || isTrialExpired) {
    return corsJson(
      { error: 'Subscription inactive' },
      { status: 402 },
    );
  }

  // Fetch active flow
  const { data: flow } = await admin
    .from('flows')
    .select('version, steps')
    .eq('widget_id', widget.id)
    .eq('is_active', true)
    .single();

  // Map flow steps to widget format (score -> scoreWeight)
  const rawSteps = Array.isArray(flow?.steps) ? flow.steps : [];
  const mappedSteps = (rawSteps as Array<Record<string, unknown>>).map((step, index) => ({
    id: step['id'] as string,
    order: index,
    question: step['question'] as string,
    description: step['description'] as string | undefined,
    type: 'single_select' as const,
    options: Array.isArray(step['options'])
      ? (step['options'] as Array<Record<string, unknown>>).map((opt) => ({
          id: opt['id'] as string,
          label: opt['label'] as string,
          icon: opt['icon'] as string | undefined,
          scoreWeight: (opt['scoreWeight'] ?? opt['score'] ?? 0) as number,
        }))
      : [],
  }));

  // Map confirmation tiers
  const rawConf = (widget.confirmation ?? {}) as Record<string, unknown>;
  const mapTier = (tier: unknown): { headline: string; body: string; ctaText: string | null; ctaUrl: string | null } => {
    const t = (tier ?? {}) as Record<string, unknown>;
    return {
      headline: (t['headline'] as string) ?? 'Thank you!',
      body: (t['body'] as string) ?? '',
      ctaText: (t['ctaText'] as string) ?? null,
      ctaUrl: (t['ctaUrl'] as string) ?? null,
    };
  };

  // Fetch running A/B test for this widget (if any)
  const { data: abTest } = await admin
    .from('ab_tests')
    .select('id, target_step_id, traffic_split, variant_b_question, variant_b_options')
    .eq('widget_id', widget.id)
    .eq('status', 'running')
    .limit(1)
    .maybeSingle();

  const configPayload: Record<string, unknown> = {
    widgetKey: widget.widget_key,
    theme: widget.theme,
    steps: mappedSteps,
    flowVersion: flow?.version ?? 0,
    confirmation: {
      hot: mapTier(rawConf['hot']),
      warm: mapTier(rawConf['warm']),
      cold: mapTier(rawConf['cold']),
    },
    contactShowPhone: widget.contact_show_phone ?? false,
    contactPhoneRequired: widget.contact_phone_required ?? false,
    contactShowMessage: widget.contact_show_message ?? false,
    contactMessageRequired: widget.contact_message_required ?? false,
    contactMessagePlaceholder: widget.contact_message_placeholder ?? 'Tell us more...',
    contactSubmitText: widget.contact_submit_text ?? 'Submit',
    socialProofText: widget.social_proof_text ?? '',
    socialProofMin: widget.social_proof_min ?? 0,
    submissionCount: widget.submission_count ?? 0,
  };

  // Include A/B test data if there's a running test
  if (abTest) {
    configPayload.abTest = {
      testId: abTest.id,
      targetStepId: abTest.target_step_id,
      trafficSplit: abTest.traffic_split,
      variantB: {
        question: abTest.variant_b_question,
        options: abTest.variant_b_options,
      },
    };
  }

  // Include attention grabber config for Pro+ accounts
  const isPro = account.plan === 'pro' || account.plan === 'agency';
  if (isPro) {
    const themeObj = (widget.theme ?? {}) as Record<string, unknown>;
    const grabberEnabled = themeObj['attentionGrabberEnabled'] as boolean | undefined;

    // Only include if explicitly enabled in widget settings
    if (grabberEnabled === true) {
      configPayload.attentionGrabber = {
        enabled: true,
        teaserText: (themeObj['attentionTeaserText'] as string) ?? 'See how you qualify in 30 seconds',
        teaserDelayMs: (themeObj['attentionTeaserDelayMs'] as number) ?? 3000,
        pulseDelayMs: (themeObj['attentionPulseDelayMs'] as number) ?? 8000,
        scrollNudgeText: (themeObj['attentionScrollNudgeText'] as string) ?? 'Quick question before you go?',
        scrollThreshold: (themeObj['attentionScrollThreshold'] as number) ?? 40,
        exitIntentText: (themeObj['attentionExitIntentText'] as string) ?? 'Wait! Get a personalized recommendation',
      };
    }
  }

  const response = corsJson(configPayload);

  response.headers.set('Cache-Control', 'public, max-age=60');

  return response;
}
