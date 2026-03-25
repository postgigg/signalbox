-- Inbound email inbox for support@hawkleads.io
CREATE TABLE IF NOT EXISTS inbound_emails (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id TEXT UNIQUE NOT NULL,
  from_email TEXT NOT NULL,
  from_name TEXT NOT NULL DEFAULT '',
  to_email TEXT NOT NULL,
  subject TEXT NOT NULL DEFAULT '(No subject)',
  body_html TEXT,
  body_text TEXT,
  cc TEXT,
  bcc TEXT,
  reply_to TEXT,
  spam_status TEXT,
  is_read BOOLEAN NOT NULL DEFAULT false,
  is_archived BOOLEAN NOT NULL DEFAULT false,
  is_starred BOOLEAN NOT NULL DEFAULT false,
  received_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_inbound_emails_received_at ON inbound_emails(received_at DESC);
CREATE INDEX idx_inbound_emails_unread ON inbound_emails(is_read) WHERE is_read = false;
CREATE INDEX idx_inbound_emails_archived ON inbound_emails(is_archived);
CREATE INDEX idx_inbound_emails_from ON inbound_emails(from_email);

ALTER TABLE inbound_emails ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access on inbound_emails"
  ON inbound_emails FOR ALL
  USING (true)
  WITH CHECK (true);
