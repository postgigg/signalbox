-- Add followup_sent columns to submissions for hot lead followup tracking.
-- The existing notification_sent column tracks the initial new-lead notification.
-- These new columns track the 1-hour followup reminder separately.

ALTER TABLE submissions
  ADD COLUMN followup_sent BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN followup_sent_at TIMESTAMPTZ;

-- Index for the hot-lead-followup cron query
CREATE INDEX idx_submissions_followup_pending
  ON submissions (lead_tier, status, followup_sent, created_at)
  WHERE lead_tier = 'hot' AND status = 'new' AND followup_sent = FALSE;
