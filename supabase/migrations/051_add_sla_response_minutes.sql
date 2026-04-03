-- Add configurable SLA response time to accounts
ALTER TABLE accounts ADD COLUMN sla_response_minutes INTEGER NOT NULL DEFAULT 60;

COMMENT ON COLUMN accounts.sla_response_minutes IS 'Number of minutes before a hot lead followup alert is sent (default: 60)';
