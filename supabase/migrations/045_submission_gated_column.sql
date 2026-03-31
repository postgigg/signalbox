-- Add gated column to submissions for free-plan cap gating
ALTER TABLE public.submissions ADD COLUMN IF NOT EXISTS gated boolean NOT NULL DEFAULT false;

-- Partial index for efficient gated lead queries
CREATE INDEX IF NOT EXISTS idx_submissions_gated
  ON public.submissions (account_id, gated) WHERE gated = true;
