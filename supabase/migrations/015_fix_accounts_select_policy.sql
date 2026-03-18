-- Fix: account owner must be able to SELECT their own account
-- immediately after INSERT, before a member record exists.
-- The .insert().select() pattern triggers RETURNING which
-- checks the SELECT policy.

DROP POLICY IF EXISTS accounts_select ON accounts;

CREATE POLICY accounts_select ON accounts FOR SELECT
  USING (
    owner_id = auth.uid()
    OR id IN (SELECT auth_user_account_ids())
  );
