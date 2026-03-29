// Engagement scoring thresholds and normalization ranges
// Merged from behavioral + intent dimensions into a single engagement signal
export const ENGAGEMENT_THRESHOLDS = {
  pagesViewed: { min: 1, max: 10, weight: 0.15 },
  timeOnSiteSeconds: { min: 30, max: 300, weight: 0.20 },
  maxScrollDepth: { min: 10, max: 90, weight: 0.10 },
  widgetOpens: { min: 1, max: 5, weight: 0.10 },
  sessionCount: { min: 1, max: 5, weight: 0.10 },
  pricingPageViews: { min: 0, max: 3, weight: 0.15 },
  highIntentPageViews: { min: 0, max: 5, weight: 0.10 },
  returnVisitCount: { min: 1, max: 5, weight: 0.10 },
} as const;

export const DECAY_GRACE_PERIOD_DAYS = 7;
export const DECAY_BATCH_SIZE = 100;
