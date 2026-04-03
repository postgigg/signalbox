-- Add business_hours JSONB column to widgets table
ALTER TABLE widgets ADD COLUMN business_hours JSONB DEFAULT NULL;

COMMENT ON COLUMN widgets.business_hours IS 'Business hours configuration: { enabled, timezone, schedule: { mon: { start, end }, ... }, offlineMessage }';
