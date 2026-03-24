import { PLANS } from '@/lib/constants';
import type { Plan } from '@/lib/supabase/types';

interface PlanLimits {
  widgets: number;
  submissionsPerMonth: number;
  teamMembers: number;
  webhooks: number;
  apiKeys: number;
  flowSteps: number;
  customBranding: boolean;
  apiAccess: boolean;
  webhookAccess: boolean;
  advancedAnalytics: boolean;
  prioritySupport: boolean;
  leadRouting: boolean;
  abTesting: boolean;
  maxAbTests: number;
  sharedAnalytics: boolean;
  maxSharedLinks: number;
  dripSequences: boolean;
  maxDripSequences: number;
  predictiveScoring: boolean;
  advancedRouting: boolean;
  maxRoutingRules: number;
}

export function getPlanLimits(plan: Plan): PlanLimits {
  const config = PLANS[plan];
  if (!config) {
    throw new Error(`Unknown plan: ${plan}`);
  }
  return config.limits;
}
