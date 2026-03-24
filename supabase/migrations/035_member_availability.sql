-- Migration 035: Member availability for availability-based routing

CREATE TABLE member_availability (
  member_id UUID PRIMARY KEY REFERENCES members(id) ON DELETE CASCADE,
  account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'offline' CHECK (status IN ('online', 'offline', 'busy')),
  status_updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_active_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  auto_offline_minutes INT NOT NULL DEFAULT 30,
  max_active_leads INT DEFAULT 10,
  timezone TEXT NOT NULL DEFAULT 'UTC',
  schedule JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_member_availability_account ON member_availability(account_id);
CREATE INDEX idx_member_availability_status ON member_availability(account_id, status);

ALTER TABLE member_availability ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can view own account availability"
  ON member_availability FOR SELECT
  USING (account_id IN (SELECT account_id FROM members WHERE user_id = auth.uid()));

CREATE POLICY "Members can update own availability"
  ON member_availability FOR UPDATE
  USING (member_id IN (SELECT id FROM members WHERE user_id = auth.uid()));

CREATE POLICY "Admins can manage account availability"
  ON member_availability FOR ALL
  USING (account_id IN (
    SELECT account_id FROM members WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
  ));
