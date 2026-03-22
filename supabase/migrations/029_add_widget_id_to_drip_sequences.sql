-- Add widget_id to drip_sequences so sequences are per-widget, not per-account
ALTER TABLE drip_sequences
  ADD COLUMN widget_id UUID NOT NULL REFERENCES widgets(id) ON DELETE CASCADE;

-- Composite index for the active-sequence lookup used during enrollment
CREATE INDEX idx_drip_sequences_widget_tier
  ON drip_sequences (widget_id, target_tier)
  WHERE is_active = TRUE;
