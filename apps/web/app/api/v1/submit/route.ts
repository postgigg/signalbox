import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createAdminClient } from '@/lib/supabase/admin';
import { submitLimit, globalLimit, checkRateLimit } from '@/lib/rate-limit';
import { corsJson, corsOptions } from '@/lib/cors';
import { getClientIp, getCountry } from '@/lib/ip';
import { parseDeviceType } from '@/lib/device';
import {
  calculateLeadScore,
  calculateBehavioralScore,
  calculateIntentScore,
  calculateCompositeScore,
  denormalizeAnswers,
  parseFlowSteps,
} from '@/lib/scoring';
import { sendNewLeadNotification, sendLeadAssignedNotification } from '@/lib/email';
import { fireWebhooks } from '@/lib/webhooks';
import { sendSlackNotification } from '@/lib/slack';
import { stripHtml } from '@/lib/sanitize';
import { evaluateRoutingRules } from '@/lib/lead-routing';
import { getPlanLimits } from '@/lib/plan-limits';
import { enrollInDripSequence } from '@/lib/drip';
import { DEFAULT_SCORING_CONFIG } from '@/lib/constants';

import type { RoutingContext } from '@/lib/lead-routing';
import type { Plan } from '@/lib/supabase/types';
import type { ScoringConfig } from '@/lib/constants';
import type { BehavioralSessionData } from '@/lib/scoring';

export const runtime = 'nodejs';

const answerSchema = z.object({
  stepId: z.string().min(1),
  optionId: z.string().min(1),
}).strict();

const behavioralDataSchema = z.object({
  pagesViewed: z.number().int().min(0).max(1000),
  pageUrls: z.array(z.string().max(2000)).max(100),
  timeOnSiteSeconds: z.number().int().min(0).max(86400),
  maxScrollDepth: z.number().int().min(0).max(100),
  widgetOpens: z.number().int().min(0).max(100),
  sessionNumber: z.number().int().min(1).max(1000),
  pricingPageViews: z.number().int().min(0).max(100),
  highIntentPageViews: z.number().int().min(0).max(100),
}).strict();

const submitSchema = z.object({
  widgetKey: z.string().min(1),
  answers: z.array(answerSchema).min(1),
  visitorName: z.string().min(1).max(200).transform(stripHtml),
  visitorEmail: z.string().email().max(320),
  visitorPhone: z.string().max(50).optional(),
  visitorMessage: z.string().max(2000).optional().transform((v) => v ? stripHtml(v) : v),
  sourceUrl: z.string().url().max(2000).optional(),
  referrer: z.string().max(2000).optional(),
  utmSource: z.string().max(200).optional(),
  utmMedium: z.string().max(200).optional(),
  utmCampaign: z.string().max(200).optional(),
  loadedAt: z.number(),
  honeypot: z.string().optional(),
  challengeToken: z.string().min(1),
  abTestId: z.string().uuid().optional(),
  abVariant: z.enum(['a', 'b']).optional(),
  behavioralData: behavioralDataSchema.optional(),
  visitorFingerprint: z.string().max(64).optional(),
}).strict();

type SubmitPayload = z.infer<typeof submitSchema>;

export async function OPTIONS(): Promise<NextResponse> {
  return corsOptions();
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  const ip = getClientIp(request);

  // Parse body
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return corsJson({ error: 'Invalid JSON body' }, { status: 400 });
  }

  // Validate with Zod
  const parsed = submitSchema.safeParse(body);
  if (!parsed.success) {
    return corsJson(
      {
        error: 'Validation failed',
        details: parsed.error.flatten().fieldErrors,
      },
      { status: 400 },
    );
  }

  const payload: SubmitPayload = parsed.data;

  // 1. Honeypot check — if filled, return fake success
  if (payload.honeypot && payload.honeypot.length > 0) {
    return corsJson(
      { message: 'Submission received', tier: 'warm' },
      { status: 201 },
    );
  }

  // 2. Timing check — reject submissions faster than 2 seconds
  const elapsed = Date.now() - payload.loadedAt;
  if (elapsed < 2000) {
    return corsJson(
      { error: 'Submission too fast' },
      { status: 422 },
    );
  }

  // 3. JS challenge token validation (simple hash check)
  const expectedPrefix = `sb_${payload.widgetKey.slice(0, 8)}`;
  if (!payload.challengeToken.startsWith(expectedPrefix)) {
    return corsJson(
      { error: 'Invalid challenge token' },
      { status: 422 },
    );
  }

  // 4. Rate limit per IP + widget
  const widgetLimitResult = await checkRateLimit(
    submitLimit(),
    `${ip}:${payload.widgetKey}`,
  );
  if (!widgetLimitResult.success) {
    return corsJson({ error: 'Rate limit exceeded' }, { status: 429 });
  }

  // 5. Rate limit per IP global
  const globalLimitResult = await checkRateLimit(globalLimit(), ip);
  if (!globalLimitResult.success) {
    return corsJson({ error: 'Rate limit exceeded' }, { status: 429 });
  }

  const admin = createAdminClient();

  // 6. Fetch widget
  const { data: widget, error: widgetError } = await admin
    .from('widgets')
    .select('*')
    .eq('widget_key', payload.widgetKey)
    .single();

  if (widgetError || !widget) {
    return corsJson({ error: 'Widget not found' }, { status: 404 });
  }

  if (!widget.is_active) {
    return corsJson({ error: 'Widget is no longer active' }, { status: 410 });
  }

  // 7. Check account status
  const { data: account, error: accountError } = await admin
    .from('accounts')
    .select('*')
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
    return corsJson({ error: 'Subscription inactive' }, { status: 402 });
  }

  // 8. Check submission limit (atomic increment handled after insert below)

  // 9. Fetch active flow
  const { data: flow, error: flowError } = await admin
    .from('flows')
    .select('*')
    .eq('widget_id', widget.id)
    .eq('is_active', true)
    .single();

  if (flowError || !flow) {
    return corsJson(
      { error: 'No active flow for this widget' },
      { status: 422 },
    );
  }

  // 10. Parse and validate answers against flow steps
  let steps;
  try {
    steps = parseFlowSteps(flow.steps);
  } catch {
    return corsJson(
      { error: 'Flow configuration error' },
      { status: 500 },
    );
  }

  // Validate that every answer matches a real step + option
  for (const answer of payload.answers) {
    const step = steps.find((s) => s.id === answer.stepId);
    if (!step) {
      return corsJson(
        {
          error: 'Invalid answer',
          details: `Step ${answer.stepId} does not exist in the flow`,
        },
        { status: 400 },
      );
    }
    const option = step.options.find((o) => o.id === answer.optionId);
    if (!option) {
      return corsJson(
        {
          error: 'Invalid answer',
          details: `Option ${answer.optionId} does not exist in step ${answer.stepId}`,
        },
        { status: 400 },
      );
    }
  }

  // 11. Duplicate check — same email + widget within 5 minutes
  const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
  const { data: existingSubmission } = await admin
    .from('submissions')
    .select('id')
    .eq('widget_id', widget.id)
    .eq('visitor_email', payload.visitorEmail)
    .gte('created_at', fiveMinutesAgo)
    .limit(1)
    .maybeSingle();

  if (existingSubmission) {
    return corsJson(
      { error: 'Duplicate submission detected' },
      { status: 409 },
    );
  }

  // 12. Calculate form score
  const { rawScore, leadScore: formScore } = calculateLeadScore(
    steps,
    payload.answers,
    account.hot_lead_threshold,
    account.warm_lead_threshold,
  );

  // 12b. Calculate composite score with behavioral + intent dimensions
  const planLimits = getPlanLimits(account.plan as Plan);
  const scoringConfig: ScoringConfig = planLimits.predictiveScoring
    ? { ...DEFAULT_SCORING_CONFIG, ...(account.scoring_config as Partial<ScoringConfig>) }
    : { ...DEFAULT_SCORING_CONFIG, behavioralWeight: 0, intentWeight: 0, formWeight: 1.0 };

  let behavioralScore = 0;
  let intentScore = 0;
  const sessionData: BehavioralSessionData | null = payload.behavioralData ?? null;

  if (sessionData && planLimits.predictiveScoring) {
    behavioralScore = calculateBehavioralScore(sessionData);
    intentScore = calculateIntentScore(sessionData, sessionData.sessionNumber);
  }

  const composite = calculateCompositeScore({
    formScore,
    behavioralScore,
    intentScore,
    decayPenalty: 0,
    formWeight: scoringConfig.formWeight,
    behavioralWeight: scoringConfig.behavioralWeight,
    intentWeight: scoringConfig.intentWeight,
    hotThreshold: account.hot_lead_threshold,
    warmThreshold: account.warm_lead_threshold,
  });

  const leadScore = composite.leadScore;
  const leadTier = composite.leadTier;

  // 13. Denormalize answers
  const denormalized = denormalizeAnswers(steps, payload.answers);

  // 14. Parse metadata
  const userAgent = request.headers.get('user-agent');
  const deviceType = parseDeviceType(userAgent);
  const country = getCountry(request);

  // 14b. Evaluate lead routing rules (Pro+ only)
  let assignedTo: string | null = null;
  let assignedByRuleId: string | null = null;
  let routingStrategy: string | null = null;

  if (planLimits.leadRouting) {
    const routingContext: RoutingContext = {
      accountId: account.id,
      widgetId: widget.id,
      leadTier,
      leadScore,
      answers: payload.answers,
      country,
    };
    const routingResult = await evaluateRoutingRules(routingContext);
    if (routingResult) {
      assignedTo = routingResult.memberId;
      assignedByRuleId = routingResult.ruleId;
      routingStrategy = routingResult.strategy;
    }
  }

  // 15. Insert submission
  const { data: submission, error: insertError } = await admin
    .from('submissions')
    .insert({
      widget_id: widget.id,
      account_id: account.id,
      flow_version: flow.version,
      visitor_name: payload.visitorName,
      visitor_email: payload.visitorEmail,
      visitor_phone: payload.visitorPhone ?? null,
      visitor_message: payload.visitorMessage ?? null,
      answers: JSON.parse(JSON.stringify(denormalized)) as Record<string, string>[],
      raw_score: rawScore,
      lead_score: leadScore,
      lead_tier: leadTier,
      form_score: formScore,
      behavioral_score: behavioralScore,
      intent_score: intentScore,
      score_dimensions: composite.dimensions as unknown as Record<string, number>,
      visitor_fingerprint: payload.visitorFingerprint ?? null,
      routing_strategy: routingStrategy,
      source_url: payload.sourceUrl ?? null,
      ip_address: ip,
      user_agent: userAgent,
      referrer: payload.referrer ?? null,
      utm_source: payload.utmSource ?? null,
      utm_medium: payload.utmMedium ?? null,
      utm_campaign: payload.utmCampaign ?? null,
      country,
      device_type: deviceType,
      status: 'new',
      assigned_to: assignedTo,
      assigned_at: assignedTo ? new Date().toISOString() : null,
      assigned_by_rule_id: assignedByRuleId,
      ab_test_id: payload.abTestId ?? null,
      ab_variant: payload.abVariant ?? null,
    })
    .select('id')
    .single();

  if (insertError || !submission) {
    return corsJson(
      { error: 'Failed to save submission' },
      { status: 500 },
    );
  }

  // 15b. Update A/B test results if applicable
  if (payload.abTestId && payload.abVariant) {
    const today = new Date().toISOString().split('T')[0]!;
    const { data: existingAbResult } = await admin
      .from('ab_test_results')
      .select('id, submissions, total_score, hot_count, warm_count, cold_count')
      .eq('ab_test_id', payload.abTestId)
      .eq('variant', payload.abVariant)
      .eq('date', today)
      .maybeSingle();

    if (existingAbResult) {
      await admin
        .from('ab_test_results')
        .update({
          submissions: existingAbResult.submissions + 1,
          total_score: existingAbResult.total_score + leadScore,
          hot_count: existingAbResult.hot_count + (leadTier === 'hot' ? 1 : 0),
          warm_count: existingAbResult.warm_count + (leadTier === 'warm' ? 1 : 0),
          cold_count: existingAbResult.cold_count + (leadTier === 'cold' ? 1 : 0),
        })
        .eq('id', existingAbResult.id);
    } else {
      await admin.from('ab_test_results').insert({
        ab_test_id: payload.abTestId,
        variant: payload.abVariant,
        date: today,
        submissions: 1,
        total_score: leadScore,
        hot_count: leadTier === 'hot' ? 1 : 0,
        warm_count: leadTier === 'warm' ? 1 : 0,
        cold_count: leadTier === 'cold' ? 1 : 0,
      });
    }
  }

  // 15c. Upsert visitor session if behavioral data was provided
  if (sessionData && payload.visitorFingerprint) {
    admin
      .from('visitor_sessions')
      .insert({
        widget_id: widget.id,
        account_id: account.id,
        visitor_fingerprint: payload.visitorFingerprint,
        session_number: sessionData.sessionNumber,
        pages_viewed: sessionData.pagesViewed,
        page_urls: sessionData.pageUrls as string[],
        time_on_site_seconds: sessionData.timeOnSiteSeconds,
        max_scroll_depth: sessionData.maxScrollDepth,
        widget_opens: sessionData.widgetOpens,
        pricing_page_views: sessionData.pricingPageViews,
        high_intent_page_views: sessionData.highIntentPageViews,
        submitted: true,
        submission_id: submission.id,
      })
      .then(() => { /* non-blocking */ })
      .catch(() => { /* visitor session insert failure is non-blocking */ });
  }

  // 16. Atomically increment widget submission_count (prevents race conditions)
  const { data: incremented } = await admin.rpc('increment_submission_count', {
    widget_uuid: widget.id,
    current_limit: widget.submission_limit,
  });

  if (!incremented) {
    // Submission was inserted but limit was reached concurrently — remove it
    await admin.from('submissions').delete().eq('id', submission.id);
    return corsJson(
      { error: 'Submission limit reached for this widget' },
      { status: 403 },
    );
  }

  // 17. Update widget_analytics for today
  const today = new Date().toISOString().split('T')[0]!;

  const { data: existingAnalytics } = await admin
    .from('widget_analytics')
    .select('id, submissions, hot_count, warm_count, cold_count, avg_score')
    .eq('widget_id', widget.id)
    .eq('date', today)
    .maybeSingle();

  if (existingAnalytics) {
    const newSubmissions = existingAnalytics.submissions + 1;
    const prevTotal = existingAnalytics.submissions;
    const prevAvg = existingAnalytics.avg_score ?? 0;
    const newAvg =
      prevTotal === 0
        ? leadScore
        : Math.round((prevAvg * prevTotal + leadScore) / newSubmissions);

    await admin
      .from('widget_analytics')
      .update({
        submissions: newSubmissions,
        hot_count:
          existingAnalytics.hot_count + (leadTier === 'hot' ? 1 : 0),
        warm_count:
          existingAnalytics.warm_count + (leadTier === 'warm' ? 1 : 0),
        cold_count:
          existingAnalytics.cold_count + (leadTier === 'cold' ? 1 : 0),
        avg_score: newAvg,
      })
      .eq('id', existingAnalytics.id);
  } else {
    await admin.from('widget_analytics').insert({
      widget_id: widget.id,
      account_id: account.id,
      date: today,
      submissions: 1,
      hot_count: leadTier === 'hot' ? 1 : 0,
      warm_count: leadTier === 'warm' ? 1 : 0,
      cold_count: leadTier === 'cold' ? 1 : 0,
      avg_score: leadScore,
    });
  }

  // 18. Fire async side effects (email + webhooks) — do not await
  const notificationEmail = account.notification_email;
  if (notificationEmail) {
    sendNewLeadNotification({
      to: notificationEmail,
      widgetName: widget.name,
      visitorName: payload.visitorName,
      visitorEmail: payload.visitorEmail,
      leadTier,
      leadScore,
    })
      .then(async () => {
        await admin
          .from('submissions')
          .update({
            notification_sent: true,
            notification_sent_at: new Date().toISOString(),
          })
          .eq('id', submission.id);
      })
      .catch(() => {
        // Email delivery failure — non-blocking
      });
  }

  // 18b. Notify assigned team member if lead was routed
  if (assignedTo && assignedByRuleId) {
    const memberIdForEmail = assignedTo;
    const ruleIdForEmail = assignedByRuleId;

    Promise.all([
      admin
        .from('members')
        .select('user_id, invited_email')
        .eq('id', memberIdForEmail)
        .single(),
      admin
        .from('lead_routing_rules')
        .select('name')
        .eq('id', ruleIdForEmail)
        .single(),
    ])
      .then(async ([memberResult, ruleResult]) => {
        if (!memberResult.data || !ruleResult.data) return;

        // Resolve the member's email: try auth user email first, fall back to invited_email
        let assigneeEmail: string | null = memberResult.data.invited_email;
        let assigneeName = 'Team Member';

        const { data: authUser } = await admin.auth.admin.getUserById(memberResult.data.user_id);
        if (authUser?.user?.email) {
          assigneeEmail = authUser.user.email;
          const meta = authUser.user.user_metadata as Record<string, unknown> | undefined;
          if (meta && typeof meta.full_name === 'string') {
            assigneeName = meta.full_name;
          }
        }

        if (!assigneeEmail) return;

        await sendLeadAssignedNotification({
          to: assigneeEmail,
          assigneeName,
          accountName: account.name,
          widgetName: widget.name,
          visitorName: payload.visitorName,
          visitorEmail: payload.visitorEmail,
          leadTier,
          leadScore,
          submissionId: submission.id,
          ruleName: ruleResult.data.name,
        });
      })
      .catch(() => {
        // Assignee notification failure — non-blocking
      });
  }

  // 19. Fire Slack notification if configured
  if (account.slack_webhook_url) {
    const slackWebhookUrl = account.slack_webhook_url;

    // Fetch notification preferences to check if slack is enabled for this tier
    Promise.resolve(
      admin
        .from('notification_preferences')
        .select('slack_on_hot_lead, slack_on_warm_lead, slack_on_cold_lead')
        .eq('account_id', account.id)
        .limit(1)
        .maybeSingle()
    )
      .then(({ data: slackPref }: { data: { slack_on_hot_lead: boolean; slack_on_warm_lead: boolean; slack_on_cold_lead: boolean } | null }) => {
        if (!slackPref) return;
        const shouldNotify =
          (leadTier === 'hot' && slackPref.slack_on_hot_lead) ||
          (leadTier === 'warm' && slackPref.slack_on_warm_lead) ||
          (leadTier === 'cold' && slackPref.slack_on_cold_lead);
        if (shouldNotify) {
          void sendSlackNotification(slackWebhookUrl, {
            leadName: payload.visitorName,
            leadEmail: payload.visitorEmail,
            leadTier,
            leadScore,
            widgetName: widget.name,
          });
        }
      })
      .catch(() => {
        // Slack delivery failure — non-blocking
      });
  }

  // 19b. Enroll in drip sequence for warm/cold leads (Pro+ only)
  if ((leadTier === 'warm' || leadTier === 'cold') && planLimits.dripSequences) {
    const dripTier: 'warm' | 'cold' = leadTier;
    enrollInDripSequence(admin, account.id, widget.id, submission.id, dripTier).catch(() => {
      // Drip enrollment failure — non-blocking
    });
  }

  fireWebhooks(account.id, 'submission.created', {
    submissionId: submission.id,
    widgetId: widget.id,
    widgetKey: widget.widget_key,
    visitorName: payload.visitorName,
    visitorEmail: payload.visitorEmail,
    leadTier,
    leadScore,
    rawScore,
    answers: denormalized,
    createdAt: new Date().toISOString(),
  }).catch(() => {
    // Webhook delivery failure — non-blocking
  });

  return corsJson(
    {
      message: 'Submission received',
      id: submission.id,
      tier: leadTier,
      score: leadScore,
    },
    { status: 201 },
  );
}
