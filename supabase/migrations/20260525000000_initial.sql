-- Extensions
create extension if not exists "uuid-ossp";

-- ── Tenants ──────────────────────────────────────────────────────────────────
create table tenants (
  id         uuid        primary key default gen_random_uuid(),
  name       text        not null,
  plan       text        not null default 'free',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ── Users (mirrors auth.users) ───────────────────────────────────────────────
create table users (
  id               uuid primary key references auth.users(id) on delete cascade,
  tenant_id        uuid not null references tenants(id) on delete cascade,
  email            text not null,
  role             text not null default 'OWNER'
                     check (role in ('OWNER','TEAMMATE','READONLY')),
  name             text,
  whatsapp_number  text,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

create index users_tenant_id_idx on users(tenant_id);

-- ── Updated-at helper ────────────────────────────────────────────────────────
create or replace function set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end; $$;

create trigger tenants_updated_at
  before update on tenants
  for each row execute function set_updated_at();

create trigger users_updated_at
  before update on users
  for each row execute function set_updated_at();

-- ── Auto-provision tenant + owner on first sign-up ───────────────────────────
create or replace function handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  tid uuid;
begin
  insert into tenants (name)
    values (
      coalesce(new.raw_user_meta_data->>'name', split_part(new.email,'@',1))
      || '''s Workspace'
    )
    returning id into tid;

  insert into users (id, tenant_id, email, role, name)
    values (
      new.id,
      tid,
      new.email,
      'OWNER',
      coalesce(new.raw_user_meta_data->>'name', split_part(new.email,'@',1))
    );

  return new;
end; $$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- ── Row Level Security ────────────────────────────────────────────────────────
alter table tenants enable row level security;
alter table users   enable row level security;

-- Stable helper so each per-row check doesn't re-execute the subquery
create or replace function my_tenant_id()
returns uuid language sql stable security definer set search_path = public as $$
  select tenant_id from users where id = auth.uid()
$$;

-- Tenants: read own tenant only
create policy "tenant: read own"
  on tenants for select
  using (id = my_tenant_id());

-- Users: read all users in own tenant
create policy "users: read own tenant"
  on users for select
  using (tenant_id = my_tenant_id());

-- Users: update own row only
create policy "users: update self"
  on users for update
  using (id = auth.uid());
