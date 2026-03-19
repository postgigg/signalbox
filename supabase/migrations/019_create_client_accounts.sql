CREATE TABLE client_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  contact_name TEXT,
  contact_email TEXT,
  notes TEXT,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(parent_account_id, slug)
);

ALTER TABLE widgets ADD COLUMN client_account_id UUID REFERENCES client_accounts(id) ON DELETE SET NULL;

-- RLS
ALTER TABLE client_accounts ENABLE ROW LEVEL SECURITY;

CREATE POLICY client_accounts_select ON client_accounts
  FOR SELECT USING (
    parent_account_id IN (
      SELECT account_id FROM members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY client_accounts_insert ON client_accounts
  FOR INSERT WITH CHECK (
    parent_account_id IN (
      SELECT account_id FROM members WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
    )
  );

CREATE POLICY client_accounts_update ON client_accounts
  FOR UPDATE USING (
    parent_account_id IN (
      SELECT account_id FROM members WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
    )
  );

CREATE POLICY client_accounts_delete ON client_accounts
  FOR DELETE USING (
    parent_account_id IN (
      SELECT account_id FROM members WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
    )
  );

-- Index for fast lookups
CREATE INDEX idx_client_accounts_parent ON client_accounts(parent_account_id);
CREATE INDEX idx_widgets_client_account ON widgets(client_account_id) WHERE client_account_id IS NOT NULL;
