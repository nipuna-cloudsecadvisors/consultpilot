import { pgTable, uuid, text, integer, date, timestamp, jsonb } from 'drizzle-orm/pg-core'

// Helper: timestamptz alias
const timestamptz = (name: string) => timestamp(name, { withTimezone: true, mode: 'string' })

// ── Module 1 ─────────────────────────────────────────────────────────────────

export const tenants = pgTable('tenants', {
  id:        uuid('id').primaryKey().defaultRandom(),
  name:      text('name').notNull(),
  plan:      text('plan').notNull().default('free'),
  createdAt: timestamptz('created_at').notNull().defaultNow(),
  updatedAt: timestamptz('updated_at').notNull().defaultNow(),
})

export const users = pgTable('users', {
  id:             uuid('id').primaryKey(),
  tenantId:       uuid('tenant_id').notNull().references(() => tenants.id, { onDelete: 'cascade' }),
  email:          text('email').notNull(),
  role:           text('role').notNull().$type<'OWNER'|'TEAMMATE'|'READONLY'>().default('OWNER'),
  name:           text('name'),
  whatsappNumber: text('whatsapp_number'),
  createdAt:      timestamptz('created_at').notNull().defaultNow(),
  updatedAt:      timestamptz('updated_at').notNull().defaultNow(),
})

// ── Module 2 ─────────────────────────────────────────────────────────────────

export const clients = pgTable('clients', {
  id:           uuid('id').primaryKey().defaultRandom(),
  tenantId:     uuid('tenant_id').notNull().references(() => tenants.id, { onDelete: 'cascade' }),
  name:         text('name').notNull(),
  industry:     text('industry'),
  website:      text('website'),
  contactName:  text('contact_name'),
  contactEmail: text('contact_email'),
  contactPhone: text('contact_phone'),
  status:       text('status').notNull().$type<'active'|'prospect'|'inactive'>().default('prospect'),
  notes:        text('notes'),
  createdAt:    timestamptz('created_at').notNull().defaultNow(),
  updatedAt:    timestamptz('updated_at').notNull().defaultNow(),
})

export const engagements = pgTable('engagements', {
  id:         uuid('id').primaryKey().defaultRandom(),
  tenantId:   uuid('tenant_id').notNull().references(() => tenants.id, { onDelete: 'cascade' }),
  clientId:   uuid('client_id').notNull().references(() => clients.id, { onDelete: 'cascade' }),
  name:       text('name').notNull(),
  type:       text('type').notNull().$type<'SOC2_T1'|'SOC2_T2'|'HIPAA'|'ISO27001'|'OTHER'>(),
  status:     text('status').notNull().$type<'planning'|'in_progress'|'review'|'completed'|'on_hold'>().default('planning'),
  startDate:  date('start_date'),
  targetDate: date('target_date'),
  notes:      text('notes'),
  createdAt:  timestamptz('created_at').notNull().defaultNow(),
  updatedAt:  timestamptz('updated_at').notNull().defaultNow(),
})

// ── Module 3 ─────────────────────────────────────────────────────────────────

export const certificationProjects = pgTable('certification_projects', {
  id:            uuid('id').primaryKey().defaultRandom(),
  tenantId:      uuid('tenant_id').notNull().references(() => tenants.id, { onDelete: 'cascade' }),
  engagementId:  uuid('engagement_id').notNull().references(() => engagements.id, { onDelete: 'cascade' }),
  name:          text('name').notNull(),
  framework:     text('framework').notNull().$type<'SOC2_T1'|'SOC2_T2'|'HIPAA'|'ISO27001'>(),
  status:        text('status').notNull().$type<'not_started'|'in_progress'|'review'|'completed'>().default('not_started'),
  startDate:     date('start_date'),
  targetDate:    date('target_date'),
  completedDate: date('completed_date'),
  createdAt:     timestamptz('created_at').notNull().defaultNow(),
  updatedAt:     timestamptz('updated_at').notNull().defaultNow(),
})

export const controls = pgTable('controls', {
  id:            uuid('id').primaryKey().defaultRandom(),
  tenantId:      uuid('tenant_id').notNull().references(() => tenants.id, { onDelete: 'cascade' }),
  projectId:     uuid('project_id').notNull().references(() => certificationProjects.id, { onDelete: 'cascade' }),
  controlRef:    text('control_ref').notNull(),
  title:         text('title').notNull(),
  description:   text('description'),
  category:      text('category'),
  status:        text('status').notNull().$type<'not_started'|'in_progress'|'in_review'|'done'|'na'>().default('not_started'),
  evidenceNotes: text('evidence_notes'),
  assignedTo:    text('assigned_to'),
  dueDate:       date('due_date'),
  createdAt:     timestamptz('created_at').notNull().defaultNow(),
  updatedAt:     timestamptz('updated_at').notNull().defaultNow(),
})

export const evidence = pgTable('evidence', {
  id:         uuid('id').primaryKey().defaultRandom(),
  tenantId:   uuid('tenant_id').notNull().references(() => tenants.id, { onDelete: 'cascade' }),
  controlId:  uuid('control_id').notNull().references(() => controls.id, { onDelete: 'cascade' }),
  fileName:   text('file_name').notNull(),
  filePath:   text('file_path').notNull(),
  fileSize:   integer('file_size'),
  uploadedBy: uuid('uploaded_by'),
  notes:      text('notes'),
  createdAt:  timestamptz('created_at').notNull().defaultNow(),
})

export const findings = pgTable('findings', {
  id:          uuid('id').primaryKey().defaultRandom(),
  tenantId:    uuid('tenant_id').notNull().references(() => tenants.id, { onDelete: 'cascade' }),
  projectId:   uuid('project_id').notNull().references(() => certificationProjects.id, { onDelete: 'cascade' }),
  controlId:   uuid('control_id'),
  title:       text('title').notNull(),
  description: text('description'),
  severity:    text('severity').notNull().$type<'critical'|'high'|'medium'|'low'|'info'>().default('medium'),
  status:      text('status').notNull().$type<'open'|'in_progress'|'resolved'|'accepted'>().default('open'),
  remediation: text('remediation'),
  dueDate:     date('due_date'),
  createdAt:   timestamptz('created_at').notNull().defaultNow(),
  updatedAt:   timestamptz('updated_at').notNull().defaultNow(),
})

// ── Module 4 ─────────────────────────────────────────────────────────────────

export const reports = pgTable('reports', {
  id:          uuid('id').primaryKey().defaultRandom(),
  tenantId:    uuid('tenant_id').notNull().references(() => tenants.id, { onDelete: 'cascade' }),
  projectId:   uuid('project_id').notNull().references(() => certificationProjects.id, { onDelete: 'cascade' }),
  title:       text('title').notNull(),
  framework:   text('framework').notNull(),
  status:      text('status').notNull().$type<'draft'|'final'>().default('draft'),
  content:     jsonb('content'),
  generatedBy: text('generated_by').notNull().$type<'ai'|'manual'>().default('manual'),
  createdAt:   timestamptz('created_at').notNull().defaultNow(),
  updatedAt:   timestamptz('updated_at').notNull().defaultNow(),
})

export const aiMessages = pgTable('ai_messages', {
  id:        uuid('id').primaryKey().defaultRandom(),
  tenantId:  uuid('tenant_id').notNull().references(() => tenants.id, { onDelete: 'cascade' }),
  projectId: uuid('project_id'),
  role:      text('role').notNull().$type<'user'|'assistant'>(),
  content:   text('content').notNull(),
  createdAt: timestamptz('created_at').notNull().defaultNow(),
})

// ── Module 5 ─────────────────────────────────────────────────────────────────

export const notifications = pgTable('notifications', {
  id:               uuid('id').primaryKey().defaultRandom(),
  tenantId:         uuid('tenant_id').notNull().references(() => tenants.id, { onDelete: 'cascade' }),
  clientId:         uuid('client_id'),
  recipientNumber:  text('recipient_number').notNull(),
  type:             text('type').notNull().$type<'deadline_reminder'|'report_ready'|'finding_alert'|'custom'>(),
  message:          text('message').notNull(),
  status:           text('status').notNull().$type<'pending'|'sent'|'failed'>().default('pending'),
  whatsappMsgId:    text('whatsapp_msg_id'),
  errorMessage:     text('error_message'),
  scheduledFor:     timestamptz('scheduled_for'),
  sentAt:           timestamptz('sent_at'),
  createdAt:        timestamptz('created_at').notNull().defaultNow(),
})

// ── Types ────────────────────────────────────────────────────────────────────

export type Tenant              = typeof tenants.$inferSelect
export type User                = typeof users.$inferSelect
export type Client              = typeof clients.$inferSelect
export type Engagement          = typeof engagements.$inferSelect
export type CertificationProject = typeof certificationProjects.$inferSelect
export type Control             = typeof controls.$inferSelect
export type Evidence            = typeof evidence.$inferSelect
export type Finding             = typeof findings.$inferSelect
export type Report              = typeof reports.$inferSelect
export type AiMessage           = typeof aiMessages.$inferSelect
export type Notification        = typeof notifications.$inferSelect
