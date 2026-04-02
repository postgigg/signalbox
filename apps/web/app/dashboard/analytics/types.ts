export interface AnalyticsData {
  date: string;
  impressions: number;
  opens: number;
  completions: number;
  submissions: number;
  hot_count: number;
  warm_count: number;
  cold_count: number;
  avg_score: number | null;
  step_1_views: number;
  step_2_views: number;
  step_3_views: number;
  step_4_views: number;
  step_5_views: number;
  step_1_abandons: number;
  step_2_abandons: number;
  step_3_abandons: number;
  step_4_abandons: number;
  step_5_abandons: number;
}

export interface AdvancedData {
  sourceBreakdown: Array<{ source: string; count: number }>;
  deviceBreakdown: Array<{ device: string; count: number }>;
  countryBreakdown: Array<{ country: string; count: number }>;
  stepDropoff: Array<{ step: number; views: number }>;
}
