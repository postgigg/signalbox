-- Migration 036: Round-robin state tracking

CREATE TABLE round_robin_state (
  rule_id UUID PRIMARY KEY REFERENCES lead_routing_rules(id) ON DELETE CASCADE,
  account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  current_index INT NOT NULL DEFAULT 0,
  assignment_counts JSONB NOT NULL DEFAULT '{}',
  last_assigned_member_id UUID REFERENCES members(id) ON DELETE SET NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_round_robin_state_account ON round_robin_state(account_id);

ALTER TABLE round_robin_state ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can view own account round robin state"
  ON round_robin_state FOR SELECT
  USING (account_id IN (SELECT account_id FROM members WHERE user_id = auth.uid()));

CREATE POLICY "Service role can manage round robin state"
  ON round_robin_state FOR ALL
  USING (true);

-- Atomic round-robin advance function
CREATE OR REPLACE FUNCTION advance_round_robin(
  p_rule_id UUID,
  p_pool UUID[],
  p_max_leads JSONB DEFAULT '{}'
)
RETURNS UUID
LANGUAGE plpgsql
AS $$
DECLARE
  v_state round_robin_state%ROWTYPE;
  v_pool_size INT;
  v_next_idx INT;
  v_member_id UUID;
  v_attempts INT := 0;
  v_counts JSONB;
  v_member_count INT;
  v_member_max INT;
BEGIN
  v_pool_size := array_length(p_pool, 1);
  IF v_pool_size IS NULL OR v_pool_size = 0 THEN
    RETURN NULL;
  END IF;

  -- Lock the state row for atomic update
  SELECT * INTO v_state
  FROM round_robin_state
  WHERE rule_id = p_rule_id
  FOR UPDATE;

  -- Create state row if it does not exist
  IF NOT FOUND THEN
    INSERT INTO round_robin_state (rule_id, account_id, current_index, assignment_counts)
    SELECT p_rule_id, account_id, 0, '{}'::jsonb
    FROM lead_routing_rules
    WHERE id = p_rule_id
    RETURNING * INTO v_state;

    IF NOT FOUND THEN
      RETURN NULL;
    END IF;
  END IF;

  v_next_idx := v_state.current_index;
  v_counts := v_state.assignment_counts;

  -- Try each member in the pool (at most one full rotation)
  WHILE v_attempts < v_pool_size LOOP
    v_member_id := p_pool[1 + (v_next_idx % v_pool_size)];
    v_next_idx := v_next_idx + 1;
    v_attempts := v_attempts + 1;

    -- Check capacity if max_leads specified for this member
    IF p_max_leads ? v_member_id::text THEN
      v_member_max := (p_max_leads ->> v_member_id::text)::int;
      v_member_count := COALESCE((v_counts ->> v_member_id::text)::int, 0);
      IF v_member_count >= v_member_max THEN
        CONTINUE;
      END IF;
    END IF;

    -- Found a valid member: update state and return
    v_counts := jsonb_set(
      v_counts,
      ARRAY[v_member_id::text],
      to_jsonb(COALESCE((v_counts ->> v_member_id::text)::int, 0) + 1)
    );

    UPDATE round_robin_state
    SET current_index = v_next_idx,
        assignment_counts = v_counts,
        last_assigned_member_id = v_member_id,
        updated_at = NOW()
    WHERE rule_id = p_rule_id;

    RETURN v_member_id;
  END LOOP;

  -- All members at capacity
  RETURN NULL;
END;
$$;
