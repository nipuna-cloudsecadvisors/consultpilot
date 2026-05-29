-- ── Module 4: Reports & AI ───────────────────────────────────────────────────

create table reports (
  id              uuid        primary key default gen_random_uuid(),
  tenant_id       uuid        not null references tenants(id) on delete cascade,
  project_id      uuid        not null references certification_projects(id) on delete cascade,
  title           text        not null,
  framework       text        not null,
  status          text        not null default 'draft'
                                check (status in ('draft','final')),
  content         jsonb,                  -- structured report sections
  generated_by    text        not null default 'manual'
                                check (generated_by in ('ai','manual')),
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index reports_tenant_idx  on reports(tenant_id);
create index reports_project_idx on reports(project_id);

-- AI conversation history (per-project context)
create table ai_messages (
  id              uuid        primary key default gen_random_uuid(),
  tenant_id       uuid        not null references tenants(id) on delete cascade,
  project_id      uuid        references certification_projects(id) on delete cascade,
  role            text        not null check (role in ('user','assistant')),
  content         text        not null,
  created_at      timestamptz not null default now()
);

create index ai_messages_project_idx on ai_messages(project_id);

create trigger reports_updated_at before update on reports for each row execute function set_updated_at();

alter table reports      enable row level security;
alter table ai_messages  enable row level security;

create policy "reports: tenant isolation"      on reports     for all using (tenant_id = my_tenant_id());
create policy "ai_messages: tenant isolation"  on ai_messages for all using (tenant_id = my_tenant_id());
