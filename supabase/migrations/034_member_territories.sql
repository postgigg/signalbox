-- Migration 034: Member territories for geographic routing

CREATE TABLE member_territories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  country_code TEXT NOT NULL,
  region_name TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(member_id, country_code, region_name)
);

CREATE INDEX idx_member_territories_account ON member_territories(account_id);
CREATE INDEX idx_member_territories_member ON member_territories(member_id);
CREATE INDEX idx_member_territories_country ON member_territories(account_id, country_code);

ALTER TABLE member_territories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can view own account territories"
  ON member_territories FOR SELECT
  USING (account_id IN (SELECT account_id FROM members WHERE user_id = auth.uid()));

CREATE POLICY "Admins can manage account territories"
  ON member_territories FOR ALL
  USING (account_id IN (
    SELECT account_id FROM members WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
  ));
