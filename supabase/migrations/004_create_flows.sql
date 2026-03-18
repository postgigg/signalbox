-- Create flows table
CREATE TABLE flows (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  widget_id   UUID NOT NULL REFERENCES widgets(id) ON DELETE CASCADE,
  version     INT NOT NULL DEFAULT 1,
  is_active   BOOLEAN NOT NULL DEFAULT TRUE,
  steps       JSONB NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER flows_updated_at BEFORE UPDATE ON flows
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE UNIQUE INDEX one_active_flow_per_widget ON flows (widget_id) WHERE is_active = TRUE;
