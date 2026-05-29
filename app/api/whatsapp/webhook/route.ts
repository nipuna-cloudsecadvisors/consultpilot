import { NextRequest, NextResponse } from 'next/server'
import { verifyWebhook } from '@/lib/whatsapp/client'

/**
 * GET — Meta webhook verification challenge.
 */
export function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const mode      = searchParams.get('hub.mode')      ?? ''
  const token     = searchParams.get('hub.verify_token') ?? ''
  const challenge = searchParams.get('hub.challenge')   ?? ''

  const result = verifyWebhook(mode, token, challenge)
  if (result) {
    return new Response(result, { status: 200 })
  }

  return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
}

/**
 * POST — Incoming message events from Meta.
 * Currently just acknowledges (200). Extend to process inbound replies.
 */
export async function POST(request: NextRequest) {
  // Acknowledge immediately to prevent Meta retries
  const _body = await request.json()
  // TODO: process inbound messages (e.g. auto-reply, log to ai_messages)
  return NextResponse.json({ status: 'ok' })
}
