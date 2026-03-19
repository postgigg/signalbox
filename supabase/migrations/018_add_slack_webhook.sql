ALTER TABLE accounts ADD COLUMN slack_webhook_url TEXT;

ALTER TABLE notification_preferences
  ADD COLUMN slack_on_hot_lead BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN slack_on_warm_lead BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN slack_on_cold_lead BOOLEAN NOT NULL DEFAULT FALSE;
