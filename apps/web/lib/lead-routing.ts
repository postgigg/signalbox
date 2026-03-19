import { createAdminClient } from '@/lib/supabase/admin';

import type { LeadTier } from '@/lib/supabase/types';

interface AnswerInput {
  readonly stepId: string;
  readonly optionId: string;
}

interface RoutingResult {
  readonly ruleId: string;
  readonly memberId: string;
}

/**
 * Evaluate routing rules for a submission and return the first matching rule.
 * Rules are ordered by priority DESC; first match wins.
 * Returns null if no rules match.
 */
export async function evaluateRoutingRules(
  accountId: string,
  widgetId: string,
  leadTier: LeadTier,
  answers: readonly AnswerInput[],
): Promise<RoutingResult | null> {
  const admin = createAdminClient();

  // Fetch active rules for this account, optionally scoped to widget
  // widget_id IS NULL means the rule applies to all widgets
  const { data: rules, error } = await admin
    .from('lead_routing_rules')
    .select('id, match_tier, match_step_id, match_option_id, assign_to_member_id, widget_id')
    .eq('account_id', accountId)
    .eq('is_active', true)
    .order('priority', { ascending: false });

  if (error || !rules || rules.length === 0) {
    return null;
  }

  interface RuleRow {
    id: string;
    match_tier: string | null;
    match_step_id: string | null;
    match_option_id: string | null;
    assign_to_member_id: string;
    widget_id: string | null;
  }

  // Filter to rules that apply to this widget (global or widget-specific)
  const applicableRules = (rules as RuleRow[]).filter((rule: RuleRow) =>
    rule.widget_id === null || rule.widget_id === widgetId
  );

  for (const rule of applicableRules) {
    // Tier-based match
    if (rule.match_tier !== null && rule.match_tier === leadTier) {
      return { ruleId: rule.id, memberId: rule.assign_to_member_id };
    }

    // Answer-based match
    if (rule.match_step_id !== null && rule.match_option_id !== null) {
      const matchingAnswer = answers.find(
        (a) => a.stepId === rule.match_step_id && a.optionId === rule.match_option_id,
      );
      if (matchingAnswer) {
        return { ruleId: rule.id, memberId: rule.assign_to_member_id };
      }
    }
  }

  return null;
}
