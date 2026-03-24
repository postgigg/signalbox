import type { RoutingRuleRow, RoutingContext } from './types';

export function matchesDirect(
  rule: RoutingRuleRow,
  context: RoutingContext,
): boolean {
  if (rule.match_tier !== null && rule.match_tier === context.leadTier) {
    return true;
  }
  if (rule.match_step_id !== null && rule.match_option_id !== null) {
    return context.answers.some(
      (a) =>
        a.stepId === rule.match_step_id &&
        a.optionId === rule.match_option_id,
    );
  }
  return false;
}

export function matchesSkill(
  rule: RoutingRuleRow,
  _context: RoutingContext,
): boolean {
  return rule.match_skill_tags !== null && rule.match_skill_tags.length > 0;
}

export function matchesGeographic(
  rule: RoutingRuleRow,
  context: RoutingContext,
): boolean {
  if (!context.country) return false;
  if (!rule.match_country || rule.match_country.length === 0) return false;
  return rule.match_country.includes(context.country);
}

export function matchesValue(
  rule: RoutingRuleRow,
  context: RoutingContext,
): boolean {
  const min = rule.match_score_min ?? 0;
  const max = rule.match_score_max ?? 100;
  return context.leadScore >= min && context.leadScore <= max;
}

export function matchesRoundRobin(
  rule: RoutingRuleRow,
  context: RoutingContext,
): boolean {
  if (rule.match_tier !== null && rule.match_tier !== context.leadTier) {
    return false;
  }
  if (
    rule.match_score_min !== null &&
    context.leadScore < rule.match_score_min
  ) {
    return false;
  }
  if (
    rule.match_score_max !== null &&
    context.leadScore > rule.match_score_max
  ) {
    return false;
  }
  return rule.round_robin_pool !== null && rule.round_robin_pool.length > 0;
}

export function matchesAvailability(
  _rule: RoutingRuleRow,
  _context: RoutingContext,
): boolean {
  return true;
}

export function matchesCondition(
  rule: RoutingRuleRow,
  context: RoutingContext,
): boolean {
  switch (rule.routing_strategy) {
    case 'direct':
      return matchesDirect(rule, context);
    case 'skill':
      return matchesSkill(rule, context);
    case 'geographic':
      return matchesGeographic(rule, context);
    case 'value':
      return matchesValue(rule, context);
    case 'round_robin':
      return matchesRoundRobin(rule, context);
    case 'availability':
      return matchesAvailability(rule, context);
    default:
      return false;
  }
}
