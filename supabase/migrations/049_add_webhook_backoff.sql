-- Add exponential backoff support for webhook retries.
-- next_retry_at controls when the next retry attempt is allowed.

ALTER TABLE webhook_endpoints
  ADD COLUMN next_retry_at TIMESTAMPTZ;

-- Index for the retry cron query
CREATE INDEX idx_webhook_next_retry
  ON webhook_endpoints (next_retry_at)
  WHERE is_active = TRUE AND failure_count > 0;
