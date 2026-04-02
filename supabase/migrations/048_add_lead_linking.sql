-- Add lead deduplication / linking support.
-- When the same visitor_email submits again for the same account,
-- link the new submission to the original.

ALTER TABLE submissions
  ADD COLUMN linked_submission_id UUID REFERENCES submissions(id) ON DELETE SET NULL;

-- Index for fast email lookup during deduplication
CREATE INDEX idx_submissions_account_email
  ON submissions (account_id, visitor_email);

-- Index for finding linked submissions
CREATE INDEX idx_submissions_linked
  ON submissions (linked_submission_id)
  WHERE linked_submission_id IS NOT NULL;
