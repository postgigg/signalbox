// ── Widget States ──────────────────────────────────────────────────────────
export type WidgetState =
  | 'idle'
  | 'loading'
  | 'ready'
  | 'open'
  | 'submitting'
  | 'booking'
  | 'complete'
  | 'error'
  | 'disabled';

// ── Theme Configuration ────────────────────────────────────────────────────
export interface WidgetTheme {
  mode: 'light' | 'dark';
  primaryColor: string;
  accentColor: string;
  backgroundColor: string;
  textColor: string;
  borderRadius: number;
  fontFamily: 'system' | 'serif' | 'sans';
  buttonStyle: 'filled';
  position: 'bottom-right' | 'bottom-left' | 'bottom-center';
  triggerType: 'button' | 'tab';
  triggerText: string;
  triggerIcon: 'arrow' | 'chat' | 'plus' | 'none';
  triggerOffsetX: number;
  triggerOffsetY: number;
  panelWidth: number;
  showBranding: boolean;
  showSocialProof: boolean;
}

// ── Flow Data ──────────────────────────────────────────────────────────────
export interface FlowStep {
  id: string;
  order: number;
  question: string;
  description?: string;
  type: 'single_select';
  options: FlowOption[];
}

export interface FlowOption {
  id: string;
  label: string;
  icon?: string;
  scoreWeight: number;
}

// ── Attention Grabber Configuration ───────────────────────────────────────
export interface AttentionGrabberConfig {
  enabled: boolean;
  teaserText: string;
  teaserDelayMs: number;
  pulseDelayMs: number;
  scrollNudgeText: string;
  scrollThreshold: number;
  exitIntentText: string;
}

// ── A/B Test Configuration ────────────────────────────────────────────────
export interface AbTestConfig {
  testId: string;
  targetStepId: string;
  trafficSplit: number;
  variantB: {
    question: string;
    options: FlowOption[];
  };
}

// ── Widget Configuration ───────────────────────────────────────────────────
export interface WidgetConfig {
  widgetKey: string;
  theme: WidgetTheme;
  steps: FlowStep[];
  flowVersion: number;
  confirmation: {
    hot: ConfirmationConfig;
    warm: ConfirmationConfig;
    cold: ConfirmationConfig;
  };
  contactShowPhone: boolean;
  contactPhoneRequired: boolean;
  contactShowMessage: boolean;
  contactMessageRequired: boolean;
  contactMessagePlaceholder: string;
  contactSubmitText: string;
  socialProofText: string;
  socialProofMin: number;
  submissionCount: number;
  isOpen: boolean;
  offlineMessage: string;
  abTest?: AbTestConfig;
  attentionGrabber?: AttentionGrabberConfig;
}

export interface ConfirmationConfig {
  headline: string;
  body: string;
  ctaText: string | null;
  ctaUrl: string | null;
}

// ── Answers & Contact ──────────────────────────────────────────────────────
export interface WidgetAnswer {
  stepId: string;
  optionId: string;
  question: string;
  label: string;
  scoreWeight: number;
}

export interface ContactInfo {
  name: string;
  email: string;
  phone?: string;
  message?: string;
}

// ── Behavioral Tracking ──────────────────────────────────────────────────
export interface BehavioralSessionData {
  pagesViewed: number;
  pageUrls: string[];
  timeOnSiteSeconds: number;
  maxScrollDepth: number;
  widgetOpens: number;
  sessionNumber: number;
  pricingPageViews: number;
  highIntentPageViews: number;
}

// ── Submission ─────────────────────────────────────────────────────────────
export interface SubmitPayload {
  widgetKey: string;
  answers: Array<{ stepId: string; optionId: string }>;
  visitorName: string;
  visitorEmail: string;
  visitorPhone?: string;
  visitorMessage?: string;
  challengeToken: string;
  loadedAt: number;
  honeypot?: string;
  sourceUrl: string;
  referrer: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  abTestId?: string;
  abVariant?: 'a' | 'b';
  behavioralData?: BehavioralSessionData;
  visitorFingerprint?: string;
  trackingBlocked?: boolean;
}

export interface SubmitResponse {
  tier: 'hot' | 'warm' | 'cold';
  id?: string;
  score?: number;
  gated?: boolean;
  booking?: {
    enabled: boolean;
    headingText: string;
    slotDuration: number;
    timezone: string;
  };
}

// ── Booking Types ────────────────────────────────────────────────────────
export interface BookingConfig {
  enabled: boolean;
  headingText: string;
  slotDuration: number;
  timezone: string;
}

export interface BookingTimeSlot {
  start: string;
  end: string;
  startsAt: string;
  endsAt: string;
}

export interface BookingDaySlots {
  date: string;
  dayLabel: string;
  slots: BookingTimeSlot[];
}

export interface SlotsResponse {
  timezone: string;
  slots: BookingDaySlots[];
}

export interface CreateBookingPayload {
  submissionId: string;
  startsAt: string;
  visitorName: string;
  visitorEmail: string;
  visitorPhone?: string;
}

export interface BookingResponse {
  bookingId: string;
  startsAt: string;
  endsAt: string;
  timezone: string;
}

// ── Validation ─────────────────────────────────────────────────────────────
export interface ValidationErrors {
  name?: string;
  email?: string;
  phone?: string;
  message?: string;
}

// ── State Machine Context ──────────────────────────────────────────────────
export interface WidgetContext {
  state: WidgetState;
  config: WidgetConfig | null;
  currentStepIndex: number;
  answers: WidgetAnswer[];
  contact: ContactInfo;
  errorMessage: string;
  loadedAt: number;
  resultTier: 'hot' | 'warm' | 'cold' | null;
  submissionId: string | null;
  bookingConfig: BookingConfig | null;
  bookingResult: BookingResponse | null;
}

// ── Global Config ──────────────────────────────────────────────────────────
export interface HawkLeadsWindowConfig {
  key: string;
  apiUrl?: string;
}

// Extend Window
declare global {
  interface Window {
    HawkLeadsConfig?: HawkLeadsWindowConfig;
  }
}
