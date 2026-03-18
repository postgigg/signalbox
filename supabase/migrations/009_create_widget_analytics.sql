-- Create widget analytics table
CREATE TABLE widget_analytics (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  widget_id       UUID NOT NULL REFERENCES widgets(id) ON DELETE CASCADE,
  account_id      UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  date            DATE NOT NULL,
  impressions     INT NOT NULL DEFAULT 0,
  opens           INT NOT NULL DEFAULT 0,
  step_1_views    INT NOT NULL DEFAULT 0,
  step_2_views    INT NOT NULL DEFAULT 0,
  step_3_views    INT NOT NULL DEFAULT 0,
  step_4_views    INT NOT NULL DEFAULT 0,
  step_5_views    INT NOT NULL DEFAULT 0,
  completions     INT NOT NULL DEFAULT 0,
  submissions     INT NOT NULL DEFAULT 0,
  hot_count       INT NOT NULL DEFAULT 0,
  warm_count      INT NOT NULL DEFAULT 0,
  cold_count      INT NOT NULL DEFAULT 0,
  avg_score       DECIMAL(5,2) DEFAULT 0,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(widget_id, date)
);

CREATE INDEX idx_analytics_account_date ON widget_analytics(account_id, date DESC);
