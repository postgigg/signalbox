import type { LeadTier } from '@/lib/supabase/types';

export interface AnswerInput {
  readonly stepId: string;
  readonly optionId: string;
}

export interface RoutingContext {
  readonly accountId: string;
  readonly widgetId: string;
  readonly leadTier: LeadTier;
  readonly leadScore: number;
  readonly answers: readonly AnswerInput[];
  readonly country: string | null;
}

export interface RoutingResult {
  readonly ruleId: string;
  readonly memberId: string;
  readonly strategy: string;
}

export interface RoutingRuleRow {
  readonly id: string;
  readonly match_tier: string | null;
  readonly match_step_id: string | null;
  readonly match_option_id: string | null;
  readonly assign_to_member_id: string | null;
  readonly widget_id: string | null;
  readonly routing_strategy: string;
  readonly match_country: string[] | null;
  readonly match_region: string[] | null;
  readonly match_skill_tags: string[] | null;
  readonly match_score_min: number | null;
  readonly match_score_max: number | null;
  readonly round_robin_pool: string[] | null;
  readonly round_robin_weights: Record<string, number> | null;
  readonly fallback_strategy: string;
}

export interface MemberAvailability {
  readonly status: 'online' | 'offline' | 'busy';
  readonly maxActiveLeads: number | null;
  readonly lastActiveAt: string;
  readonly autoOfflineMinutes: number;
}

export interface MemberTerritory {
  readonly countryCode: string;
  readonly regionName: string | null;
}

export interface RoutingMetadata {
  readonly memberSkills: Map<string, string[]>;
  readonly memberTerritories: Map<string, MemberTerritory[]>;
  readonly memberAvailability: Map<string, MemberAvailability>;
  readonly memberActiveCounts: Map<string, number>;
}
