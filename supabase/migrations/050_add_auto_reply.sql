-- Add auto_reply_enabled column to widgets table
ALTER TABLE widgets ADD COLUMN auto_reply_enabled BOOLEAN NOT NULL DEFAULT FALSE;

COMMENT ON COLUMN widgets.auto_reply_enabled IS 'When enabled, sends a confirmation email to the visitor after submission';
