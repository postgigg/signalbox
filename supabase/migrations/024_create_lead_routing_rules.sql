-- Lead Routing Rules (Pro+)
-- Auto-assign incoming leads to team members based on score tier or flow answers.

CREATE TABLE lead_routing_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  widget_id UUID REFERENCES widgets(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  priority INT NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  match_tier TEXT CHECK (match_tier IN ('hot', 'warm', 'cold')),
  match_step_id TEXT,
  match_option_id TEXT,
  assign_to_member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT at_least_one_match CHECK (
    match_tier IS NOT NULL OR (match_step_id IS NOT NULL AND match_option_id IS NOT NULL)
  )
);

-- New columns on submissions for assignment tracking
ALTER TABLE submissions ADD COLUMN assigned_to UUID REFERENCES members(id) ON DELETE SET NULL;
ALTER TABLE submissions ADD COLUMN assigned_at TIMESTAMPTZ;
ALTER TABLE submissions ADD COLUMN assigned_by_rule_id UUID REFERENCES lead_routing_rules(id) ON DELETE SET NULL;

-- RLS
ALTER TABLE lead_routing_rules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "lead_routing_rules_select" ON lead_routing_rules
  FOR SELECT USING (
    account_id IN (SELECT account_id FROM members WHERE user_id = auth.uid())
  );

CREATE POLICY "lead_routing_rules_insert" ON lead_routing_rules
  FOR INSERT WITH CHECK (
    account_id IN (SELECT account_id FROM members WHERE user_id = auth.uid() AND role IN ('owner', 'admin'))
  );

CREATE POLICY "lead_routing_rules_update" ON lead_routing_rules
  FOR UPDATE USING (
    account_id IN (SELECT account_id FROM members WHERE user_id = auth.uid() AND role IN ('owner', 'admin'))
  );

CREATE POLICY "lead_routing_rules_delete" ON lead_routing_rules
  FOR DELETE USING (
    account_id IN (SELECT account_id FROM members WHERE user_id = auth.uid() AND role IN ('owner', 'admin'))
  );

-- Indexes
CREATE INDEX idx_lead_routing_rules_account ON lead_routing_rules(account_id);
CREATE INDEX idx_lead_routing_rules_widget ON lead_routing_rules(widget_id);
CREATE INDEX idx_lead_routing_rules_active ON lead_routing_rules(account_id, is_active, priority DESC);
CREATE INDEX idx_submissions_assigned_to ON submissions(assigned_to);

-- updated_at trigger
CREATE TRIGGER set_lead_routing_rules_updated_at
  BEFORE UPDATE ON lead_routing_rules
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();
