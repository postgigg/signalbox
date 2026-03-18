-- Create widgets table
CREATE TABLE widgets (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id        UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  widget_key        TEXT UNIQUE NOT NULL DEFAULT encode(extensions.gen_random_bytes(12), 'hex'),
  name              TEXT NOT NULL DEFAULT 'My Widget',
  domain            TEXT,
  is_active         BOOLEAN NOT NULL DEFAULT TRUE,
  theme             JSONB NOT NULL DEFAULT '{
    "mode": "light",
    "primaryColor": "#0F172A",
    "accentColor": "#3B82F6",
    "backgroundColor": "#FFFFFF",
    "textColor": "#1E293B",
    "borderRadius": 12,
    "fontFamily": "system",
    "buttonStyle": "filled",
    "position": "bottom-right",
    "triggerType": "button",
    "triggerText": "Get Started",
    "triggerIcon": "arrow",
    "triggerOffsetX": 20,
    "triggerOffsetY": 20,
    "panelWidth": 400,
    "showBranding": true,
    "showSocialProof": false
  }'::jsonb,
  confirmation      JSONB NOT NULL DEFAULT '{
    "hot": {"headline":"You are a priority!","body":"Expect to hear from us within 1 business hour.","ctaText":null,"ctaUrl":null},
    "warm": {"headline":"Thanks for reaching out!","body":"A team member will review your request and get back to you within 24 hours.","ctaText":null,"ctaUrl":null},
    "cold": {"headline":"Thanks for your interest!","body":"We will send you some helpful resources to get started.","ctaText":null,"ctaUrl":null}
  }'::jsonb,
  social_proof_text     TEXT DEFAULT 'businesses qualified this month',
  social_proof_min      INT DEFAULT 10,
  contact_show_phone    BOOLEAN DEFAULT TRUE,
  contact_phone_required BOOLEAN DEFAULT FALSE,
  contact_show_message  BOOLEAN DEFAULT TRUE,
  contact_message_required BOOLEAN DEFAULT FALSE,
  contact_message_placeholder TEXT DEFAULT 'Anything else we should know?',
  contact_submit_text   TEXT DEFAULT 'Submit',
  submission_count      INT NOT NULL DEFAULT 0,
  submission_limit      INT NOT NULL DEFAULT 500,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER widgets_updated_at BEFORE UPDATE ON widgets
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
