-- Migration 033: Member skill tags for skill-based routing

CREATE TABLE member_skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  skill_tag TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(member_id, skill_tag)
);

CREATE INDEX idx_member_skills_account ON member_skills(account_id);
CREATE INDEX idx_member_skills_member ON member_skills(member_id);
CREATE INDEX idx_member_skills_tag ON member_skills(account_id, skill_tag);

ALTER TABLE member_skills ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can view own account skills"
  ON member_skills FOR SELECT
  USING (account_id IN (SELECT account_id FROM members WHERE user_id = auth.uid()));

CREATE POLICY "Admins can manage account skills"
  ON member_skills FOR ALL
  USING (account_id IN (
    SELECT account_id FROM members WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
  ));
