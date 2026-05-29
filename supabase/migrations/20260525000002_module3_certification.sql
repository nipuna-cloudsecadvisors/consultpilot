-- ── Module 3: Certification & Audit Tracking ────────────────────────────────

create table certification_projects (
  id              uuid        primary key default gen_random_uuid(),
  tenant_id       uuid        not null references tenants(id)   on delete cascade,
  engagement_id   uuid        not null references engagements(id) on delete cascade,
  name            text        not null,
  framework       text        not null
                                check (framework in ('SOC2_T1','SOC2_T2','HIPAA','ISO27001')),
  status          text        not null default 'not_started'
                                check (status in ('not_started','in_progress','review','completed')),
  start_date      date,
  target_date     date,
  completed_date  date,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index cert_projects_tenant_idx     on certification_projects(tenant_id);
create index cert_projects_engagement_idx on certification_projects(engagement_id);

create table controls (
  id              uuid        primary key default gen_random_uuid(),
  tenant_id       uuid        not null references tenants(id) on delete cascade,
  project_id      uuid        not null references certification_projects(id) on delete cascade,
  control_ref     text        not null,   -- e.g. CC6.1 / §164.308(a)(1) / A.9.1.1
  title           text        not null,
  description     text,
  category        text,                   -- e.g. "Logical Access"
  status          text        not null default 'not_started'
                                check (status in ('not_started','in_progress','in_review','done','na')),
  evidence_notes  text,
  assigned_to     text,
  due_date        date,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index controls_tenant_idx  on controls(tenant_id);
create index controls_project_idx on controls(project_id);
create index controls_status_idx  on controls(status);

create table evidence (
  id              uuid        primary key default gen_random_uuid(),
  tenant_id       uuid        not null references tenants(id)  on delete cascade,
  control_id      uuid        not null references controls(id) on delete cascade,
  file_name       text        not null,
  file_path       text        not null,   -- Supabase Storage path
  file_size       integer,
  uploaded_by     uuid        references auth.users(id),
  notes           text,
  created_at      timestamptz not null default now()
);

create index evidence_control_idx on evidence(control_id);

create table findings (
  id              uuid        primary key default gen_random_uuid(),
  tenant_id       uuid        not null references tenants(id)  on delete cascade,
  project_id      uuid        not null references certification_projects(id) on delete cascade,
  control_id      uuid        references controls(id) on delete set null,
  title           text        not null,
  description     text,
  severity        text        not null default 'medium'
                                check (severity in ('critical','high','medium','low','info')),
  status          text        not null default 'open'
                                check (status in ('open','in_progress','resolved','accepted')),
  remediation     text,
  due_date        date,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index findings_tenant_idx  on findings(tenant_id);
create index findings_project_idx on findings(project_id);

-- updated_at triggers
create trigger cert_projects_updated_at before update on certification_projects for each row execute function set_updated_at();
create trigger controls_updated_at       before update on controls               for each row execute function set_updated_at();
create trigger findings_updated_at       before update on findings               for each row execute function set_updated_at();

-- RLS
alter table certification_projects enable row level security;
alter table controls               enable row level security;
alter table evidence               enable row level security;
alter table findings               enable row level security;

create policy "cert_projects: tenant isolation" on certification_projects for all using (tenant_id = my_tenant_id());
create policy "controls: tenant isolation"      on controls               for all using (tenant_id = my_tenant_id());
create policy "evidence: tenant isolation"      on evidence               for all using (tenant_id = my_tenant_id());
create policy "findings: tenant isolation"      on findings               for all using (tenant_id = my_tenant_id());
