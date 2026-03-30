-- Add raw_payload column to capture full webhook payload for debugging
alter table public.inbound_emails
  add column if not exists raw_payload text;
