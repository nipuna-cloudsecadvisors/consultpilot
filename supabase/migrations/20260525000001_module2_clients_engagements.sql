-- ── Module 2: Clients & Engagements ─────────────────────────────────────────

create table clients (
  id              uuid        primary key default gen_random_uuid(),
  tenant_id       uuid        not null references tenants(id) on delete cascade,
  name            text        not null,
  industry        text,
  website         text,
  contact_name    text,
  contact_email   text,
  contact_phone   text,
  status          text        not null default 'prospect'
                                check (status in ('active','prospect','inactive')),
  notes           text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index clients_tenant_id_idx on clients(tenant_id);

create table engagements (
  id              uuid        primary key default gen_random_uuid(),
  tenant_id       uuid        not null references tenants(id) on delete cascade,
  client_id       uuid        not null references clients(id) on delete cascade,
  name            text        not null,
  type            text        not null
                                check (type in ('SOC2_T1','SOC2_T2','HIPAA','ISO27001','OTHER')),
  status          text        not null default 'planning'
                                check (status in ('planning','in_progress','review','completed','on_hold')),
  start_date      date,
  target_date     date,
  notes           text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index engagements_tenant_id_idx  on engagements(tenant_id);
create index engagements_client_id_idx  on engagements(client_id);

-- updated_at triggers
create trigger clients_updated_at    before update on clients    for each row execute function set_updated_at();
create trigger engagements_updated_at before update on engagements for each row execute function set_updated_at();

-- RLS
alter table clients     enable row level security;
alter table engagements enable row level security;

create policy "clients: tenant isolation"     on clients     for all using (tenant_id = my_tenant_id());
create policy "engagements: tenant isolation" on engagements for all using (tenant_id = my_tenant_id());
