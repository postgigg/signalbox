-- Allow NULL user_id on members for pending invitations.
-- Pending invites have invited_email set but no auth.users record yet.
-- user_id is populated when the invited user signs up and accepts.

ALTER TABLE members ALTER COLUMN user_id DROP NOT NULL;

-- The existing UNIQUE(account_id, user_id) allows multiple NULLs in Postgres,
-- but we want accepted members to remain unique per account.
-- Drop the old constraint and add a partial unique index for non-null user_ids.
ALTER TABLE members DROP CONSTRAINT IF EXISTS members_account_id_user_id_key;
CREATE UNIQUE INDEX idx_members_account_user ON members (account_id, user_id)
  WHERE user_id IS NOT NULL;

-- Prevent duplicate pending invites for the same email in the same account.
CREATE UNIQUE INDEX idx_members_account_invited_email ON members (account_id, invited_email)
  WHERE invited_email IS NOT NULL AND user_id IS NULL;
