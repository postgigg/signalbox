-- Submissions indexes
CREATE INDEX idx_submissions_account_id ON submissions(account_id);
CREATE INDEX idx_submissions_widget_id ON submissions(widget_id);
CREATE INDEX idx_submissions_lead_tier ON submissions(account_id, lead_tier);
CREATE INDEX idx_submissions_status ON submissions(account_id, status);
CREATE INDEX idx_submissions_created_at ON submissions(account_id, created_at DESC);
CREATE INDEX idx_submissions_lead_score ON submissions(account_id, lead_score DESC);
CREATE INDEX idx_submissions_email ON submissions(account_id, visitor_email);

-- Widget lookup
CREATE INDEX idx_widgets_account_id ON widgets(account_id);
CREATE INDEX idx_widgets_widget_key ON widgets(widget_key);

-- Members lookup
CREATE INDEX idx_members_user_id ON members(user_id);
CREATE INDEX idx_members_account_id ON members(account_id);

-- Flows lookup
CREATE INDEX idx_flows_widget_id ON flows(widget_id);

-- Webhook endpoints
CREATE INDEX idx_webhook_endpoints_account_id ON webhook_endpoints(account_id);
