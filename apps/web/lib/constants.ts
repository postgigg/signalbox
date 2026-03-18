// ---------------------------------------------------------------------------
// Plan definitions
// ---------------------------------------------------------------------------

export interface PlanConfig {
  id: 'trial' | 'starter' | 'pro' | 'agency';
  name: string;
  description: string;
  priceMonthly: number;
  priceYearly: number;
  stripePriceIdMonthly: string;
  stripePriceIdYearly: string;
  limits: {
    widgets: number;
    submissionsPerMonth: number;
    teamMembers: number;
    webhooks: number;
    apiKeys: number;
    flowSteps: number;
    customBranding: boolean;
    apiAccess: boolean;
    webhookAccess: boolean;
    prioritySupport: boolean;
  };
}

export const PLANS: Record<string, PlanConfig> = {
  trial: {
    id: 'trial',
    name: 'Trial',
    description: 'Free 14-day trial with full features',
    priceMonthly: 0,
    priceYearly: 0,
    stripePriceIdMonthly: '',
    stripePriceIdYearly: '',
    limits: {
      widgets: 1,
      submissionsPerMonth: 50,
      teamMembers: 1,
      webhooks: 0,
      apiKeys: 0,
      flowSteps: 3,
      customBranding: false,
      apiAccess: false,
      webhookAccess: false,
      prioritySupport: false,
    },
  },
  starter: {
    id: 'starter',
    name: 'Starter',
    description: 'For small teams getting started',
    priceMonthly: 99,
    priceYearly: 990,
    stripePriceIdMonthly: process.env.STRIPE_PRICE_STARTER_MONTHLY ?? '',
    stripePriceIdYearly: process.env.STRIPE_PRICE_STARTER_YEARLY ?? '',
    limits: {
      widgets: 1,
      submissionsPerMonth: 500,
      teamMembers: 3,
      webhooks: 1,
      apiKeys: 1,
      flowSteps: 5,
      customBranding: false,
      apiAccess: false,
      webhookAccess: true,
      prioritySupport: false,
    },
  },
  pro: {
    id: 'pro',
    name: 'Pro',
    description: 'For growing businesses',
    priceMonthly: 149,
    priceYearly: 1490,
    stripePriceIdMonthly: process.env.STRIPE_PRICE_PRO_MONTHLY ?? '',
    stripePriceIdYearly: process.env.STRIPE_PRICE_PRO_YEARLY ?? '',
    limits: {
      widgets: 5,
      submissionsPerMonth: 2000,
      teamMembers: 10,
      webhooks: 5,
      apiKeys: 5,
      flowSteps: 5,
      customBranding: true,
      apiAccess: true,
      webhookAccess: true,
      prioritySupport: false,
    },
  },
  agency: {
    id: 'agency',
    name: 'Agency',
    description: 'For agencies and large teams',
    priceMonthly: 249,
    priceYearly: 2490,
    stripePriceIdMonthly: process.env.STRIPE_PRICE_AGENCY_MONTHLY ?? '',
    stripePriceIdYearly: process.env.STRIPE_PRICE_AGENCY_YEARLY ?? '',
    limits: {
      widgets: 25,
      submissionsPerMonth: -1,
      teamMembers: 25,
      webhooks: 20,
      apiKeys: 20,
      flowSteps: 5,
      customBranding: true,
      apiAccess: true,
      webhookAccess: true,
      prioritySupport: true,
    },
  },
} as const;

export function getPlanConfig(planId: string): PlanConfig {
  const plan = PLANS[planId];
  if (!plan) {
    throw new Error(`Unknown plan: ${planId}`);
  }
  return plan;
}

// ---------------------------------------------------------------------------
// Tier colors and labels
// ---------------------------------------------------------------------------

export const TIER_CONFIG = {
  hot: {
    label: 'Hot',
    color: '#EF4444',
    bgColor: '#FEF2F2',
    textColor: '#991B1B',
    borderColor: '#FECACA',
    emoji: 'fire',
  },
  warm: {
    label: 'Warm',
    color: '#F59E0B',
    bgColor: '#FFFBEB',
    textColor: '#92400E',
    borderColor: '#FDE68A',
    emoji: 'sun',
  },
  cold: {
    label: 'Cold',
    color: '#3B82F6',
    bgColor: '#EFF6FF',
    textColor: '#1E40AF',
    borderColor: '#BFDBFE',
    emoji: 'snowflake',
  },
} as const;

// ---------------------------------------------------------------------------
// Submission statuses
// ---------------------------------------------------------------------------

export const SUBMISSION_STATUSES = [
  { value: 'new', label: 'New', color: '#3B82F6' },
  { value: 'viewed', label: 'Viewed', color: '#8B5CF6' },
  { value: 'contacted', label: 'Contacted', color: '#F59E0B' },
  { value: 'qualified', label: 'Qualified', color: '#10B981' },
  { value: 'disqualified', label: 'Disqualified', color: '#EF4444' },
  { value: 'converted', label: 'Converted', color: '#059669' },
  { value: 'archived', label: 'Archived', color: '#6B7280' },
] as const;

export type SubmissionStatusValue = (typeof SUBMISSION_STATUSES)[number]['value'];

// ---------------------------------------------------------------------------
// Widget positions
// ---------------------------------------------------------------------------

export const WIDGET_POSITIONS = [
  { value: 'bottom-right', label: 'Bottom Right' },
  { value: 'bottom-left', label: 'Bottom Left' },
  { value: 'bottom-center', label: 'Bottom Center' },
] as const;

// ---------------------------------------------------------------------------
// Trigger types
// ---------------------------------------------------------------------------

export const TRIGGER_TYPES = [
  { value: 'button', label: 'Button' },
  { value: 'tab', label: 'Tab' },
] as const;

// ---------------------------------------------------------------------------
// Trigger icons
// ---------------------------------------------------------------------------

export const TRIGGER_ICONS = [
  { value: 'arrow', label: 'Arrow' },
  { value: 'chat', label: 'Chat' },
  { value: 'plus', label: 'Plus' },
  { value: 'none', label: 'None' },
] as const;

// ---------------------------------------------------------------------------
// Button styles
// ---------------------------------------------------------------------------

export const BUTTON_STYLES = [
  { value: 'filled', label: 'Filled' },
  { value: 'outlined', label: 'Outlined' },
  { value: 'ghost', label: 'Ghost' },
] as const;

// ---------------------------------------------------------------------------
// Font families
// ---------------------------------------------------------------------------

export const FONT_FAMILIES = [
  { value: 'system', label: 'System Default' },
  { value: 'serif', label: 'Serif' },
  { value: 'sans', label: 'Sans' },
] as const;

// ---------------------------------------------------------------------------
// Industries
// ---------------------------------------------------------------------------

export const INDUSTRIES = [
  'SaaS',
  'E-commerce',
  'Agency',
  'Consulting',
  'Real Estate',
  'Healthcare',
  'Finance',
  'Education',
  'Legal',
  'Insurance',
  'Home Services',
  'Automotive',
  'Travel',
  'Fitness',
  'Restaurant',
  'Nonprofit',
  'Technology',
  'Manufacturing',
  'Retail',
  'Other',
] as const;

export type Industry = (typeof INDUSTRIES)[number];

// ---------------------------------------------------------------------------
// Member roles
// ---------------------------------------------------------------------------

export const MEMBER_ROLES = [
  { value: 'owner', label: 'Owner', description: 'Full access including billing' },
  { value: 'admin', label: 'Admin', description: 'Manage widgets, flows, and leads' },
  { value: 'viewer', label: 'Viewer', description: 'View leads and analytics only' },
] as const;

// ---------------------------------------------------------------------------
// Subscription statuses
// ---------------------------------------------------------------------------

export const SUBSCRIPTION_STATUSES = [
  { value: 'trialing', label: 'Trialing', color: '#8B5CF6' },
  { value: 'active', label: 'Active', color: '#10B981' },
  { value: 'past_due', label: 'Past Due', color: '#F59E0B' },
  { value: 'canceled', label: 'Canceled', color: '#EF4444' },
  { value: 'unpaid', label: 'Unpaid', color: '#EF4444' },
] as const;

// ---------------------------------------------------------------------------
// Rate limit configurations
// ---------------------------------------------------------------------------

export const RATE_LIMITS = {
  submit: {
    tokens: 10,
    window: '1 m' as const,
    prefix: 'rl:submit',
  },
  submit_global: {
    tokens: 3,
    window: '1 m' as const,
    prefix: 'rl:submit_global',
  },
  config: {
    tokens: 100,
    window: '1 m' as const,
    prefix: 'rl:config',
  },
  auth: {
    tokens: 5,
    window: '1 m' as const,
    prefix: 'rl:auth',
  },
  api: {
    tokens: 120,
    window: '1 m' as const,
    prefix: 'rl:api',
  },
  leads: {
    tokens: 30,
    window: '1 m' as const,
    prefix: 'rl:leads',
  },
  widgets_create: {
    tokens: 10,
    window: '1 m' as const,
    prefix: 'rl:widgets_create',
  },
} as const;

// ---------------------------------------------------------------------------
// Email template slugs
// ---------------------------------------------------------------------------

export const EMAIL_TEMPLATE_SLUGS = {
  NEW_LEAD_NOTIFICATION: 'new-lead-notification',
  HOT_LEAD_FOLLOWUP: 'hot-lead-followup',
  WELCOME: 'welcome',
  TRIAL_ENDING: 'trial-ending',
  TRIAL_EXPIRED: 'trial-expired',
  WEEKLY_DIGEST: 'weekly-digest',
  PAYMENT_FAILED: 'payment-failed',
  WEBHOOK_FAILURES: 'webhook-failures',
  MEMBER_INVITE: 'member-invite',
  PASSWORD_RESET: 'password-reset',
} as const;

// ---------------------------------------------------------------------------
// Webhook events
// ---------------------------------------------------------------------------

export const WEBHOOK_EVENTS = [
  'submission.created',
  'submission.updated',
  'lead.qualified',
  'lead.converted',
] as const;

export type WebhookEvent = (typeof WEBHOOK_EVENTS)[number];

// ---------------------------------------------------------------------------
// Default widget theme
// ---------------------------------------------------------------------------

export const DEFAULT_WIDGET_THEME = {
  mode: 'light' as const,
  primaryColor: '#0F172A',
  accentColor: '#3B82F6',
  backgroundColor: '#FFFFFF',
  textColor: '#1E293B',
  borderRadius: 12,
  fontFamily: 'system' as const,
  buttonStyle: 'filled' as const,
  position: 'bottom-right' as const,
  triggerType: 'button' as const,
  triggerText: 'Get Started',
  triggerIcon: 'arrow' as const,
  triggerOffsetX: 20,
  triggerOffsetY: 20,
  panelWidth: 400,
  showBranding: true,
  showSocialProof: false,
};

// ---------------------------------------------------------------------------
// Misc constants
// ---------------------------------------------------------------------------

export const TRIAL_DURATION_DAYS = 14;

export const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

export const HONEYPOT_MIN_TIME_MS = 2000; // 2 seconds minimum form fill time

export const API_KEY_PREFIX = 'sb_live_';

export const PAGINATION_DEFAULT_PAGE_SIZE = 25;
export const PAGINATION_MAX_PAGE_SIZE = 100;

export const SUPPORT_EMAIL = 'support@signalbox.io';
export const NO_REPLY_EMAIL = 'noreply@signalbox.io';

export const APP_NAME = 'SignalBox';
export const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://app.signalbox.io';
export const WIDGET_CDN_URL =
  process.env.NEXT_PUBLIC_WIDGET_CDN_URL ?? 'https://cdn.signalbox.io';
