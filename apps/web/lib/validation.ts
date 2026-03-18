import { z } from 'zod';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Strips all HTML tags from a string. */
export function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '').trim();
}

/** Validates a hex color code (#RGB or #RRGGBB). */
const hexColorSchema = z
  .string()
  .regex(/^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/, 'Invalid hex color');

/** Reusable email schema. */
const emailSchema = z
  .string()
  .min(1, 'Email is required')
  .max(320, 'Email too long')
  .email('Invalid email address')
  .transform((v) => v.toLowerCase().trim());

/** Reusable UUID schema. */
const uuidSchema = z.string().uuid('Invalid UUID');

// ---------------------------------------------------------------------------
// Submission / Widget-facing schemas
// ---------------------------------------------------------------------------

const answerSchema = z.object({
  stepId: z.string().min(1),
  optionId: z.string().min(1),
  question: z.string().max(500),
  label: z.string().max(500),
});

export const submitSchema = z.object({
  widgetKey: z.string().min(1, 'Widget key is required').max(64),
  visitorName: z
    .string()
    .min(1, 'Name is required')
    .max(200, 'Name is too long')
    .transform((v) => stripHtml(v).trim()),
  visitorEmail: emailSchema,
  visitorPhone: z
    .string()
    .max(30, 'Phone number too long')
    .regex(/^[+\d\s().-]*$/, 'Invalid phone number')
    .optional()
    .nullable()
    .transform((v) => (v ? v.trim() : null)),
  visitorMessage: z
    .string()
    .max(2000, 'Message too long')
    .optional()
    .nullable()
    .transform((v) => (v ? stripHtml(v).trim() : null)),
  answers: z.array(answerSchema).min(1, 'At least one answer is required').max(10),
  sourceUrl: z.string().url().max(2048).optional().nullable(),
  referrer: z.string().max(2048).optional().nullable(),
  utmSource: z.string().max(200).optional().nullable(),
  utmMedium: z.string().max(200).optional().nullable(),
  utmCampaign: z.string().max(200).optional().nullable(),

  // Honeypot field — must be empty for legitimate submissions
  _hp: z
    .string()
    .max(0, 'Bot detected')
    .optional()
    .default(''),

  // Timing check — submission timestamp from the client (ms since epoch)
  _ts: z
    .number()
    .int()
    .optional(),

  // Turnstile / reCAPTCHA token
  token: z.string().max(4096).optional().nullable(),
});

export type SubmitInput = z.infer<typeof submitSchema>;

// ---------------------------------------------------------------------------
// Widget create / update
// ---------------------------------------------------------------------------

export const widgetThemeSchema = z.object({
  mode: z.enum(['light', 'dark']),
  primaryColor: hexColorSchema,
  accentColor: hexColorSchema,
  backgroundColor: hexColorSchema,
  textColor: hexColorSchema,
  borderRadius: z.number().int().min(0).max(24),
  fontFamily: z.enum(['system', 'serif', 'sans']),
  buttonStyle: z.enum(['filled', 'outlined', 'ghost']),
  position: z.enum(['bottom-right', 'bottom-left', 'bottom-center']),
  triggerType: z.enum(['button', 'tab']),
  triggerText: z.string().max(30).optional(),
  triggerIcon: z.enum(['arrow', 'chat', 'plus', 'none']),
  triggerOffsetX: z.number().int().min(0).max(100),
  triggerOffsetY: z.number().int().min(0).max(100),
  panelWidth: z.number().int().min(340).max(500),
  showBranding: z.boolean(),
  showSocialProof: z.boolean(),
});

export type WidgetTheme = z.infer<typeof widgetThemeSchema>;

const confirmationTierSchema = z.object({
  headline: z.string().max(100),
  body: z.string().max(300),
  ctaText: z.string().max(40).nullable().optional(),
  ctaUrl: z.string().url().max(2048).nullable().optional(),
});

const confirmationSchema = z.object({
  hot: confirmationTierSchema,
  warm: confirmationTierSchema,
  cold: confirmationTierSchema,
});

export type WidgetConfirmation = z.infer<typeof confirmationSchema>;

export const widgetCreateSchema = z.object({
  name: z
    .string()
    .min(1, 'Widget name is required')
    .max(100, 'Widget name too long')
    .transform((v) => stripHtml(v).trim()),
  domain: z
    .string()
    .max(253, 'Domain too long')
    .regex(
      /^([a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$/,
      'Invalid domain'
    )
    .optional()
    .nullable(),
  theme: widgetThemeSchema.optional(),
  confirmation: confirmationSchema.optional(),
  socialProofText: z.string().max(200).optional().nullable(),
  socialProofMin: z.number().int().min(0).max(10000).optional().nullable(),
  contactShowPhone: z.boolean().optional(),
  contactPhoneRequired: z.boolean().optional(),
  contactShowMessage: z.boolean().optional(),
  contactMessageRequired: z.boolean().optional(),
  contactMessagePlaceholder: z.string().max(100).optional().nullable(),
  contactSubmitText: z.string().max(40).optional().nullable(),
});

export type WidgetCreateInput = z.infer<typeof widgetCreateSchema>;

export const widgetUpdateSchema = widgetCreateSchema.partial().extend({
  isActive: z.boolean().optional(),
});

export type WidgetUpdateInput = z.infer<typeof widgetUpdateSchema>;

// ---------------------------------------------------------------------------
// Flow create / update
// ---------------------------------------------------------------------------

const flowOptionSchema = z.object({
  id: z.string().min(1).max(64),
  label: z.string().min(1).max(200),
  scoreWeight: z.number().int().min(-50).max(50),
  icon: z.string().max(50).optional().nullable(),
});

const flowStepSchema = z.object({
  id: z.string().min(1).max(64),
  question: z.string().min(1, 'Question is required').max(500),
  description: z.string().max(1000).optional().nullable(),
  options: z
    .array(flowOptionSchema)
    .min(2, 'At least 2 options required')
    .max(6, 'Maximum 6 options per step'),
});

export const flowCreateSchema = z.object({
  widgetId: uuidSchema,
  steps: z
    .array(flowStepSchema)
    .min(2, 'At least 2 steps required')
    .max(5, 'Maximum 5 steps per flow'),
});

export type FlowCreateInput = z.infer<typeof flowCreateSchema>;

export const flowUpdateSchema = z.object({
  steps: z
    .array(flowStepSchema)
    .min(2, 'At least 2 steps required')
    .max(5, 'Maximum 5 steps per flow')
    .optional(),
  isActive: z.boolean().optional(),
});

export type FlowUpdateInput = z.infer<typeof flowUpdateSchema>;

// ---------------------------------------------------------------------------
// Account create / update
// ---------------------------------------------------------------------------

export const accountCreateSchema = z.object({
  name: z
    .string()
    .min(1, 'Account name is required')
    .max(100, 'Account name too long')
    .transform((v) => stripHtml(v).trim()),
  slug: z
    .string()
    .min(2, 'Slug must be at least 2 characters')
    .max(60, 'Slug too long')
    .regex(
      /^[a-z0-9][a-z0-9-]*[a-z0-9]$/,
      'Slug must be lowercase letters, numbers, and hyphens'
    ),
  timezone: z.string().max(50).optional(),
  notificationEmail: emailSchema.optional().nullable(),
});

export type AccountCreateInput = z.infer<typeof accountCreateSchema>;

export const accountUpdateSchema = z.object({
  name: z
    .string()
    .min(1, 'Account name is required')
    .max(100, 'Account name too long')
    .transform((v) => stripHtml(v).trim())
    .optional(),
  timezone: z.string().max(50).optional(),
  notificationEmail: emailSchema.optional().nullable(),
  hotLeadThreshold: z.number().int().min(1).max(100).optional(),
  warmLeadThreshold: z.number().int().min(1).max(99).optional(),
});

export type AccountUpdateInput = z.infer<typeof accountUpdateSchema>;

// ---------------------------------------------------------------------------
// Lead / submission update
// ---------------------------------------------------------------------------

export const leadUpdateSchema = z.object({
  status: z
    .enum([
      'new',
      'viewed',
      'contacted',
      'qualified',
      'disqualified',
      'converted',
      'archived',
    ])
    .optional(),
  notes: z.string().max(5000).optional().nullable(),
});

export type LeadUpdateInput = z.infer<typeof leadUpdateSchema>;

// ---------------------------------------------------------------------------
// Webhook create / update
// ---------------------------------------------------------------------------

export const webhookCreateSchema = z.object({
  url: z
    .string()
    .url('Invalid URL')
    .max(2048)
    .refine(
      (url) => url.startsWith('https://'),
      'Webhook URL must use HTTPS'
    ),
  events: z
    .array(
      z.enum([
        'submission.created',
        'submission.updated',
        'lead.qualified',
        'lead.converted',
      ])
    )
    .min(1, 'At least one event is required')
    .max(10),
});

export type WebhookCreateInput = z.infer<typeof webhookCreateSchema>;

export const webhookUpdateSchema = webhookCreateSchema.partial().extend({
  isActive: z.boolean().optional(),
});

export type WebhookUpdateInput = z.infer<typeof webhookUpdateSchema>;

// ---------------------------------------------------------------------------
// API key create
// ---------------------------------------------------------------------------

export const apiKeyCreateSchema = z.object({
  name: z
    .string()
    .min(1, 'API key name is required')
    .max(100, 'Name too long')
    .transform((v) => stripHtml(v).trim()),
  expiresAt: z.string().datetime().optional().nullable(),
});

export type ApiKeyCreateInput = z.infer<typeof apiKeyCreateSchema>;

// ---------------------------------------------------------------------------
// Member invite
// ---------------------------------------------------------------------------

export const memberInviteSchema = z.object({
  email: emailSchema,
  role: z.enum(['admin', 'viewer']),
});

export type MemberInviteInput = z.infer<typeof memberInviteSchema>;

// ---------------------------------------------------------------------------
// Auth schemas
// ---------------------------------------------------------------------------

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(8, 'Password must be at least 8 characters').max(128),
});

export type LoginInput = z.infer<typeof loginSchema>;

export const signupSchema = z
  .object({
    email: emailSchema,
    password: z.string().min(8, 'Password must be at least 8 characters').max(128),
    confirmPassword: z.string(),
    fullName: z
      .string()
      .min(1, 'Full name is required')
      .max(200)
      .transform((v) => stripHtml(v).trim()),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export type SignupInput = z.infer<typeof signupSchema>;

export const forgotPasswordSchema = z.object({
  email: emailSchema,
});

export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;

export const resetPasswordSchema = z
  .object({
    password: z.string().min(8, 'Password must be at least 8 characters').max(128),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;

// ---------------------------------------------------------------------------
// Notification preferences
// ---------------------------------------------------------------------------

export const notificationPreferencesSchema = z.object({
  emailNewLead: z.boolean().optional(),
  emailHotLead: z.boolean().optional(),
  emailWeeklyDigest: z.boolean().optional(),
  emailPaymentIssues: z.boolean().optional(),
  emailWebhookFailures: z.boolean().optional(),
});

export type NotificationPreferencesInput = z.infer<
  typeof notificationPreferencesSchema
>;

// ---------------------------------------------------------------------------
// Admin schemas
// ---------------------------------------------------------------------------

export const adminAccountUpdateSchema = z.object({
  plan: z.enum(['trial', 'starter', 'pro', 'agency']).optional(),
  isSuspended: z.boolean().optional(),
  suspendedReason: z.string().max(1000).optional().nullable(),
  internalNotes: z.string().max(5000).optional().nullable(),
  isFeatured: z.boolean().optional(),
});

export type AdminAccountUpdateInput = z.infer<typeof adminAccountUpdateSchema>;
