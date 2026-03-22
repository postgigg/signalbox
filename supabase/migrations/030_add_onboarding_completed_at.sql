-- Add onboarding_completed_at to track whether user has completed the dashboard tour
ALTER TABLE accounts ADD COLUMN onboarding_completed_at TIMESTAMPTZ DEFAULT NULL;

-- Index for quick lookups (most queries filter on this being null)
CREATE INDEX idx_accounts_onboarding_completed ON accounts (onboarding_completed_at)
  WHERE onboarding_completed_at IS NULL;
