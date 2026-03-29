import { ENGAGEMENT_THRESHOLDS } from '@/lib/scoring-constants';

import type { Json } from '@/lib/supabase/types';

export interface FlowOption {
  id: string;
  label: string;
  scoreWeight: number;
}

export interface FlowStep {
  id: string;
  question: string;
  options: FlowOption[];
}

export interface Answer {
  stepId: string;
  optionId: string;
}

export interface DenormalizedAnswer {
  stepId: string;
  optionId: string;
  question: string;
  label: string;
  scoreWeight: number;
}

interface ScoreResult {
  rawScore: number;
  leadScore: number;
  leadTier: 'hot' | 'warm' | 'cold';
}

/**
 * Calculates a normalized lead score from flow step answers.
 *
 * Algorithm:
 * 1. Sum the scoreWeight for each selected option.
 * 2. Determine the min/max possible score across all steps.
 * 3. Normalize the raw score to a 0-100 range.
 * 4. Assign a lead tier based on configurable thresholds.
 */
export function calculateLeadScore(
  steps: FlowStep[],
  answers: Answer[],
  hotThreshold: number = 70,
  warmThreshold: number = 40
): ScoreResult {
  // Sum selected option weights
  let rawScore = 0;
  for (const answer of answers) {
    const step = steps.find((s) => s.id === answer.stepId);
    if (!step) continue;
    const option = step.options.find((o) => o.id === answer.optionId);
    if (!option) continue;
    rawScore += option.scoreWeight;
  }

  // Calculate min/max possible scores across all steps
  let minPossible = 0;
  let maxPossible = 0;
  for (const step of steps) {
    const weights = step.options.map((o) => o.scoreWeight);
    if (weights.length === 0) continue;
    minPossible += Math.min(...weights);
    maxPossible += Math.max(...weights);
  }

  // Normalize to 0-100
  const range = maxPossible - minPossible;
  let leadScore =
    range === 0
      ? 50
      : Math.round(((rawScore - minPossible) / range) * 100);
  leadScore = Math.max(0, Math.min(100, leadScore));

  // Determine tier
  let leadTier: 'hot' | 'warm' | 'cold';
  if (leadScore >= hotThreshold) {
    leadTier = 'hot';
  } else if (leadScore >= warmThreshold) {
    leadTier = 'warm';
  } else {
    leadTier = 'cold';
  }

  return { rawScore, leadScore, leadTier };
}

/**
 * Generates a suggested conversation opener based on visitor answers.
 * Uses the first few answer labels to create a personalized greeting.
 */
export function generateSuggestedOpener(
  visitorName: string,
  answers: Array<{ question: string; label: string }>
): string {
  const firstName = visitorName.split(' ')[0] ?? visitorName;
  const parts = answers.map((a) => a.label.toLowerCase());

  if (parts.length >= 3) {
    return `Hi ${firstName}, thanks for reaching out about ${parts[0]} with a ${parts[1]} timeline in the ${parts[2]} range. Here's what I'd suggest as a next step...`;
  }
  if (parts.length === 2) {
    return `Hi ${firstName}, thanks for reaching out about ${parts[0]} with a ${parts[1]} timeline. Here's what I'd suggest as a next step...`;
  }
  return `Hi ${firstName}, thanks for reaching out. Here's what I'd suggest as a next step...`;
}

/**
 * Denormalize answers by attaching question text, label, and scoreWeight from flow steps.
 */
export function denormalizeAnswers(
  steps: FlowStep[],
  answers: Answer[],
): DenormalizedAnswer[] {
  return answers.map((answer) => {
    const step = steps.find((s) => s.id === answer.stepId);
    const option = step?.options.find((o) => o.id === answer.optionId);

    return {
      stepId: answer.stepId,
      optionId: answer.optionId,
      question: step?.question ?? '',
      label: option?.label ?? '',
      scoreWeight: option?.scoreWeight ?? 0,
    };
  });
}

/** Type-safe parser for flow steps JSON from the database */
export function parseFlowSteps(stepsJson: Json): FlowStep[] {
  if (!Array.isArray(stepsJson)) {
    throw new Error('Flow steps must be an array');
  }

  return stepsJson.map((step, idx) => {
    if (typeof step !== 'object' || step === null || Array.isArray(step)) {
      throw new Error(`Step ${idx} must be an object`);
    }

    const s = step as Record<string, Json | undefined>;

    if (typeof s['id'] !== 'string' || typeof s['question'] !== 'string') {
      throw new Error(`Step ${idx} must have string id and question`);
    }

    if (!Array.isArray(s['options'])) {
      throw new Error(`Step ${idx} must have an options array`);
    }

    const options = (s['options'] as Json[]).map((opt, oidx) => {
      if (typeof opt !== 'object' || opt === null || Array.isArray(opt)) {
        throw new Error(`Step ${idx} option ${oidx} must be an object`);
      }
      const o = opt as Record<string, Json | undefined>;
      const scoreVal = o['scoreWeight'] ?? o['score'];
      if (
        typeof o['id'] !== 'string' ||
        typeof o['label'] !== 'string' ||
        typeof scoreVal !== 'number'
      ) {
        throw new Error(
          `Step ${idx} option ${oidx} must have string id, string label, number scoreWeight`,
        );
      }
      return {
        id: o['id'],
        label: o['label'],
        scoreWeight: scoreVal,
      };
    });

    return {
      id: s['id'],
      question: s['question'],
      options,
    };
  });
}

/** Validate flow steps structure for creation/update */
export function validateFlowSteps(
  stepsJson: Json,
): { valid: true; steps: FlowStep[] } | { valid: false; error: string } {
  try {
    const steps = parseFlowSteps(stepsJson);

    if (steps.length < 2 || steps.length > 5) {
      return { valid: false, error: 'Flow must have between 2 and 5 steps' };
    }

    for (const step of steps) {
      if (step.options.length < 2 || step.options.length > 6) {
        return {
          valid: false,
          error: `Step "${step.question}" must have between 2 and 6 options`,
        };
      }

      for (const opt of step.options) {
        if (opt.scoreWeight < -50 || opt.scoreWeight > 50) {
          return {
            valid: false,
            error: `Option "${opt.label}" scoreWeight must be between -50 and +50`,
          };
        }
      }

      const optionIds = step.options.map((o) => o.id);
      if (new Set(optionIds).size !== optionIds.length) {
        return {
          valid: false,
          error: `Step "${step.question}" has duplicate option IDs`,
        };
      }
    }

    const stepIds = steps.map((s) => s.id);
    if (new Set(stepIds).size !== stepIds.length) {
      return { valid: false, error: 'Duplicate step IDs found' };
    }

    return { valid: true, steps };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Invalid flow steps';
    return { valid: false, error: message };
  }
}

// ---------------------------------------------------------------------------
// Predictive scoring interfaces
// ---------------------------------------------------------------------------

export type LeadTier = 'hot' | 'warm' | 'cold';

export interface BehavioralSessionData {
  readonly pagesViewed: number;
  readonly pageUrls: readonly string[];
  readonly timeOnSiteSeconds: number;
  readonly maxScrollDepth: number;
  readonly widgetOpens: number;
  readonly sessionNumber: number;
  readonly pricingPageViews: number;
  readonly highIntentPageViews: number;
}

export interface CompositeScoreParams {
  readonly formScore: number;
  readonly engagementScore: number;
  readonly decayPenalty: number;
  readonly formWeight: number;
  readonly engagementWeight: number;
  readonly hotThreshold: number;
  readonly warmThreshold: number;
}

export interface CompositeScoreResult {
  readonly leadScore: number;
  readonly leadTier: LeadTier;
  readonly dimensions: {
    readonly form: number;
    readonly engagement: number;
    readonly decay: number;
    readonly formWeighted: number;
    readonly engagementWeighted: number;
  };
}

// ---------------------------------------------------------------------------
// Predictive scoring functions
// ---------------------------------------------------------------------------

/**
 * Normalizes a single metric value to a 0-1 range using min/max thresholds.
 */
function normalizeMetric(value: number, min: number, max: number): number {
  if (max === min) return 0;
  return Math.min(1, Math.max(0, (value - min) / (max - min)));
}

/**
 * Determines the lead tier based on score and thresholds.
 */
export function determineTier(
  score: number,
  hotThreshold: number,
  warmThreshold: number,
): LeadTier {
  if (score >= hotThreshold) return 'hot';
  if (score >= warmThreshold) return 'warm';
  return 'cold';
}

/**
 * Calculates an engagement score (0-100) from session data.
 * Combines behavioral signals (pages, time, scroll) with intent signals
 * (pricing views, return visits) into a single engagement dimension.
 */
export function calculateEngagementScore(
  sessionData: BehavioralSessionData,
  returnVisitCount: number,
): number {
  const t = ENGAGEMENT_THRESHOLDS;

  const pagesNorm = normalizeMetric(sessionData.pagesViewed, t.pagesViewed.min, t.pagesViewed.max);
  const timeNorm = normalizeMetric(sessionData.timeOnSiteSeconds, t.timeOnSiteSeconds.min, t.timeOnSiteSeconds.max);
  const scrollNorm = normalizeMetric(sessionData.maxScrollDepth, t.maxScrollDepth.min, t.maxScrollDepth.max);
  const widgetNorm = normalizeMetric(sessionData.widgetOpens, t.widgetOpens.min, t.widgetOpens.max);
  const sessionNorm = normalizeMetric(sessionData.sessionNumber, t.sessionCount.min, t.sessionCount.max);
  const pricingNorm = normalizeMetric(sessionData.pricingPageViews, t.pricingPageViews.min, t.pricingPageViews.max);
  const highIntentNorm = normalizeMetric(sessionData.highIntentPageViews, t.highIntentPageViews.min, t.highIntentPageViews.max);
  const returnNorm = normalizeMetric(returnVisitCount, t.returnVisitCount.min, t.returnVisitCount.max);

  const weighted =
    pagesNorm * t.pagesViewed.weight +
    timeNorm * t.timeOnSiteSeconds.weight +
    scrollNorm * t.maxScrollDepth.weight +
    widgetNorm * t.widgetOpens.weight +
    sessionNorm * t.sessionCount.weight +
    pricingNorm * t.pricingPageViews.weight +
    highIntentNorm * t.highIntentPageViews.weight +
    returnNorm * t.returnVisitCount.weight;

  return Math.round(weighted * 100);
}

/**
 * Calculates a composite lead score from form and engagement dimensions.
 * Applies decay penalty and determines the final tier.
 */
export function calculateCompositeScore(
  params: CompositeScoreParams,
): CompositeScoreResult {
  const formWeighted = params.formWeight * params.formScore;
  const engagementWeighted = params.engagementWeight * params.engagementScore;

  const raw = formWeighted + engagementWeighted - params.decayPenalty;
  const leadScore = Math.max(0, Math.min(100, Math.round(raw)));

  const leadTier = determineTier(
    leadScore,
    params.hotThreshold,
    params.warmThreshold,
  );

  return {
    leadScore,
    leadTier,
    dimensions: {
      form: params.formScore,
      engagement: params.engagementScore,
      decay: params.decayPenalty,
      formWeighted: Math.round(formWeighted),
      engagementWeighted: Math.round(engagementWeighted),
    },
  };
}
