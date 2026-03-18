-- Create notification preferences table
CREATE TABLE notification_preferences (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id              UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  member_id               UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  email_on_hot_lead       BOOLEAN NOT NULL DEFAULT TRUE,
  email_on_warm_lead      BOOLEAN NOT NULL DEFAULT TRUE,
  email_on_cold_lead      BOOLEAN NOT NULL DEFAULT FALSE,
  email_hot_followup      BOOLEAN NOT NULL DEFAULT TRUE,
  email_weekly_digest     BOOLEAN NOT NULL DEFAULT TRUE,
  email_trial_alerts      BOOLEAN NOT NULL DEFAULT TRUE,
  email_billing_alerts    BOOLEAN NOT NULL DEFAULT TRUE,
  created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(account_id, member_id)
);

CREATE TRIGGER notification_prefs_updated_at BEFORE UPDATE ON notification_preferences
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
