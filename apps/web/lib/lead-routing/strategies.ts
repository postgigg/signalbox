import type { SupabaseClient } from '@supabase/supabase-js';

import type { Database } from '@/lib/supabase/types';

import type {
  RoutingRuleRow,
  RoutingContext,
  RoutingMetadata,
  MemberAvailability,
} from './types';

const OFFLINE_STATUS = 'offline';
const BUSY_STATUS = 'busy';
const MS_PER_MINUTE = 60 * 1000;

export function resolveDirect(rule: RoutingRuleRow): string | null {
  return rule.assign_to_member_id;
}

export function resolveSkill(
  rule: RoutingRuleRow,
  metadata: RoutingMetadata,
): string | null {
  if (!rule.match_skill_tags || rule.match_skill_tags.length === 0) {
    return null;
  }

  const requiredTags = rule.match_skill_tags;

  // Prefer an available member with matching skill
  for (const [memberId, skills] of metadata.memberSkills) {
    const hasMatch = requiredTags.some((tag) => skills.includes(tag));
    if (!hasMatch) continue;

    const availability = metadata.memberAvailability.get(memberId);
    const activeCount = metadata.memberActiveCounts.get(memberId) ?? 0;
    if (availability && isMemberAvailable(availability, activeCount)) {
      return memberId;
    }
  }

  // Fallback: any member with the skill regardless of availability
  for (const [memberId, skills] of metadata.memberSkills) {
    if (requiredTags.some((tag) => skills.includes(tag))) {
      return memberId;
    }
  }

  return null;
}

export function resolveGeographic(
  context: RoutingContext,
  metadata: RoutingMetadata,
): string | null {
  if (!context.country) return null;

  for (const [memberId, territories] of metadata.memberTerritories) {
    const hasTerritory = territories.some(
      (t) => t.countryCode === context.country,
    );
    if (hasTerritory) return memberId;
  }

  return null;
}

export function resolveValue(rule: RoutingRuleRow): string | null {
  return rule.assign_to_member_id;
}

export async function resolveRoundRobin(
  rule: RoutingRuleRow,
  admin: SupabaseClient<Database>,
): Promise<string | null> {
  if (!rule.round_robin_pool || rule.round_robin_pool.length === 0) {
    return null;
  }

  const { data: memberId } = await admin.rpc('advance_round_robin', {
    p_rule_id: rule.id,
    p_pool: rule.round_robin_pool,
    p_max_leads: (rule.round_robin_weights ?? {}) as Record<string, unknown>,
  });

  return memberId as string | null;
}

export function resolveAvailability(
  metadata: RoutingMetadata,
): string | null {
  let bestMemberId: string | null = null;
  let lowestLoad = Infinity;

  for (const [memberId, availability] of metadata.memberAvailability) {
    const activeCount = metadata.memberActiveCounts.get(memberId) ?? 0;
    if (!isMemberAvailable(availability, activeCount)) continue;

    if (activeCount < lowestLoad) {
      lowestLoad = activeCount;
      bestMemberId = memberId;
    }
  }

  return bestMemberId;
}

function isMemberAvailable(
  availability: MemberAvailability,
  activeCount: number,
): boolean {
  if (
    availability.status === OFFLINE_STATUS ||
    availability.status === BUSY_STATUS
  ) {
    return false;
  }

  const lastActive = new Date(availability.lastActiveAt).getTime();
  const offlineThreshold = availability.autoOfflineMinutes * MS_PER_MINUTE;
  if (Date.now() - lastActive > offlineThreshold) return false;

  if (
    availability.maxActiveLeads !== null &&
    activeCount >= availability.maxActiveLeads
  ) {
    return false;
  }

  return true;
}

export async function resolveAssignment(
  rule: RoutingRuleRow,
  context: RoutingContext,
  metadata: RoutingMetadata,
  admin: SupabaseClient<Database>,
): Promise<string | null> {
  switch (rule.routing_strategy) {
    case 'direct':
      return resolveDirect(rule);
    case 'skill':
      return resolveSkill(rule, metadata);
    case 'geographic':
      return resolveGeographic(context, metadata);
    case 'value':
      return resolveValue(rule);
    case 'round_robin':
      return resolveRoundRobin(rule, admin);
    case 'availability':
      return resolveAvailability(metadata);
    default:
      return null;
  }
}
