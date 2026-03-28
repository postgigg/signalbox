import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { calculateDecayPenalty } from '@/lib/decay';
import { calculateCompositeScore, determineTier } from '@/lib/scoring';
import { fireWebhooks } from '@/lib/webhooks';

import type { ScoringConfig } from '@/lib/constants';
import type { Json } from '@/lib/supabase/types';

const BATCH_SIZE = 100;
const DECAY_GRACE_DAYS = 7;
const MS_PER_DAY = 86400000;
const CHANGE_REASON = 'decay_cron';

interface DecayCronResult {
  processed: number;
  tierChanges: number;
}

interface DecayableSubmission {
  id: string;
  account_id: string;
  lead_score: number;
  lead_tier: string;
  form_score: number;
  behavioral_score: number;
  intent_score: number;
  last_engagement_at: string;
}

interface AccountWithConfig {
  id: string;
  scoring_config: Json;
  hot_lead_threshold: number;
  warm_lead_threshold: number;
}

function parseScoringConfig(raw: Json): ScoringConfig | null {
  if (typeof raw !== 'object' || raw === null || Array.isArray(raw)) {
    return null;
  }

  const obj = raw as Record<string, Json | undefined>;

  if (
    typeof obj['formWeight'] !== 'number' ||
    typeof obj['behavioralWeight'] !== 'number' ||
    typeof obj['intentWeight'] !== 'number' ||
    typeof obj['decayRatePerWeek'] !== 'number' ||
    typeof obj['decayMax'] !== 'number' ||
    typeof obj['decayEnabled'] !== 'boolean'
  ) {
    return null;
  }

  const highIntentPages = Array.isArray(obj['highIntentPages'])
    ? (obj['highIntentPages'] as Json[]).filter((p): p is string => typeof p === 'string')
    : [];

  return {
    formWeight: obj['formWeight'],
    behavioralWeight: obj['behavioralWeight'],
    intentWeight: obj['intentWeight'],
    decayRatePerWeek: obj['decayRatePerWeek'],
    decayMax: obj['decayMax'],
    decayEnabled: obj['decayEnabled'],
    highIntentPages,
  };
}

function verifyCronSecret(request: NextRequest): boolean {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) return false;

  const authHeader = request.headers.get('authorization');
  if (!authHeader) return false;

  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') return false;

  return parts[1] === cronSecret;
}

async function fetchDecayEnabledAccounts(
  admin: ReturnType<typeof createAdminClient>,
): Promise<AccountWithConfig[]> {
  const { data: accounts, error } = await admin
    .from('accounts')
    .select('id, scoring_config, hot_lead_threshold, warm_lead_threshold')
    .is('deleted_at', null);

  if (error || !accounts) return [];

  return (accounts as AccountWithConfig[]).filter((a: AccountWithConfig) => {
    const config = parseScoringConfig(a.scoring_config);
    return config !== null && config.decayEnabled;
  });
}

async function processAccountDecay(
  admin: ReturnType<typeof createAdminClient>,
  account: AccountWithConfig,
  config: ScoringConfig,
): Promise<{ processed: number; tierChanges: number }> {
  let processed = 0;
  let tierChanges = 0;

  const cutoff = new Date(Date.now() - DECAY_GRACE_DAYS * MS_PER_DAY).toISOString();

  // Paginate through stale submissions
  let offset = 0;
  let hasMore = true;

  while (hasMore) {
    const { data: submissions, error: fetchError } = await admin
      .from('submissions')
      .select('id, account_id, lead_score, lead_tier, form_score, behavioral_score, intent_score, last_engagement_at')
      .eq('account_id', account.id)
      .lt('last_engagement_at', cutoff)
      .gt('lead_score', 0)
      .range(offset, offset + BATCH_SIZE - 1);

    if (fetchError || !submissions || submissions.length === 0) {
      hasMore = false;
      break;
    }

    const batchResult = await processDecayBatch(
      admin,
      submissions,
      account,
      config,
    );

    processed += batchResult.processed;
    tierChanges += batchResult.tierChanges;
    offset += BATCH_SIZE;

    if (submissions.length < BATCH_SIZE) {
      hasMore = false;
    }
  }

  return { processed, tierChanges };
}

async function processDecayBatch(
  admin: ReturnType<typeof createAdminClient>,
  submissions: DecayableSubmission[],
  account: AccountWithConfig,
  config: ScoringConfig,
): Promise<{ processed: number; tierChanges: number }> {
  let processed = 0;
  let tierChanges = 0;

  for (const sub of submissions) {
    const penalty = calculateDecayPenalty(
      sub.last_engagement_at,
      config.decayRatePerWeek,
      config.decayMax,
    );

    const result = calculateCompositeScore({
      formScore: sub.form_score,
      behavioralScore: sub.behavioral_score,
      intentScore: sub.intent_score,
      decayPenalty: penalty,
      formWeight: config.formWeight,
      behavioralWeight: config.behavioralWeight,
      intentWeight: config.intentWeight,
      hotThreshold: account.hot_lead_threshold,
      warmThreshold: account.warm_lead_threshold,
    });

    const newTier = determineTier(
      result.leadScore,
      account.hot_lead_threshold,
      account.warm_lead_threshold,
    );

    const tierChanged = newTier !== sub.lead_tier;

    // Update submission score and decay penalty
    const { error: updateError } = await admin
      .from('submissions')
      .update({
        lead_score: result.leadScore,
        lead_tier: newTier,
        decay_penalty: penalty,
        score_dimensions: result.dimensions as unknown as Json,
        updated_at: new Date().toISOString(),
      })
      .eq('id', sub.id);

    if (!updateError) {
      processed += 1;

      // Fire lead.score_changed webhook when score actually changed
      if (result.leadScore !== sub.lead_score) {
        void fireWebhooks(sub.account_id, 'lead.score_changed', {
          submissionId: sub.id,
          accountId: sub.account_id,
          previousScore: sub.lead_score,
          newScore: result.leadScore,
          previousTier: sub.lead_tier,
          newTier,
          changeReason: CHANGE_REASON,
          updatedAt: new Date().toISOString(),
        });
      }
    }

    // Log tier change to score_history
    if (tierChanged && !updateError) {
      tierChanges += 1;

      await admin
        .from('score_history')
        .insert({
          submission_id: sub.id,
          account_id: sub.account_id,
          previous_score: sub.lead_score,
          new_score: result.leadScore,
          previous_tier: sub.lead_tier,
          new_tier: newTier,
          change_reason: CHANGE_REASON,
          dimensions: result.dimensions as unknown as Json,
        });
    }
  }

  return { processed, tierChanges };
}

export async function POST(
  request: NextRequest,
): Promise<NextResponse> {
  if (!verifyCronSecret(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const admin = createAdminClient();
  const accounts = await fetchDecayEnabledAccounts(admin);

  const totals: DecayCronResult = { processed: 0, tierChanges: 0 };

  for (const account of accounts) {
    const config = parseScoringConfig(account.scoring_config);
    if (!config) continue;

    const result = await processAccountDecay(admin, account, config);
    totals.processed += result.processed;
    totals.tierChanges += result.tierChanges;
  }

  return NextResponse.json({
    processed: totals.processed,
    tierChanges: totals.tierChanges,
  });
}
