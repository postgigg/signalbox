import { calculateCompositeScore, determineTier } from '@/lib/scoring';

import type { ScoringConfig } from '@/lib/constants';
import type { CompositeScoreResult } from '@/lib/scoring';

const MS_PER_DAY = 86400000;
const DAYS_PER_WEEK = 7;

const ENGAGEMENT_STATUSES = ['contacted', 'qualified', 'converted'] as const;

// ---------------------------------------------------------------------------
// Decay calculation
// ---------------------------------------------------------------------------

export interface DecayOnReadParams {
  readonly leadScore: number;
  readonly formScore: number;
  readonly engagementScore: number;
  readonly lastEngagementAt: string;
  readonly scoringConfig: ScoringConfig;
  readonly hotThreshold: number;
  readonly warmThreshold: number;
}

export interface DecayOnReadResult {
  readonly displayScore: number;
  readonly displayTier: 'hot' | 'warm' | 'cold';
  readonly decayPenalty: number;
}

/**
 * Calculates the decay penalty based on elapsed time since last engagement.
 * No penalty is applied during the grace period (first 7 days).
 * After the grace period, penalty accrues at the configured rate per week.
 */
export function calculateDecayPenalty(
  lastEngagementAt: string,
  ratePerWeek: number,
  maxDecay: number,
): number {
  const elapsed = Date.now() - new Date(lastEngagementAt).getTime();
  const days = elapsed / MS_PER_DAY;

  if (days <= DAYS_PER_WEEK) return 0;

  const weeks = (days - DAYS_PER_WEEK) / DAYS_PER_WEEK;
  const penalty = Math.round(weeks * ratePerWeek);

  return Math.min(penalty, maxDecay);
}

/**
 * Applies decay on read to produce a display score and tier without persisting.
 * Used for dashboard reads to show real-time decay adjustments.
 */
export function applyDecayOnRead(params: DecayOnReadParams): DecayOnReadResult {
  const { scoringConfig } = params;

  const decayPenalty = scoringConfig.decayEnabled
    ? calculateDecayPenalty(
        params.lastEngagementAt,
        scoringConfig.decayRatePerWeek,
        scoringConfig.decayMax,
      )
    : 0;

  const result: CompositeScoreResult = calculateCompositeScore({
    formScore: params.formScore,
    engagementScore: params.engagementScore,
    decayPenalty,
    formWeight: scoringConfig.formWeight,
    engagementWeight: scoringConfig.engagementWeight,
    hotThreshold: params.hotThreshold,
    warmThreshold: params.warmThreshold,
  });

  return {
    displayScore: result.leadScore,
    displayTier: determineTier(result.leadScore, params.hotThreshold, params.warmThreshold),
    decayPenalty,
  };
}

/**
 * Returns true if the status change indicates re-engagement,
 * which should reset the decay timer.
 */
export function shouldResetDecay(newStatus: string): boolean {
  return (ENGAGEMENT_STATUSES as readonly string[]).includes(newStatus);
}
