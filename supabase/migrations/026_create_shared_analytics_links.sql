-- Shared Analytics Links (Agency only)
-- Generate shareable read-only analytics dashboards scoped to clients or widgets.

CREATE TABLE shared_analytics_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  client_account_id UUID REFERENCES client_accounts(id) ON DELETE CASCADE,
  widget_id UUID REFERENCES widgets(id) ON DELETE CASCADE,
  token TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  expires_at TIMESTAMPTZ,
  password_hash TEXT,
  allowed_metrics TEXT[] NOT NULL DEFAULT '{submissions,tier_breakdown,conversion_rate,over_time}',
  last_accessed_at TIMESTAMPTZ,
  access_count INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- RLS
ALTER TABLE shared_analytics_links ENABLE ROW LEVEL SECURITY;

CREATE POLICY "shared_analytics_links_select" ON shared_analytics_links
  FOR SELECT USING (
    account_id IN (SELECT account_id FROM members WHERE user_id = auth.uid())
  );

CREATE POLICY "shared_analytics_links_insert" ON shared_analytics_links
  FOR INSERT WITH CHECK (
    account_id IN (SELECT account_id FROM members WHERE user_id = auth.uid() AND role IN ('owner', 'admin'))
  );

CREATE POLICY "shared_analytics_links_update" ON shared_analytics_links
  FOR UPDATE USING (
    account_id IN (SELECT account_id FROM members WHERE user_id = auth.uid() AND role IN ('owner', 'admin'))
  );

CREATE POLICY "shared_analytics_links_delete" ON shared_analytics_links
  FOR DELETE USING (
    account_id IN (SELECT account_id FROM members WHERE user_id = auth.uid() AND role IN ('owner', 'admin'))
  );

-- Indexes
CREATE INDEX idx_shared_analytics_links_account ON shared_analytics_links(account_id);
CREATE INDEX idx_shared_analytics_links_token ON shared_analytics_links(token);
CREATE INDEX idx_shared_analytics_links_client ON shared_analytics_links(client_account_id);

-- updated_at trigger
CREATE TRIGGER set_shared_analytics_links_updated_at
  BEFORE UPDATE ON shared_analytics_links
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();
