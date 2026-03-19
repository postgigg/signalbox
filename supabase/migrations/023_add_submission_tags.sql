-- Add tags column to submissions for lead categorization
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS tags TEXT[] NOT NULL DEFAULT '{}';

-- Index for tag-based filtering
CREATE INDEX IF NOT EXISTS idx_submissions_tags ON submissions USING GIN(tags);
