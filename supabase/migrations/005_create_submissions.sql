-- Create submissions table
CREATE TABLE submissions (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  widget_id           UUID NOT NULL REFERENCES widgets(id) ON DELETE CASCADE,
  account_id          UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  flow_version        INT NOT NULL,
  visitor_name        TEXT NOT NULL,
  visitor_email       TEXT NOT NULL,
  visitor_phone       TEXT,
  visitor_message     TEXT,
  answers             JSONB NOT NULL,
  raw_score           INT NOT NULL,
  lead_score          INT NOT NULL CHECK (lead_score BETWEEN 0 AND 100),
  lead_tier           TEXT NOT NULL CHECK (lead_tier IN ('hot', 'warm', 'cold')),
  source_url          TEXT,
  ip_address          INET,
  user_agent          TEXT,
  referrer            TEXT,
  utm_source          TEXT,
  utm_medium          TEXT,
  utm_campaign        TEXT,
  country             TEXT,
  device_type         TEXT CHECK (device_type IN ('desktop', 'mobile', 'tablet')),
  status              TEXT NOT NULL DEFAULT 'new'
                      CHECK (status IN ('new', 'viewed', 'contacted', 'qualified', 'disqualified', 'converted', 'archived')),
  viewed_at           TIMESTAMPTZ,
  contacted_at        TIMESTAMPTZ,
  notes               TEXT,
  notification_sent    BOOLEAN NOT NULL DEFAULT FALSE,
  notification_sent_at TIMESTAMPTZ,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER submissions_updated_at BEFORE UPDATE ON submissions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
