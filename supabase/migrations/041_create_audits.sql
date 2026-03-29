-- Create audits table for the free lead capture audit tool
CREATE TABLE IF NOT EXISTS audits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  url TEXT NOT NULL,
  domain TEXT NOT NULL,
  scores JSONB NOT NULL,
  details JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for shareable lookup by ID (PK covers this)
-- Index for domain-based lookups / analytics
CREATE INDEX IF NOT EXISTS idx_audits_domain ON audits (domain);
CREATE INDEX IF NOT EXISTS idx_audits_created_at ON audits (created_at DESC);

-- No RLS needed: public read by ID, writes via service role only
ALTER TABLE audits ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read a specific audit by ID (for shareable links)
CREATE POLICY "Anyone can read audits by id"
  ON audits FOR SELECT
  USING (true);

-- Only service role can insert (no policy needed — service role bypasses RLS)
