-- Wix app installation records
create table if not exists public.wix_installations (
  id uuid primary key default gen_random_uuid(),
  account_id uuid not null references public.accounts(id) on delete cascade,
  widget_id uuid references public.widgets(id) on delete set null,
  wix_instance_id text not null unique,
  wix_refresh_token text not null,
  wix_access_token text,
  wix_token_expires_at timestamptz,
  wix_site_url text,
  installed_at timestamptz not null default now(),
  uninstalled_at timestamptz,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Indexes
create index idx_wix_installations_account on public.wix_installations(account_id);
create index idx_wix_installations_instance on public.wix_installations(wix_instance_id);

-- RLS
alter table public.wix_installations enable row level security;

create policy "Users can view own wix installations"
  on public.wix_installations for select
  using (account_id in (
    select account_id from public.members where user_id = auth.uid()
  ));

create policy "Users can update own wix installations"
  on public.wix_installations for update
  using (account_id in (
    select account_id from public.members where user_id = auth.uid()
  ));
