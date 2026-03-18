-- Create webhook endpoints table
CREATE TABLE webhook_endpoints (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id        UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  url               TEXT NOT NULL,
  events            TEXT[] NOT NULL DEFAULT '{submission.created}',
  is_active         BOOLEAN NOT NULL DEFAULT TRUE,
  secret            TEXT NOT NULL,
  last_triggered_at TIMESTAMPTZ,
  last_status_code  INT,
  failure_count     INT NOT NULL DEFAULT 0,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
