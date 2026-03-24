import { createAdminClient } from '@/lib/supabase/admin';
import { matchesCondition } from '@/lib/lead-routing/matchers';
import { resolveAssignment } from '@/lib/lead-routing/strategies';

import type { RoutingContext, RoutingResult, RoutingRuleRow, RoutingMetadata, MemberAvailability, MemberTerritory } from '@/lib/lead-routing/types';

// Re-export types for backward compatibility
export type { RoutingContext, RoutingResult };

type AdminClient = ReturnType<typeof createAdminClient>;

function buildSkillsMap(
  rows: Array<{ member_id: string; skill_tag: string }>,
): Map<string, string[]> {
  const map = new Map<string, string[]>();
  for (const row of rows) {
    const existing = map.get(row.member_id) ?? [];
    existing.push(row.skill_tag);
    map.set(row.member_id, existing);
  }
  return map;
}

function buildTerritoriesMap(
  rows: Array<{ member_id: string; country_code: string; region_name: string | null }>,
): Map<string, MemberTerritory[]> {
  const map = new Map<string, MemberTerritory[]>();
  for (const row of rows) {
    const existing = map.get(row.member_id) ?? [];
    existing.push({ countryCode: row.country_code, regionName: row.region_name });
    map.set(row.member_id, existing);
  }
  return map;
}

const VALID_AVAILABILITY_STATUSES = ['online', 'offline', 'busy'] as const;
type AvailabilityStatus = (typeof VALID_AVAILABILITY_STATUSES)[number];

function isValidAvailabilityStatus(value: string): value is AvailabilityStatus {
  return (VALID_AVAILABILITY_STATUSES as readonly string[]).includes(value);
}

function buildAvailabilityMap(
  rows: Array<{ member_id: string; status: string; max_active_leads: number | null; last_active_at: string; auto_offline_minutes: number }>,
): Map<string, MemberAvailability> {
  const map = new Map<string, MemberAvailability>();
  for (const row of rows) {
    const status: AvailabilityStatus = isValidAvailabilityStatus(row.status) ? row.status : 'offline';
    map.set(row.member_id, {
      status,
      maxActiveLeads: row.max_active_leads,
      lastActiveAt: row.last_active_at,
      autoOfflineMinutes: row.auto_offline_minutes,
    });
  }
  return map;
}

function buildActiveCountsMap(
  rows: Array<{ assigned_to: string | null }>,
): Map<string, number> {
  const map = new Map<string, number>();
  for (const row of rows) {
    if (row.assigned_to) {
      map.set(row.assigned_to, (map.get(row.assigned_to) ?? 0) + 1);
    }
  }
  return map;
}

const ACTIVE_STATUSES = ['new', 'viewed', 'contacted'] as const;

async function fetchRoutingMetadata(
  admin: AdminClient,
  accountId: string,
): Promise<RoutingMetadata> {
  const [skillsResult, territoriesResult, availabilityResult, activeCountsResult] = await Promise.all([
    admin.from('member_skills').select('member_id, skill_tag').eq('account_id', accountId),
    admin.from('member_territories').select('member_id, country_code, region_name').eq('account_id', accountId),
    admin.from('member_availability').select('member_id, status, max_active_leads, last_active_at, auto_offline_minutes').eq('account_id', accountId),
    admin.from('submissions').select('assigned_to').eq('account_id', accountId).in('status', [...ACTIVE_STATUSES]),
  ]);

  return {
    memberSkills: buildSkillsMap(skillsResult.data ?? []),
    memberTerritories: buildTerritoriesMap(territoriesResult.data ?? []),
    memberAvailability: buildAvailabilityMap(availabilityResult.data ?? []),
    memberActiveCounts: buildActiveCountsMap(activeCountsResult.data ?? []),
  };
}

function filterApplicableRules(
  rules: RoutingRuleRow[],
  widgetId: string,
): RoutingRuleRow[] {
  return rules.filter(
    (rule) => rule.widget_id === null || rule.widget_id === widgetId,
  );
}

const RULE_SELECT_COLUMNS = [
  'id',
  'match_tier',
  'match_step_id',
  'match_option_id',
  'assign_to_member_id',
  'widget_id',
  'routing_strategy',
  'match_country',
  'match_region',
  'match_skill_tags',
  'match_score_min',
  'match_score_max',
  'round_robin_pool',
  'round_robin_weights',
  'fallback_strategy',
].join(', ');

export async function evaluateRoutingRules(
  context: RoutingContext,
): Promise<RoutingResult | null> {
  const admin = createAdminClient();

  const { data: rules, error } = await admin
    .from('lead_routing_rules')
    .select(RULE_SELECT_COLUMNS)
    .eq('account_id', context.accountId)
    .eq('is_active', true)
    .order('priority', { ascending: false });

  if (error || !rules || rules.length === 0) return null;

  const applicableRules = filterApplicableRules(
    rules as unknown as RoutingRuleRow[],
    context.widgetId,
  );

  if (applicableRules.length === 0) return null;

  const needsMetadata = applicableRules.some(
    (r) => r.routing_strategy !== 'direct' && r.routing_strategy !== 'value',
  );

  const emptyMetadata: RoutingMetadata = {
    memberSkills: new Map(),
    memberTerritories: new Map(),
    memberAvailability: new Map(),
    memberActiveCounts: new Map(),
  };

  const metadata: RoutingMetadata = needsMetadata
    ? await fetchRoutingMetadata(admin, context.accountId)
    : emptyMetadata;

  for (const rule of applicableRules) {
    if (!matchesCondition(rule, context)) continue;

    const memberId = await resolveAssignment(rule, context, metadata, admin);
    if (memberId) {
      return { ruleId: rule.id, memberId, strategy: rule.routing_strategy };
    }
  }

  return null;
}
