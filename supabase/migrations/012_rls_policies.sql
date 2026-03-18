-- Enable RLS on all user-data tables
ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE members ENABLE ROW LEVEL SECURITY;
ALTER TABLE widgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE flows ENABLE ROW LEVEL SECURITY;
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhook_endpoints ENABLE ROW LEVEL SECURITY;
ALTER TABLE widget_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;

-- Accounts
CREATE POLICY accounts_select ON accounts FOR SELECT
  USING (id IN (SELECT account_id FROM members WHERE user_id = auth.uid()));
CREATE POLICY accounts_update ON accounts FOR UPDATE
  USING (id IN (SELECT account_id FROM members WHERE user_id = auth.uid() AND role = 'owner'));
CREATE POLICY accounts_insert ON accounts FOR INSERT
  WITH CHECK (owner_id = auth.uid());

-- Members
CREATE POLICY members_select ON members FOR SELECT
  USING (account_id IN (SELECT account_id FROM members m2 WHERE m2.user_id = auth.uid()));
CREATE POLICY members_insert ON members FOR INSERT
  WITH CHECK (account_id IN (SELECT account_id FROM members m2 WHERE m2.user_id = auth.uid() AND m2.role IN ('owner', 'admin')));
CREATE POLICY members_update ON members FOR UPDATE
  USING (account_id IN (SELECT account_id FROM members m2 WHERE m2.user_id = auth.uid() AND m2.role IN ('owner', 'admin')));
CREATE POLICY members_delete ON members FOR DELETE
  USING (account_id IN (SELECT account_id FROM members m2 WHERE m2.user_id = auth.uid() AND m2.role IN ('owner', 'admin')));

-- Widgets
CREATE POLICY widgets_select ON widgets FOR SELECT
  USING (account_id IN (SELECT account_id FROM members WHERE user_id = auth.uid()));
CREATE POLICY widgets_insert ON widgets FOR INSERT
  WITH CHECK (account_id IN (SELECT account_id FROM members WHERE user_id = auth.uid() AND role IN ('owner', 'admin')));
CREATE POLICY widgets_update ON widgets FOR UPDATE
  USING (account_id IN (SELECT account_id FROM members WHERE user_id = auth.uid() AND role IN ('owner', 'admin')));
CREATE POLICY widgets_delete ON widgets FOR DELETE
  USING (account_id IN (SELECT account_id FROM members WHERE user_id = auth.uid() AND role IN ('owner', 'admin')));

-- Flows
CREATE POLICY flows_select ON flows FOR SELECT
  USING (widget_id IN (SELECT id FROM widgets WHERE account_id IN (SELECT account_id FROM members WHERE user_id = auth.uid())));
CREATE POLICY flows_insert ON flows FOR INSERT
  WITH CHECK (widget_id IN (SELECT id FROM widgets WHERE account_id IN (SELECT account_id FROM members WHERE user_id = auth.uid() AND role IN ('owner', 'admin'))));
CREATE POLICY flows_update ON flows FOR UPDATE
  USING (widget_id IN (SELECT id FROM widgets WHERE account_id IN (SELECT account_id FROM members WHERE user_id = auth.uid() AND role IN ('owner', 'admin'))));
CREATE POLICY flows_delete ON flows FOR DELETE
  USING (widget_id IN (SELECT id FROM widgets WHERE account_id IN (SELECT account_id FROM members WHERE user_id = auth.uid() AND role IN ('owner', 'admin'))));

-- Submissions
CREATE POLICY submissions_select ON submissions FOR SELECT
  USING (account_id IN (SELECT account_id FROM members WHERE user_id = auth.uid()));
CREATE POLICY submissions_update ON submissions FOR UPDATE
  USING (account_id IN (SELECT account_id FROM members WHERE user_id = auth.uid() AND role IN ('owner', 'admin')));

-- API Keys
CREATE POLICY api_keys_all ON api_keys FOR ALL
  USING (account_id IN (SELECT account_id FROM members WHERE user_id = auth.uid() AND role = 'owner'));

-- Webhook Endpoints
CREATE POLICY webhooks_all ON webhook_endpoints FOR ALL
  USING (account_id IN (SELECT account_id FROM members WHERE user_id = auth.uid() AND role IN ('owner', 'admin')));

-- Widget Analytics
CREATE POLICY analytics_select ON widget_analytics FOR SELECT
  USING (account_id IN (SELECT account_id FROM members WHERE user_id = auth.uid()));

-- Notification Preferences
CREATE POLICY notification_prefs_select ON notification_preferences FOR SELECT
  USING (account_id IN (SELECT account_id FROM members WHERE user_id = auth.uid()));
CREATE POLICY notification_prefs_update ON notification_preferences FOR UPDATE
  USING (member_id IN (SELECT id FROM members WHERE user_id = auth.uid()));
CREATE POLICY notification_prefs_insert ON notification_preferences FOR INSERT
  WITH CHECK (member_id IN (SELECT id FROM members WHERE user_id = auth.uid()));

-- Flow Templates (public read)
ALTER TABLE flow_templates ENABLE ROW LEVEL SECURITY;
CREATE POLICY templates_select ON flow_templates FOR SELECT USING (TRUE);
