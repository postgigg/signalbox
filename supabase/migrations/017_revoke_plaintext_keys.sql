-- Revoke all existing API keys that stored plaintext values as key_hash.
-- Users must recreate keys through the new server-side hashing flow.
UPDATE api_keys SET is_active = false WHERE is_active = true;
