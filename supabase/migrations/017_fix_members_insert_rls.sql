-- Fix: Allow account owner to insert the first member (themselves) during onboarding.
-- The original members_insert policy requires the user to already exist in members,
-- creating a circular dependency for the very first member insert.

-- Drop the existing policy
DROP POLICY IF EXISTS members_insert ON members;

-- New policy: allow insert if the user is already a member with owner/admin role
-- OR if the user is the owner of the account (for first member bootstrap)
CREATE POLICY members_insert ON members FOR INSERT
  WITH CHECK (
    -- Existing members with owner/admin can invite new members
    account_id IN (
      SELECT m2.account_id FROM members m2
      WHERE m2.user_id = auth.uid() AND m2.role IN ('owner', 'admin')
    )
    OR
    -- Account owner can insert themselves as the first member (onboarding bootstrap)
    (
      user_id = auth.uid()
      AND role = 'owner'
      AND account_id IN (
        SELECT a.id FROM accounts a WHERE a.owner_id = auth.uid()
      )
    )
  );
