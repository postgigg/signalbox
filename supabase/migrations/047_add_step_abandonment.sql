-- Add step abandonment tracking columns to widget_analytics.
-- Tracks how many visitors close the widget at each step.

ALTER TABLE widget_analytics
  ADD COLUMN step_1_abandons INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN step_2_abandons INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN step_3_abandons INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN step_4_abandons INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN step_5_abandons INTEGER NOT NULL DEFAULT 0;
