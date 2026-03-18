-- Support tickets table
CREATE TABLE IF NOT EXISTS support_tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID REFERENCES accounts(id) ON DELETE SET NULL,
  requester_email TEXT NOT NULL,
  requester_name TEXT NOT NULL,
  subject TEXT NOT NULL CHECK (char_length(subject) <= 300),
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'pending', 'resolved', 'closed')),
  priority TEXT NOT NULL DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  category TEXT NOT NULL DEFAULT 'general' CHECK (category IN ('billing', 'technical', 'general', 'bug', 'feature_request')),
  assigned_to TEXT,
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes for support_tickets
CREATE INDEX idx_support_tickets_status ON support_tickets(status);
CREATE INDEX idx_support_tickets_priority ON support_tickets(priority);
CREATE INDEX idx_support_tickets_account_id ON support_tickets(account_id);
CREATE INDEX idx_support_tickets_created_at ON support_tickets(created_at DESC);

-- Ticket messages table
CREATE TABLE IF NOT EXISTS ticket_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id UUID NOT NULL REFERENCES support_tickets(id) ON DELETE CASCADE,
  sender_type TEXT NOT NULL CHECK (sender_type IN ('customer', 'admin')),
  sender_email TEXT NOT NULL,
  body TEXT NOT NULL CHECK (char_length(body) <= 5000),
  is_internal_note BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index for ticket_messages
CREATE INDEX idx_ticket_messages_ticket_created ON ticket_messages(ticket_id, created_at ASC);

-- Updated_at trigger for support_tickets
CREATE OR REPLACE FUNCTION update_support_tickets_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_support_tickets_updated_at
  BEFORE UPDATE ON support_tickets
  FOR EACH ROW
  EXECUTE FUNCTION update_support_tickets_updated_at();

-- RLS (admin-only access via service role, no user-facing RLS needed)
ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticket_messages ENABLE ROW LEVEL SECURITY;

-- Allow service role full access (admin API uses service role key)
CREATE POLICY "Service role full access on support_tickets"
  ON support_tickets FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Service role full access on ticket_messages"
  ON ticket_messages FOR ALL
  USING (true)
  WITH CHECK (true);
