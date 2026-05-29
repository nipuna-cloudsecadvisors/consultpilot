'use server'

import { z } from 'zod'
import { revalidatePath } from 'next/cache'
import { getSupabaseServerClient } from '@/lib/supabase/server'
import {
  sendTextMessage,
  buildDeadlineReminderMessage,
  buildReportReadyMessage,
  buildFindingAlertMessage,
} from '@/lib/whatsapp/client'

const notificationSchema = z.object({
  recipientNumber: z.string().min(10, 'Enter a valid phone number'),
  type:            z.enum(['deadline_reminder', 'report_ready', 'finding_alert', 'custom']),
  message:         z.string().min(1, 'Message is required'),
  clientId:        z.string().uuid().optional(),
  scheduledFor:    z.string().optional(),
})

type ActionResult<T = undefined> =
  | { success: true; data: T }
  | { success: false; error: string }

async function requireUser() {
  const supabase = await getSupabaseServerClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) throw new Error('Unauthorized')
  return { supabase, userId: user.id }
}

// ── Send a notification now ───────────────────────────────────────────────────

export async function sendNotification(
  input: unknown,
): Promise<ActionResult<{ id: string }>> {
  const parsed = notificationSchema.safeParse(input)
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? 'Invalid input' }
  }

  const { supabase } = await requireUser()
  const { recipientNumber, type, message, clientId } = parsed.data

  // Insert as pending
  const { data: record, error: dbError } = await supabase
    .from('notifications')
    .insert({
      client_id:        clientId || null,
      recipient_number: recipientNumber,
      type,
      message,
      status:           'pending',
    })
    .select('id')
    .single()

  if (dbError) return { success: false, error: dbError.message }

  // Send via WhatsApp
  const result = await sendTextMessage({ to: recipientNumber, body: message })

  const updatePayload = result.success
    ? {
        status:         'sent' as const,
        whatsapp_msg_id: result.messageId ?? null,
        sent_at:        new Date().toISOString(),
      }
    : {
        status:         'failed' as const,
        error_message:  result.error ?? 'Unknown error',
      }

  await supabase.from('notifications').update(updatePayload).eq('id', record.id)

  revalidatePath('/notifications')

  if (!result.success) {
    return { success: false, error: `WhatsApp delivery failed: ${result.error}` }
  }

  return { success: true, data: { id: record.id } }
}

// ── Compose helpers ───────────────────────────────────────────────────────────

export async function composeDeadlineReminder(opts: {
  recipientNumber: string
  clientId: string
  clientName: string
  engagementName: string
  daysRemaining: number
  targetDate: string
}): Promise<ActionResult<{ id: string }>> {
  const message = buildDeadlineReminderMessage({
    clientName:     opts.clientName,
    engagementName: opts.engagementName,
    daysRemaining:  opts.daysRemaining,
    targetDate:     opts.targetDate,
  })

  return sendNotification({
    recipientNumber: opts.recipientNumber,
    type:            'deadline_reminder',
    message,
    clientId:        opts.clientId,
  })
}

export async function composeReportReady(opts: {
  recipientNumber: string
  clientId: string
  clientName: string
  reportTitle: string
}): Promise<ActionResult<{ id: string }>> {
  const message = buildReportReadyMessage({
    clientName:  opts.clientName,
    reportTitle: opts.reportTitle,
  })

  return sendNotification({
    recipientNumber: opts.recipientNumber,
    type:            'report_ready',
    message,
    clientId:        opts.clientId,
  })
}

export async function composeFindingAlert(opts: {
  recipientNumber: string
  clientId: string
  clientName: string
  findingTitle: string
  severity: string
}): Promise<ActionResult<{ id: string }>> {
  const message = buildFindingAlertMessage({
    clientName:   opts.clientName,
    findingTitle: opts.findingTitle,
    severity:     opts.severity,
  })

  return sendNotification({
    recipientNumber: opts.recipientNumber,
    type:            'finding_alert',
    message,
    clientId:        opts.clientId,
  })
}

// ── Queries ───────────────────────────────────────────────────────────────────

export async function getNotifications() {
  const supabase = await getSupabaseServerClient()
  const { data, error } = await supabase
    .from('notifications')
    .select('*, clients(name)')
    .order('created_at', { ascending: false })
    .limit(100)

  if (error) throw error
  return data ?? []
}
