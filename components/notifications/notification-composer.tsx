'use client'

import { useState, useTransition } from 'react'
import { Send } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { sendNotification } from '@/lib/actions/notifications'

interface Client {
  id: string
  name: string
  contactPhone: string | null
}

interface NotificationComposerProps {
  clients: Client[]
  onSent?: () => void
}

const TYPE_LABELS = {
  deadline_reminder: 'Deadline Reminder',
  report_ready:      'Report Ready',
  finding_alert:     'Finding Alert',
  custom:            'Custom Message',
}

const TYPE_TEMPLATES: Record<string, string> = {
  deadline_reminder: 'Reminder: Your compliance audit deadline is approaching. Please review outstanding controls.',
  report_ready:      'Your compliance report has been finalised and is ready for review in ConsultPilot.',
  finding_alert:     'A new compliance finding has been identified. Please review and assign a remediation owner.',
  custom:            '',
}

export function NotificationComposer({ clients, onSent }: NotificationComposerProps) {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [type, setType] = useState<string>('custom')
  const [clientId, setClientId] = useState<string>('')
  const [recipientNumber, setRecipientNumber] = useState('')
  const [message, setMessage] = useState('')

  function handleTypeChange(newType: string | null) {
    if (!newType) return
    setType(newType)
    setMessage(TYPE_TEMPLATES[newType] ?? '')
  }

  function handleClientChange(id: string | null) {
    if (!id) return
    setClientId(id)
    const client = clients.find((c) => c.id === id)
    if (client?.contactPhone) {
      setRecipientNumber(client.contactPhone)
    }
  }

  function handleSend() {
    setError(null)
    setSuccess(false)

    if (!recipientNumber.trim()) {
      setError('Recipient phone number is required')
      return
    }
    if (!message.trim()) {
      setError('Message is required')
      return
    }

    startTransition(async () => {
      const result = await sendNotification({
        recipientNumber,
        type,
        message,
        clientId: clientId || undefined,
      })

      if (!result.success) {
        setError(result.error)
      } else {
        setSuccess(true)
        setMessage('')
        setTimeout(() => setSuccess(false), 3000)
        onSent?.()
      }
    })
  }

  return (
    <div className="space-y-4 rounded-lg border border-border p-5">
      <h2 className="font-semibold">Send notification</h2>

      {error && (
        <div className="rounded-md bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}
      {success && (
        <div className="rounded-md bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 px-4 py-3 text-sm text-green-700 dark:text-green-300">
          ✓ Message sent successfully
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label>Client (optional)</Label>
          <Select value={clientId} onValueChange={handleClientChange}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select client…" />
            </SelectTrigger>
            <SelectContent>
              {clients.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Notification type</Label>
          <Select value={type} onValueChange={handleTypeChange}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(TYPE_LABELS).map(([val, label]) => (
                <SelectItem key={val} value={val}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="sm:col-span-2 space-y-2">
          <Label htmlFor="recipient">Recipient (WhatsApp number) *</Label>
          <Input
            id="recipient"
            value={recipientNumber}
            onChange={(e) => setRecipientNumber(e.target.value)}
            placeholder="+15550001234"
          />
          <p className="text-xs text-muted-foreground">
            E.164 format with country code (e.g. +1 for US)
          </p>
        </div>

        <div className="sm:col-span-2 space-y-2">
          <Label htmlFor="message">Message *</Label>
          <Textarea
            id="message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type your message…"
            rows={4}
          />
        </div>
      </div>

      <Button onClick={handleSend} disabled={isPending}>
        {isPending ? (
          'Sending…'
        ) : (
          <>
            <Send className="h-4 w-4 mr-2" />
            Send WhatsApp message
          </>
        )}
      </Button>
    </div>
  )
}
