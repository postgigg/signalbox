-- Shopify app installation records
create table if not exists public.shopify_installations (
  id uuid primary key default gen_random_uuid(),
  account_id uuid not null references public.accounts(id) on delete cascade,
  widget_id uuid references public.widgets(id) on delete set null,
  shop_domain text not null unique,
  access_token text not null,
  script_tag_id bigint,
  installed_at timestamptz not null default now(),
  uninstalled_at timestamptz,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Indexes
create index idx_shopify_installations_account on public.shopify_installations(account_id);
create index idx_shopify_installations_shop on public.shopify_installations(shop_domain);

-- RLS
alter table public.shopify_installations enable row level security;

create policy "Users can view own shopify installations"
  on public.shopify_installations for select
  using (account_id in (
    select account_id from public.members where user_id = auth.uid()
  ));

create policy "Users can update own shopify installations"
  on public.shopify_installations for update
  using (account_id in (
    select account_id from public.members where user_id = auth.uid()
  ));
