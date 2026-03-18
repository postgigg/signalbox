-- Create accounts table
CREATE TABLE accounts (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name                  TEXT NOT NULL,
  slug                  TEXT UNIQUE NOT NULL,
  owner_id              UUID NOT NULL REFERENCES auth.users(id),
  plan                  TEXT NOT NULL DEFAULT 'trial'
                        CHECK (plan IN ('trial', 'starter', 'pro', 'agency')),
  stripe_customer_id    TEXT UNIQUE,
  stripe_subscription_id TEXT UNIQUE,
  subscription_status   TEXT DEFAULT 'trialing'
                        CHECK (subscription_status IN ('trialing', 'active', 'past_due', 'canceled', 'unpaid')),
  trial_ends_at         TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '14 days'),
  hot_lead_threshold    INT NOT NULL DEFAULT 70 CHECK (hot_lead_threshold BETWEEN 1 AND 100),
  warm_lead_threshold   INT NOT NULL DEFAULT 40 CHECK (warm_lead_threshold BETWEEN 1 AND 99),
  timezone              TEXT NOT NULL DEFAULT 'America/New_York',
  notification_email    TEXT,
  webhook_secret        TEXT,
  branding_removed      BOOLEAN NOT NULL DEFAULT FALSE,
  is_suspended          BOOLEAN NOT NULL DEFAULT FALSE,
  suspended_reason      TEXT,
  suspended_at          TIMESTAMPTZ,
  deleted_at            TIMESTAMPTZ,
  internal_notes        TEXT,
  is_featured           BOOLEAN DEFAULT FALSE,
  referral_source       TEXT,
  lifetime_revenue      DECIMAL(10,2) DEFAULT 0,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT valid_thresholds CHECK (hot_lead_threshold > warm_lead_threshold)
);

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER accounts_updated_at BEFORE UPDATE ON accounts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
