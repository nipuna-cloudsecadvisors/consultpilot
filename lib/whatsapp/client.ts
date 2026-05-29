/**
 * WhatsApp Business Cloud API client.
 * Server-only — never import in client components.
 *
 * Required env vars:
 *   WHATSAPP_ACCESS_TOKEN   — permanent system user token
 *   WHATSAPP_PHONE_NUMBER_ID — phone number ID from Meta
 *   WHATSAPP_VERIFY_TOKEN    — webhook verification token
 */

export interface WhatsAppTextMessage {
  to: string          // E.164 format e.g. +15550001234
  body: string
}

export interface WhatsAppSendResult {
  success: boolean
  messageId?: string
  error?: string
}

function getConfig() {
  const accessToken   = process.env.WHATSAPP_ACCESS_TOKEN
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID

  if (!accessToken || !phoneNumberId) {
    throw new Error(
      'WhatsApp is not configured. Set WHATSAPP_ACCESS_TOKEN and WHATSAPP_PHONE_NUMBER_ID.',
    )
  }

  return {
    accessToken,
    phoneNumberId,
    apiVersion: 'v21.0',
    baseUrl: 'https://graph.facebook.com',
  }
}

/**
 * Send a plain-text WhatsApp message.
 */
export async function sendTextMessage(
  msg: WhatsAppTextMessage,
): Promise<WhatsAppSendResult> {
  const cfg = getConfig()

  const url = `${cfg.baseUrl}/${cfg.apiVersion}/${cfg.phoneNumberId}/messages`
  const payload = {
    messaging_product: 'whatsapp',
    recipient_type:    'individual',
    to:                msg.to,
    type:              'text',
    text: { body: msg.body, preview_url: false },
  }

  let response: Response
  try {
    response = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization:  `Bearer ${cfg.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : 'Network error' }
  }

  const data = await response.json() as { messages?: { id: string }[]; error?: { message: string } }

  if (!response.ok) {
    return { success: false, error: data.error?.message ?? `HTTP ${response.status}` }
  }

  return { success: true, messageId: data.messages?.[0]?.id }
}

/**
 * Verify a webhook challenge from Meta.
 */
export function verifyWebhook(
  mode: string,
  token: string,
  challenge: string,
): string | null {
  const verifyToken = process.env.WHATSAPP_VERIFY_TOKEN
  if (mode === 'subscribe' && token === verifyToken) {
    return challenge
  }
  return null
}

/**
 * Build a deadline reminder message.
 */
export function buildDeadlineReminderMessage(opts: {
  clientName: string
  engagementName: string
  daysRemaining: number
  targetDate: string
}): string {
  return [
    `⏰ *Deadline Reminder — ${opts.clientName}*`,
    '',
    `Engagement: ${opts.engagementName}`,
    `Target date: ${opts.targetDate}`,
    `Days remaining: ${opts.daysRemaining}`,
    '',
    'Please ensure all outstanding controls are addressed before the target date.',
    '',
    '— ConsultPilot GRC',
  ].join('\n')
}

/**
 * Build a report-ready notification.
 */
export function buildReportReadyMessage(opts: {
  clientName: string
  reportTitle: string
}): string {
  return [
    `📋 *Report Ready — ${opts.clientName}*`,
    '',
    `Your compliance report "${opts.reportTitle}" has been finalised and is ready for review.`,
    '',
    'Log in to ConsultPilot to view and download.',
    '',
    '— ConsultPilot GRC',
  ].join('\n')
}

/**
 * Build a critical finding alert.
 */
export function buildFindingAlertMessage(opts: {
  clientName: string
  findingTitle: string
  severity: string
}): string {
  const severityEmoji: Record<string, string> = {
    critical: '🚨',
    high:     '🔴',
    medium:   '🟡',
    low:      '🔵',
    info:     'ℹ️',
  }
  const emoji = severityEmoji[opts.severity] ?? '⚠️'

  return [
    `${emoji} *${opts.severity.toUpperCase()} Finding — ${opts.clientName}*`,
    '',
    opts.findingTitle,
    '',
    'Please review this finding in ConsultPilot and assign a remediation owner.',
    '',
    '— ConsultPilot GRC',
  ].join('\n')
}
