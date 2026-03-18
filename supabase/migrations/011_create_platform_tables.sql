-- Platform metrics (Super Admin)
CREATE TABLE platform_metrics (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date                  DATE NOT NULL UNIQUE,
  total_accounts        INT NOT NULL DEFAULT 0,
  new_accounts          INT NOT NULL DEFAULT 0,
  churned_accounts      INT NOT NULL DEFAULT 0,
  trial_accounts        INT NOT NULL DEFAULT 0,
  starter_accounts      INT NOT NULL DEFAULT 0,
  pro_accounts          INT NOT NULL DEFAULT 0,
  agency_accounts       INT NOT NULL DEFAULT 0,
  mrr                   DECIMAL(10,2) DEFAULT 0,
  new_mrr               DECIMAL(10,2) DEFAULT 0,
  churned_mrr           DECIMAL(10,2) DEFAULT 0,
  expansion_mrr         DECIMAL(10,2) DEFAULT 0,
  total_submissions     INT NOT NULL DEFAULT 0,
  hot_submissions       INT NOT NULL DEFAULT 0,
  warm_submissions      INT NOT NULL DEFAULT 0,
  cold_submissions      INT NOT NULL DEFAULT 0,
  total_active_widgets  INT NOT NULL DEFAULT 0,
  total_impressions     INT NOT NULL DEFAULT 0,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Admin audit log
CREATE TABLE admin_audit_log (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_email TEXT NOT NULL,
  action      TEXT NOT NULL,
  target_type TEXT NOT NULL,
  target_id   UUID NOT NULL,
  details     JSONB,
  ip_address  INET,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_audit_log_date ON admin_audit_log(created_at DESC);
CREATE INDEX idx_audit_log_target ON admin_audit_log(target_type, target_id);

-- Platform settings
CREATE TABLE platform_settings (
  key         TEXT PRIMARY KEY,
  value       JSONB NOT NULL,
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO platform_settings (key, value) VALUES
  ('maintenance_mode', '{"enabled": false, "message": ""}'),
  ('signup_enabled', '{"enabled": true}'),
  ('trial_days', '{"days": 14}'),
  ('max_accounts_per_email', '{"limit": 3}'),
  ('widget_bundle_version', '{"version": "1.0.0"}'),
  ('global_rate_limits', '{"submit_per_min": 10, "config_per_min": 100}'),
  ('disposable_email_domains', '{"domains": ["tempmail.com", "guerrillamail.com"]}'),
  ('blocked_ips', '{"ips": []}'),
  ('blocked_domains', '{"domains": []}');

-- Email templates
CREATE TABLE email_templates (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug        TEXT UNIQUE NOT NULL,
  subject     TEXT NOT NULL,
  body_html   TEXT NOT NULL,
  body_text   TEXT NOT NULL,
  variables   TEXT[] NOT NULL DEFAULT '{}',
  is_active   BOOLEAN NOT NULL DEFAULT TRUE,
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
