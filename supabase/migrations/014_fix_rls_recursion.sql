-- Fix infinite recursion in RLS policies on members table.
-- All policies that subquery members need to go through a
-- SECURITY DEFINER function which bypasses RLS on the lookup.

-- Helper: returns account_ids the current user belongs to
CREATE OR REPLACE FUNCTION auth_user_account_ids()
RETURNS SETOF UUID
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT account_id FROM members WHERE user_id = auth.uid();
$$;

-- Helper: returns account_ids where the current user is owner or admin
CREATE OR REPLACE FUNCTION auth_user_admin_account_ids()
RETURNS SETOF UUID
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT account_id FROM members WHERE user_id = auth.uid() AND role IN ('owner', 'admin');
$$;

-- Helper: returns account_ids where the current user is owner
CREATE OR REPLACE FUNCTION auth_user_owner_account_ids()
RETURNS SETOF UUID
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT account_id FROM members WHERE user_id = auth.uid() AND role = 'owner';
$$;

-- ── Drop all existing policies ──

DROP POLICY IF EXISTS accounts_select ON accounts;
DROP POLICY IF EXISTS accounts_update ON accounts;
DROP POLICY IF EXISTS accounts_insert ON accounts;

DROP POLICY IF EXISTS members_select ON members;
DROP POLICY IF EXISTS members_insert ON members;
DROP POLICY IF EXISTS members_update ON members;
DROP POLICY IF EXISTS members_delete ON members;

DROP POLICY IF EXISTS widgets_select ON widgets;
DROP POLICY IF EXISTS widgets_insert ON widgets;
DROP POLICY IF EXISTS widgets_update ON widgets;
DROP POLICY IF EXISTS widgets_delete ON widgets;

DROP POLICY IF EXISTS flows_select ON flows;
DROP POLICY IF EXISTS flows_insert ON flows;
DROP POLICY IF EXISTS flows_update ON flows;
DROP POLICY IF EXISTS flows_delete ON flows;

DROP POLICY IF EXISTS submissions_select ON submissions;
DROP POLICY IF EXISTS submissions_update ON submissions;

DROP POLICY IF EXISTS api_keys_all ON api_keys;
DROP POLICY IF EXISTS webhooks_all ON webhook_endpoints;
DROP POLICY IF EXISTS analytics_select ON widget_analytics;

DROP POLICY IF EXISTS notification_prefs_select ON notification_preferences;
DROP POLICY IF EXISTS notification_prefs_update ON notification_preferences;
DROP POLICY IF EXISTS notification_prefs_insert ON notification_preferences;

-- ── Recreate policies using helper functions ──

-- Accounts
CREATE POLICY accounts_select ON accounts FOR SELECT
  USING (id IN (SELECT auth_user_account_ids()));
CREATE POLICY accounts_update ON accounts FOR UPDATE
  USING (id IN (SELECT auth_user_owner_account_ids()));
CREATE POLICY accounts_insert ON accounts FOR INSERT
  WITH CHECK (owner_id = auth.uid());

-- Members: use user_id directly to avoid recursion
CREATE POLICY members_select ON members FOR SELECT
  USING (user_id = auth.uid()
    OR account_id IN (SELECT auth_user_account_ids()));
CREATE POLICY members_insert ON members FOR INSERT
  WITH CHECK (
    -- First member: user is the account owner
    account_id IN (SELECT id FROM accounts WHERE owner_id = auth.uid())
    -- Subsequent members: user is admin/owner of the account
    OR account_id IN (SELECT auth_user_admin_account_ids())
  );
CREATE POLICY members_update ON members FOR UPDATE
  USING (account_id IN (SELECT auth_user_admin_account_ids()));
CREATE POLICY members_delete ON members FOR DELETE
  USING (account_id IN (SELECT auth_user_admin_account_ids()));

-- Widgets
CREATE POLICY widgets_select ON widgets FOR SELECT
  USING (account_id IN (SELECT auth_user_account_ids()));
CREATE POLICY widgets_insert ON widgets FOR INSERT
  WITH CHECK (account_id IN (SELECT auth_user_admin_account_ids()));
CREATE POLICY widgets_update ON widgets FOR UPDATE
  USING (account_id IN (SELECT auth_user_admin_account_ids()));
CREATE POLICY widgets_delete ON widgets FOR DELETE
  USING (account_id IN (SELECT auth_user_admin_account_ids()));

-- Flows
CREATE POLICY flows_select ON flows FOR SELECT
  USING (widget_id IN (SELECT id FROM widgets WHERE account_id IN (SELECT auth_user_account_ids())));
CREATE POLICY flows_insert ON flows FOR INSERT
  WITH CHECK (widget_id IN (SELECT id FROM widgets WHERE account_id IN (SELECT auth_user_admin_account_ids())));
CREATE POLICY flows_update ON flows FOR UPDATE
  USING (widget_id IN (SELECT id FROM widgets WHERE account_id IN (SELECT auth_user_admin_account_ids())));
CREATE POLICY flows_delete ON flows FOR DELETE
  USING (widget_id IN (SELECT id FROM widgets WHERE account_id IN (SELECT auth_user_admin_account_ids())));

-- Submissions
CREATE POLICY submissions_select ON submissions FOR SELECT
  USING (account_id IN (SELECT auth_user_account_ids()));
CREATE POLICY submissions_update ON submissions FOR UPDATE
  USING (account_id IN (SELECT auth_user_admin_account_ids()));

-- API Keys
CREATE POLICY api_keys_all ON api_keys FOR ALL
  USING (account_id IN (SELECT auth_user_owner_account_ids()));

-- Webhook Endpoints
CREATE POLICY webhooks_all ON webhook_endpoints FOR ALL
  USING (account_id IN (SELECT auth_user_admin_account_ids()));

-- Widget Analytics
CREATE POLICY analytics_select ON widget_analytics FOR SELECT
  USING (account_id IN (SELECT auth_user_account_ids()));

-- Notification Preferences
CREATE POLICY notification_prefs_select ON notification_preferences FOR SELECT
  USING (account_id IN (SELECT auth_user_account_ids()));
CREATE POLICY notification_prefs_update ON notification_preferences FOR UPDATE
  USING (member_id IN (SELECT id FROM members WHERE user_id = auth.uid()));
CREATE POLICY notification_prefs_insert ON notification_preferences FOR INSERT
  WITH CHECK (member_id IN (SELECT id FROM members WHERE user_id = auth.uid()));
