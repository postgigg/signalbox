-- Migration 031: Predictive scoring support
-- Adds composite scoring dimensions, visitor behavioral tracking, and score history

-- New columns on submissions for composite scoring
ALTER TABLE submissions
  ADD COLUMN form_score INT,
  ADD COLUMN behavioral_score INT NOT NULL DEFAULT 0,
  ADD COLUMN intent_score INT NOT NULL DEFAULT 0,
  ADD COLUMN decay_penalty INT NOT NULL DEFAULT 0,
  ADD COLUMN score_dimensions JSONB NOT NULL DEFAULT '{}',
  ADD COLUMN last_engagement_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ADD COLUMN visitor_fingerprint TEXT,
  ADD COLUMN routing_strategy TEXT;

-- Backfill form_score from existing lead_score
UPDATE submissions SET form_score = lead_score WHERE form_score IS NULL;
ALTER TABLE submissions ALTER COLUMN form_score SET NOT NULL;

-- Scoring config on accounts
ALTER TABLE accounts
  ADD COLUMN scoring_config JSONB NOT NULL DEFAULT '{
    "formWeight": 0.60,
    "behavioralWeight": 0.20,
    "intentWeight": 0.20,
    "decayRatePerWeek": 5,
    "decayMax": 30,
    "decayEnabled": true,
    "highIntentPages": ["/pricing", "/demo", "/contact", "/compare"]
  }';

-- Visitor behavior sessions (pre-submission tracking)
CREATE TABLE visitor_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  widget_id UUID NOT NULL REFERENCES widgets(id) ON DELETE CASCADE,
  account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  visitor_fingerprint TEXT NOT NULL,
  session_number INT NOT NULL DEFAULT 1,
  pages_viewed INT NOT NULL DEFAULT 0,
  page_urls TEXT[] NOT NULL DEFAULT '{}',
  time_on_site_seconds INT NOT NULL DEFAULT 0,
  max_scroll_depth INT NOT NULL DEFAULT 0,
  widget_opens INT NOT NULL DEFAULT 0,
  pricing_page_views INT NOT NULL DEFAULT 0,
  high_intent_page_views INT NOT NULL DEFAULT 0,
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  submitted BOOLEAN NOT NULL DEFAULT FALSE,
  submission_id UUID REFERENCES submissions(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_visitor_sessions_widget_fp ON visitor_sessions(widget_id, visitor_fingerprint);
CREATE INDEX idx_visitor_sessions_submission ON visitor_sessions(submission_id) WHERE submission_id IS NOT NULL;

-- Score history (audit trail for decay/recalculation)
CREATE TABLE score_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id UUID NOT NULL REFERENCES submissions(id) ON DELETE CASCADE,
  account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  previous_score INT NOT NULL,
  new_score INT NOT NULL,
  previous_tier TEXT NOT NULL,
  new_tier TEXT NOT NULL,
  change_reason TEXT NOT NULL,
  dimensions JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_score_history_submission ON score_history(submission_id, created_at DESC);

-- Decay batch processing index
CREATE INDEX idx_submissions_decay ON submissions(account_id, last_engagement_at) WHERE lead_score > 0;

-- RLS for visitor_sessions
ALTER TABLE visitor_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can view own account visitor sessions"
  ON visitor_sessions FOR SELECT
  USING (account_id IN (SELECT account_id FROM members WHERE user_id = auth.uid()));

CREATE POLICY "Service role can insert visitor sessions"
  ON visitor_sessions FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Service role can update visitor sessions"
  ON visitor_sessions FOR UPDATE
  USING (true);

-- RLS for score_history
ALTER TABLE score_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can view own account score history"
  ON score_history FOR SELECT
  USING (account_id IN (SELECT account_id FROM members WHERE user_id = auth.uid()));

CREATE POLICY "Service role can insert score history"
  ON score_history FOR INSERT
  WITH CHECK (true);
