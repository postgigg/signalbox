-- Fix infinite recursion in members RLS policies.
-- All policies that subquery members directly must use the
-- SECURITY DEFINER helper functions instead.

-- ── Fix members_insert (the main offender) ──
DROP POLICY IF EXISTS members_insert ON members;
CREATE POLICY members_insert ON members FOR INSERT
  WITH CHECK (
    account_id IN (SELECT id FROM accounts WHERE owner_id = auth.uid())
    OR account_id IN (SELECT auth_user_admin_account_ids())
  );

-- ── Fix policies on other tables that directly query members ──

-- ab_tests
DROP POLICY IF EXISTS ab_tests_select ON ab_tests;
DROP POLICY IF EXISTS ab_tests_insert ON ab_tests;
DROP POLICY IF EXISTS ab_tests_update ON ab_tests;
DROP POLICY IF EXISTS ab_tests_delete ON ab_tests;
CREATE POLICY ab_tests_select ON ab_tests FOR SELECT
  USING (account_id IN (SELECT auth_user_account_ids()));
CREATE POLICY ab_tests_insert ON ab_tests FOR INSERT
  WITH CHECK (account_id IN (SELECT auth_user_admin_account_ids()));
CREATE POLICY ab_tests_update ON ab_tests FOR UPDATE
  USING (account_id IN (SELECT auth_user_admin_account_ids()));
CREATE POLICY ab_tests_delete ON ab_tests FOR DELETE
  USING (account_id IN (SELECT auth_user_admin_account_ids()));

-- ab_test_results
DROP POLICY IF EXISTS ab_test_results_select ON ab_test_results;
CREATE POLICY ab_test_results_select ON ab_test_results FOR SELECT
  USING (ab_test_id IN (SELECT id FROM ab_tests WHERE account_id IN (SELECT auth_user_account_ids())));

-- client_accounts
DROP POLICY IF EXISTS client_accounts_select ON client_accounts;
DROP POLICY IF EXISTS client_accounts_insert ON client_accounts;
DROP POLICY IF EXISTS client_accounts_update ON client_accounts;
DROP POLICY IF EXISTS client_accounts_delete ON client_accounts;
CREATE POLICY client_accounts_select ON client_accounts FOR SELECT
  USING (parent_account_id IN (SELECT auth_user_account_ids()));
CREATE POLICY client_accounts_insert ON client_accounts FOR INSERT
  WITH CHECK (parent_account_id IN (SELECT auth_user_admin_account_ids()));
CREATE POLICY client_accounts_update ON client_accounts FOR UPDATE
  USING (parent_account_id IN (SELECT auth_user_admin_account_ids()));
CREATE POLICY client_accounts_delete ON client_accounts FOR DELETE
  USING (parent_account_id IN (SELECT auth_user_admin_account_ids()));

-- drip_sequences
DROP POLICY IF EXISTS drip_sequences_select ON drip_sequences;
DROP POLICY IF EXISTS drip_sequences_insert ON drip_sequences;
DROP POLICY IF EXISTS drip_sequences_update ON drip_sequences;
DROP POLICY IF EXISTS drip_sequences_delete ON drip_sequences;
CREATE POLICY drip_sequences_select ON drip_sequences FOR SELECT
  USING (account_id IN (SELECT auth_user_account_ids()));
CREATE POLICY drip_sequences_insert ON drip_sequences FOR INSERT
  WITH CHECK (account_id IN (SELECT auth_user_admin_account_ids()));
CREATE POLICY drip_sequences_update ON drip_sequences FOR UPDATE
  USING (account_id IN (SELECT auth_user_admin_account_ids()));
CREATE POLICY drip_sequences_delete ON drip_sequences FOR DELETE
  USING (account_id IN (SELECT auth_user_admin_account_ids()));

-- drip_steps
DROP POLICY IF EXISTS drip_steps_select ON drip_steps;
DROP POLICY IF EXISTS drip_steps_insert ON drip_steps;
DROP POLICY IF EXISTS drip_steps_update ON drip_steps;
DROP POLICY IF EXISTS drip_steps_delete ON drip_steps;
CREATE POLICY drip_steps_select ON drip_steps FOR SELECT
  USING (sequence_id IN (SELECT id FROM drip_sequences WHERE account_id IN (SELECT auth_user_account_ids())));
CREATE POLICY drip_steps_insert ON drip_steps FOR INSERT
  WITH CHECK (sequence_id IN (SELECT id FROM drip_sequences WHERE account_id IN (SELECT auth_user_admin_account_ids())));
CREATE POLICY drip_steps_update ON drip_steps FOR UPDATE
  USING (sequence_id IN (SELECT id FROM drip_sequences WHERE account_id IN (SELECT auth_user_admin_account_ids())));
CREATE POLICY drip_steps_delete ON drip_steps FOR DELETE
  USING (sequence_id IN (SELECT id FROM drip_sequences WHERE account_id IN (SELECT auth_user_admin_account_ids())));

-- drip_enrollments
DROP POLICY IF EXISTS drip_enrollments_select ON drip_enrollments;
DROP POLICY IF EXISTS drip_enrollments_insert ON drip_enrollments;
DROP POLICY IF EXISTS drip_enrollments_update ON drip_enrollments;
CREATE POLICY drip_enrollments_select ON drip_enrollments FOR SELECT
  USING (account_id IN (SELECT auth_user_account_ids()));
CREATE POLICY drip_enrollments_insert ON drip_enrollments FOR INSERT
  WITH CHECK (account_id IN (SELECT auth_user_admin_account_ids()));
CREATE POLICY drip_enrollments_update ON drip_enrollments FOR UPDATE
  USING (account_id IN (SELECT auth_user_admin_account_ids()));

-- lead_routing_rules
DROP POLICY IF EXISTS lead_routing_rules_select ON lead_routing_rules;
DROP POLICY IF EXISTS lead_routing_rules_insert ON lead_routing_rules;
DROP POLICY IF EXISTS lead_routing_rules_update ON lead_routing_rules;
DROP POLICY IF EXISTS lead_routing_rules_delete ON lead_routing_rules;
CREATE POLICY lead_routing_rules_select ON lead_routing_rules FOR SELECT
  USING (account_id IN (SELECT auth_user_account_ids()));
CREATE POLICY lead_routing_rules_insert ON lead_routing_rules FOR INSERT
  WITH CHECK (account_id IN (SELECT auth_user_admin_account_ids()));
CREATE POLICY lead_routing_rules_update ON lead_routing_rules FOR UPDATE
  USING (account_id IN (SELECT auth_user_admin_account_ids()));
CREATE POLICY lead_routing_rules_delete ON lead_routing_rules FOR DELETE
  USING (account_id IN (SELECT auth_user_admin_account_ids()));

-- shared_analytics_links
DROP POLICY IF EXISTS shared_analytics_links_select ON shared_analytics_links;
DROP POLICY IF EXISTS shared_analytics_links_insert ON shared_analytics_links;
DROP POLICY IF EXISTS shared_analytics_links_update ON shared_analytics_links;
DROP POLICY IF EXISTS shared_analytics_links_delete ON shared_analytics_links;
CREATE POLICY shared_analytics_links_select ON shared_analytics_links FOR SELECT
  USING (account_id IN (SELECT auth_user_account_ids()));
CREATE POLICY shared_analytics_links_insert ON shared_analytics_links FOR INSERT
  WITH CHECK (account_id IN (SELECT auth_user_admin_account_ids()));
CREATE POLICY shared_analytics_links_update ON shared_analytics_links FOR UPDATE
  USING (account_id IN (SELECT auth_user_admin_account_ids()));
CREATE POLICY shared_analytics_links_delete ON shared_analytics_links FOR DELETE
  USING (account_id IN (SELECT auth_user_admin_account_ids()));

-- webhook_event_log
DROP POLICY IF EXISTS webhook_event_log_select ON webhook_event_log;
DROP POLICY IF EXISTS webhook_event_log_insert ON webhook_event_log;
CREATE POLICY webhook_event_log_select ON webhook_event_log FOR SELECT
  USING (account_id IN (SELECT auth_user_account_ids()));
CREATE POLICY webhook_event_log_insert ON webhook_event_log FOR INSERT
  WITH CHECK (account_id IN (SELECT auth_user_admin_account_ids()));

-- notification_preferences
DROP POLICY IF EXISTS notification_prefs_select ON notification_preferences;
DROP POLICY IF EXISTS notification_prefs_update ON notification_preferences;
DROP POLICY IF EXISTS notification_prefs_insert ON notification_preferences;
CREATE POLICY notification_prefs_select ON notification_preferences FOR SELECT
  USING (account_id IN (SELECT auth_user_account_ids()));
CREATE POLICY notification_prefs_update ON notification_preferences FOR UPDATE
  USING (member_id IN (SELECT id FROM members WHERE user_id = auth.uid()));
CREATE POLICY notification_prefs_insert ON notification_preferences FOR INSERT
  WITH CHECK (member_id IN (SELECT id FROM members WHERE user_id = auth.uid()));

-- member_skills
DROP POLICY IF EXISTS "Admins can manage account skills" ON member_skills;
DROP POLICY IF EXISTS "Members can view own account skills" ON member_skills;
CREATE POLICY member_skills_select ON member_skills FOR SELECT
  USING (account_id IN (SELECT auth_user_account_ids()));
CREATE POLICY member_skills_admin ON member_skills FOR ALL
  USING (account_id IN (SELECT auth_user_admin_account_ids()));

-- member_territories
DROP POLICY IF EXISTS "Admins can manage account territories" ON member_territories;
DROP POLICY IF EXISTS "Members can view own account territories" ON member_territories;
CREATE POLICY member_territories_select ON member_territories FOR SELECT
  USING (account_id IN (SELECT auth_user_account_ids()));
CREATE POLICY member_territories_admin ON member_territories FOR ALL
  USING (account_id IN (SELECT auth_user_admin_account_ids()));

-- member_availability
DROP POLICY IF EXISTS "Admins can manage account availability" ON member_availability;
DROP POLICY IF EXISTS "Members can view own account availability" ON member_availability;
DROP POLICY IF EXISTS "Members can update own availability" ON member_availability;
CREATE POLICY member_availability_select ON member_availability FOR SELECT
  USING (account_id IN (SELECT auth_user_account_ids()));
CREATE POLICY member_availability_admin ON member_availability FOR ALL
  USING (account_id IN (SELECT auth_user_admin_account_ids()));
CREATE POLICY member_availability_self_update ON member_availability FOR UPDATE
  USING (member_id IN (SELECT id FROM members WHERE user_id = auth.uid()));

-- round_robin_state
DROP POLICY IF EXISTS "Members can view own account round robin state" ON round_robin_state;
CREATE POLICY round_robin_state_select ON round_robin_state FOR SELECT
  USING (account_id IN (SELECT auth_user_account_ids()));

-- score_history
DROP POLICY IF EXISTS "Members can view own account score history" ON score_history;
CREATE POLICY score_history_select ON score_history FOR SELECT
  USING (account_id IN (SELECT auth_user_account_ids()));

-- visitor_sessions
DROP POLICY IF EXISTS "Members can view own account visitor sessions" ON visitor_sessions;
CREATE POLICY visitor_sessions_select ON visitor_sessions FOR SELECT
  USING (account_id IN (SELECT auth_user_account_ids()));
