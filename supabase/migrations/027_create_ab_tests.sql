-- A/B Testing on Flow Questions (Pro+)
-- Split test different flow step questions and options.

CREATE TABLE ab_tests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  widget_id UUID NOT NULL REFERENCES widgets(id) ON DELETE CASCADE,
  account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'running', 'paused', 'completed')),
  target_step_id TEXT NOT NULL,
  traffic_split INT NOT NULL DEFAULT 50 CHECK (traffic_split BETWEEN 1 AND 99),
  variant_b_question TEXT NOT NULL,
  variant_b_options JSONB NOT NULL,
  winner TEXT CHECK (winner IN ('a', 'b')),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE ab_test_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ab_test_id UUID NOT NULL REFERENCES ab_tests(id) ON DELETE CASCADE,
  variant TEXT NOT NULL CHECK (variant IN ('a', 'b')),
  impressions INT NOT NULL DEFAULT 0,
  completions INT NOT NULL DEFAULT 0,
  submissions INT NOT NULL DEFAULT 0,
  total_score BIGINT NOT NULL DEFAULT 0,
  hot_count INT NOT NULL DEFAULT 0,
  warm_count INT NOT NULL DEFAULT 0,
  cold_count INT NOT NULL DEFAULT 0,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  UNIQUE(ab_test_id, variant, date)
);

-- New columns on submissions for A/B tracking
ALTER TABLE submissions ADD COLUMN ab_test_id UUID REFERENCES ab_tests(id) ON DELETE SET NULL;
ALTER TABLE submissions ADD COLUMN ab_variant TEXT CHECK (ab_variant IN ('a', 'b'));

-- RLS
ALTER TABLE ab_tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE ab_test_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "ab_tests_select" ON ab_tests
  FOR SELECT USING (
    account_id IN (SELECT account_id FROM members WHERE user_id = auth.uid())
  );

CREATE POLICY "ab_tests_insert" ON ab_tests
  FOR INSERT WITH CHECK (
    account_id IN (SELECT account_id FROM members WHERE user_id = auth.uid() AND role IN ('owner', 'admin'))
  );

CREATE POLICY "ab_tests_update" ON ab_tests
  FOR UPDATE USING (
    account_id IN (SELECT account_id FROM members WHERE user_id = auth.uid() AND role IN ('owner', 'admin'))
  );

CREATE POLICY "ab_tests_delete" ON ab_tests
  FOR DELETE USING (
    account_id IN (SELECT account_id FROM members WHERE user_id = auth.uid() AND role IN ('owner', 'admin'))
  );

CREATE POLICY "ab_test_results_select" ON ab_test_results
  FOR SELECT USING (
    ab_test_id IN (SELECT id FROM ab_tests WHERE account_id IN (SELECT account_id FROM members WHERE user_id = auth.uid()))
  );

-- Indexes
CREATE INDEX idx_ab_tests_widget ON ab_tests(widget_id);
CREATE INDEX idx_ab_tests_account ON ab_tests(account_id);
CREATE INDEX idx_ab_tests_running ON ab_tests(widget_id, status) WHERE status = 'running';
CREATE INDEX idx_ab_test_results_test ON ab_test_results(ab_test_id);
CREATE INDEX idx_ab_test_results_date ON ab_test_results(ab_test_id, date);
CREATE INDEX idx_submissions_ab_test ON submissions(ab_test_id);

-- updated_at trigger
CREATE TRIGGER set_ab_tests_updated_at
  BEFORE UPDATE ON ab_tests
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();
