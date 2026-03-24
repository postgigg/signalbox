// Behavioral scoring thresholds and normalization ranges
export const BEHAVIORAL_THRESHOLDS = {
  pagesViewed: { min: 1, max: 10, weight: 0.25 },
  timeOnSiteSeconds: { min: 30, max: 300, weight: 0.30 },
  maxScrollDepth: { min: 10, max: 90, weight: 0.15 },
  widgetOpens: { min: 1, max: 5, weight: 0.15 },
  sessionCount: { min: 1, max: 5, weight: 0.15 },
} as const;

export const INTENT_THRESHOLDS = {
  pricingPageViews: { min: 0, max: 3, weight: 0.35 },
  highIntentPageViews: { min: 0, max: 5, weight: 0.25 },
  returnVisitCount: { min: 1, max: 5, weight: 0.25 },
  timeOnHighIntentPages: { min: 0, max: 120, weight: 0.15 },
} as const;

export const DECAY_GRACE_PERIOD_DAYS = 7;
export const DECAY_BATCH_SIZE = 100;
