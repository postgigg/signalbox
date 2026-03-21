-- Drip email sequences for warm/cold lead nurture
-- Pro+ feature: auto-enroll warm/cold leads into timed email sequences

-- 1. Sequences table
CREATE TABLE drip_sequences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  target_tier TEXT NOT NULL CHECK (target_tier IN ('warm', 'cold')),
  is_active BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Steps table (2-5 steps per sequence)
CREATE TABLE drip_steps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sequence_id UUID NOT NULL REFERENCES drip_sequences(id) ON DELETE CASCADE,
  step_order INT NOT NULL CHECK (step_order BETWEEN 1 AND 5),
  delay_hours INT NOT NULL CHECK (delay_hours >= 1),
  subject TEXT NOT NULL,
  body_html TEXT NOT NULL,
  body_text TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(sequence_id, step_order)
);

-- 3. Enrollments table (tracks each lead through a sequence)
CREATE TABLE drip_enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sequence_id UUID NOT NULL REFERENCES drip_sequences(id) ON DELETE CASCADE,
  submission_id UUID NOT NULL REFERENCES submissions(id) ON DELETE CASCADE,
  account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  current_step INT NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'paused', 'cancelled')),
  enrolled_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_sent_at TIMESTAMPTZ,
  next_send_at TIMESTAMPTZ,
  paused_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(sequence_id, submission_id)
);

-- 4. Indexes
CREATE INDEX idx_drip_sequences_account ON drip_sequences(account_id);
CREATE INDEX idx_drip_sequences_account_tier ON drip_sequences(account_id, target_tier) WHERE is_active = TRUE;
CREATE INDEX idx_drip_steps_sequence ON drip_steps(sequence_id, step_order);
CREATE INDEX idx_drip_enrollments_account ON drip_enrollments(account_id);
CREATE INDEX idx_drip_enrollments_submission ON drip_enrollments(submission_id);
CREATE INDEX idx_drip_enrollments_active_next ON drip_enrollments(next_send_at)
  WHERE status = 'active' AND next_send_at IS NOT NULL;

-- 5. Updated_at triggers
CREATE TRIGGER set_drip_sequences_updated_at
  BEFORE UPDATE ON drip_sequences
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER set_drip_steps_updated_at
  BEFORE UPDATE ON drip_steps
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER set_drip_enrollments_updated_at
  BEFORE UPDATE ON drip_enrollments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- 6. RLS policies (same account-member pattern as ab_tests)
ALTER TABLE drip_sequences ENABLE ROW LEVEL SECURITY;
ALTER TABLE drip_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE drip_enrollments ENABLE ROW LEVEL SECURITY;

-- drip_sequences: account members can read, owner/admin can write
CREATE POLICY drip_sequences_select ON drip_sequences
  FOR SELECT USING (
    account_id IN (SELECT account_id FROM members WHERE user_id = auth.uid())
  );

CREATE POLICY drip_sequences_insert ON drip_sequences
  FOR INSERT WITH CHECK (
    account_id IN (
      SELECT account_id FROM members
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
    )
  );

CREATE POLICY drip_sequences_update ON drip_sequences
  FOR UPDATE USING (
    account_id IN (
      SELECT account_id FROM members
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
    )
  );

CREATE POLICY drip_sequences_delete ON drip_sequences
  FOR DELETE USING (
    account_id IN (
      SELECT account_id FROM members
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
    )
  );

-- drip_steps: accessible via sequence ownership
CREATE POLICY drip_steps_select ON drip_steps
  FOR SELECT USING (
    sequence_id IN (
      SELECT id FROM drip_sequences
      WHERE account_id IN (SELECT account_id FROM members WHERE user_id = auth.uid())
    )
  );

CREATE POLICY drip_steps_insert ON drip_steps
  FOR INSERT WITH CHECK (
    sequence_id IN (
      SELECT id FROM drip_sequences
      WHERE account_id IN (
        SELECT account_id FROM members
        WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
      )
    )
  );

CREATE POLICY drip_steps_update ON drip_steps
  FOR UPDATE USING (
    sequence_id IN (
      SELECT id FROM drip_sequences
      WHERE account_id IN (
        SELECT account_id FROM members
        WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
      )
    )
  );

CREATE POLICY drip_steps_delete ON drip_steps
  FOR DELETE USING (
    sequence_id IN (
      SELECT id FROM drip_sequences
      WHERE account_id IN (
        SELECT account_id FROM members
        WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
      )
    )
  );

-- drip_enrollments: account members can read
CREATE POLICY drip_enrollments_select ON drip_enrollments
  FOR SELECT USING (
    account_id IN (SELECT account_id FROM members WHERE user_id = auth.uid())
  );

CREATE POLICY drip_enrollments_insert ON drip_enrollments
  FOR INSERT WITH CHECK (
    account_id IN (
      SELECT account_id FROM members
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
    )
  );

CREATE POLICY drip_enrollments_update ON drip_enrollments
  FOR UPDATE USING (
    account_id IN (
      SELECT account_id FROM members
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
    )
  );
