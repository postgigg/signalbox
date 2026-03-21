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
    advancedAnalytics: boolean;
    prioritySupport: boolean;
    leadRouting: boolean;
    abTesting: boolean;
    maxAbTests: number;
    sharedAnalytics: boolean;
    maxSharedLinks: number;
    dripSequences: boolean;
    maxDripSequences: number;
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
      advancedAnalytics: false,
      prioritySupport: false,
      leadRouting: false,
      abTesting: false,
      maxAbTests: 0,
      sharedAnalytics: false,
      maxSharedLinks: 0,
      dripSequences: false,
      maxDripSequences: 0,
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
      advancedAnalytics: false,
      prioritySupport: false,
      leadRouting: false,
      abTesting: false,
      maxAbTests: 0,
      sharedAnalytics: false,
      maxSharedLinks: 0,
      dripSequences: false,
      maxDripSequences: 0,
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
      advancedAnalytics: true,
      prioritySupport: false,
      leadRouting: true,
      abTesting: true,
      maxAbTests: 5,
      sharedAnalytics: false,
      maxSharedLinks: 0,
      dripSequences: true,
      maxDripSequences: 3,
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
      advancedAnalytics: true,
      prioritySupport: true,
      leadRouting: true,
      abTesting: true,
      maxAbTests: 10,
      sharedAnalytics: true,
      maxSharedLinks: 25,
      dripSequences: true,
      maxDripSequences: 10,
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
  webhook_test: {
    tokens: 5,
    window: '1 m' as const,
    prefix: 'rl:webhook_test',
  },
  shared_analytics: {
    tokens: 30,
    window: '1 m' as const,
    prefix: 'rl:shared_analytics',
  },
  shared_analytics_password: {
    tokens: 5,
    window: '1 m' as const,
    prefix: 'rl:shared_analytics_pw',
  },
} as const;

// ---------------------------------------------------------------------------
// Support ticket constants
// ---------------------------------------------------------------------------

export const TICKET_STATUSES = [
  { value: 'open', label: 'Open' },
  { value: 'pending', label: 'Pending' },
  { value: 'resolved', label: 'Resolved' },
  { value: 'closed', label: 'Closed' },
] as const;

export const TICKET_PRIORITIES = [
  { value: 'low', label: 'Low' },
  { value: 'normal', label: 'Normal' },
  { value: 'high', label: 'High' },
  { value: 'urgent', label: 'Urgent' },
] as const;

export const TICKET_CATEGORIES = [
  { value: 'billing', label: 'Billing' },
  { value: 'technical', label: 'Technical' },
  { value: 'general', label: 'General' },
  { value: 'bug', label: 'Bug' },
  { value: 'feature_request', label: 'Feature Request' },
] as const;

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

// ---------------------------------------------------------------------------
// Attention grabber defaults (Pro+)
// ---------------------------------------------------------------------------

export const DEFAULT_ATTENTION_GRABBER = {
  teaserText: 'See how you qualify in 30 seconds',
  teaserDelayMs: 3000,
  pulseDelayMs: 8000,
  scrollNudgeText: 'Quick question before you go?',
  scrollThreshold: 40,
  exitIntentText: 'Wait! Get a personalized recommendation',
} as const;

// ---------------------------------------------------------------------------
// Drip sequence constants
// ---------------------------------------------------------------------------

export const DRIP_PAUSE_STATUSES = [
  'contacted',
  'qualified',
  'converted',
  'disqualified',
  'archived',
] as const;

export const DRIP_TEMPLATE_VARIABLES = [
  '{{visitor_name}}',
  '{{visitor_email}}',
  '{{lead_score}}',
  '{{lead_tier}}',
  '{{widget_name}}',
  '{{account_name}}',
] as const;

export const DRIP_DEFAULT_STEPS = [
  {
    stepOrder: 1,
    delayHours: 24,
    subject: 'Thanks for reaching out, {{visitor_name}}',
    bodyHtml: '<p>Hi {{visitor_name}},</p><p>Thank you for reaching out to {{account_name}}. We received your inquiry and wanted to let you know that our team will be in touch soon.</p><p>In the meantime, if you have any questions, feel free to reply to this email.</p><p>Best regards,<br/>The {{account_name}} Team</p>',
    bodyText: 'Hi {{visitor_name}},\n\nThank you for reaching out to {{account_name}}. We received your inquiry and wanted to let you know that our team will be in touch soon.\n\nIn the meantime, if you have any questions, feel free to reply to this email.\n\nBest regards,\nThe {{account_name}} Team',
  },
  {
    stepOrder: 2,
    delayHours: 72,
    subject: '{{visitor_name}}, still looking for help?',
    bodyHtml: '<p>Hi {{visitor_name}},</p><p>We wanted to check in and see if you still need help with your inquiry. At {{account_name}}, we are committed to finding the right solution for you.</p><p>If you would like to discuss your needs, simply reply to this email and we will get back to you promptly.</p><p>Best regards,<br/>The {{account_name}} Team</p>',
    bodyText: 'Hi {{visitor_name}},\n\nWe wanted to check in and see if you still need help with your inquiry. At {{account_name}}, we are committed to finding the right solution for you.\n\nIf you would like to discuss your needs, simply reply to this email and we will get back to you promptly.\n\nBest regards,\nThe {{account_name}} Team',
  },
  {
    stepOrder: 3,
    delayHours: 168,
    subject: 'One last thing, {{visitor_name}}',
    bodyHtml: '<p>Hi {{visitor_name}},</p><p>This is our last follow-up regarding your recent inquiry with {{account_name}}. We do not want you to miss out on the help you were looking for.</p><p>If your situation has changed or you have found what you need, no worries at all. But if you still need assistance, we are here for you. Just reply to this email or give us a call.</p><p>Best regards,<br/>The {{account_name}} Team</p>',
    bodyText: 'Hi {{visitor_name}},\n\nThis is our last follow-up regarding your recent inquiry with {{account_name}}. We do not want you to miss out on the help you were looking for.\n\nIf your situation has changed or you have found what you need, no worries at all. But if you still need assistance, we are here for you. Just reply to this email or give us a call.\n\nBest regards,\nThe {{account_name}} Team',
  },
] as const;

export const API_KEY_PREFIX = 'sb_live_';

export const PAGINATION_DEFAULT_PAGE_SIZE = 25;
export const PAGINATION_MAX_PAGE_SIZE = 100;

export const SUPPORT_EMAIL = 'support@hawkleads.io';
export const PRIORITY_SUPPORT_EMAIL = 'priority@hawkleads.io';
export const NO_REPLY_EMAIL = 'noreply@hawkleads.io';

export const APP_NAME = 'HawkLeads';
export const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://hawkleads.io';
export const WIDGET_CDN_URL =
  process.env.NEXT_PUBLIC_WIDGET_CDN_URL ?? 'https://cdn.hawkleads.io';
