-- Webhook Event Log
-- Tracks every webhook delivery attempt for debugging and monitoring.

CREATE TABLE webhook_event_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  webhook_endpoint_id UUID NOT NULL REFERENCES webhook_endpoints(id) ON DELETE CASCADE,
  event TEXT NOT NULL,
  request_body JSONB NOT NULL,
  response_status INT,
  response_body TEXT,
  duration_ms INT,
  success BOOLEAN NOT NULL DEFAULT FALSE,
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- RLS
ALTER TABLE webhook_event_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "webhook_event_log_select" ON webhook_event_log
  FOR SELECT USING (
    account_id IN (SELECT account_id FROM members WHERE user_id = auth.uid())
  );

CREATE POLICY "webhook_event_log_insert" ON webhook_event_log
  FOR INSERT WITH CHECK (
    account_id IN (SELECT account_id FROM members WHERE user_id = auth.uid() AND role IN ('owner', 'admin'))
  );

-- Indexes
CREATE INDEX idx_webhook_event_log_account ON webhook_event_log(account_id);
CREATE INDEX idx_webhook_event_log_endpoint ON webhook_event_log(webhook_endpoint_id);
CREATE INDEX idx_webhook_event_log_created ON webhook_event_log(account_id, created_at DESC);
