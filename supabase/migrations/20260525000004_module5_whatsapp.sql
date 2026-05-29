-- ── Module 5: WhatsApp Notifications ────────────────────────────────────────

create table notifications (
  id               uuid        primary key default gen_random_uuid(),
  tenant_id        uuid        not null references tenants(id) on delete cascade,
  client_id        uuid        references clients(id) on delete set null,
  recipient_number text        not null,   -- E.164 format e.g. +61412345678
  type             text        not null
                                 check (type in ('deadline_reminder','report_ready','finding_alert','custom')),
  message          text        not null,
  status           text        not null default 'pending'
                                 check (status in ('pending','sent','failed')),
  whatsapp_msg_id  text,                   -- returned by Meta API
  error_message    text,
  scheduled_for    timestamptz,
  sent_at          timestamptz,
  created_at       timestamptz not null default now()
);

create index notifications_tenant_idx on notifications(tenant_id);
create index notifications_status_idx on notifications(status);

alter table notifications enable row level security;
create policy "notifications: tenant isolation" on notifications for all using (tenant_id = my_tenant_id());
