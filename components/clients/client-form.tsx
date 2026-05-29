'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
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
import { createClient, updateClient } from '@/lib/actions/clients'
import type { Client } from '@/db/schema'

interface ClientFormProps {
  client?: Client
}

const INDUSTRIES = [
  'Technology',
  'Healthcare',
  'Finance',
  'Retail',
  'Manufacturing',
  'Education',
  'Government',
  'Non-profit',
  'Other',
]

export function ClientForm({ client }: ClientFormProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const [status, setStatus] = useState<'active' | 'prospect' | 'inactive'>(
    (client?.status as 'active' | 'prospect' | 'inactive') ?? 'prospect',
  )
  const [industry, setIndustry] = useState(client?.industry ?? '')

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)

    const form = e.currentTarget
    const data = {
      name:         (form.elements.namedItem('name') as HTMLInputElement).value,
      industry:     industry || undefined,
      website:      (form.elements.namedItem('website') as HTMLInputElement).value || undefined,
      contactName:  (form.elements.namedItem('contactName') as HTMLInputElement).value || undefined,
      contactEmail: (form.elements.namedItem('contactEmail') as HTMLInputElement).value || undefined,
      contactPhone: (form.elements.namedItem('contactPhone') as HTMLInputElement).value || undefined,
      status,
      notes:        (form.elements.namedItem('notes') as HTMLTextAreaElement).value || undefined,
    }

    startTransition(async () => {
      const result = client
        ? await updateClient(client.id, data)
        : await createClient(data)

      if (!result.success) {
        setError(result.error)
        return
      }

      if (!client && result.success && 'data' in result) {
        router.push(`/clients/${(result.data as { id: string }).id}`)
      } else {
        router.push(`/clients/${client!.id}`)
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
      {error && (
        <div className="rounded-md bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* Basic info */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2 space-y-2">
          <Label htmlFor="name">Client name *</Label>
          <Input
            id="name"
            name="name"
            defaultValue={client?.name ?? ''}
            placeholder="Acme Corp"
            required
          />
        </div>

        <div className="space-y-2">
          <Label>Industry</Label>
          <Select value={industry} onValueChange={(v) => setIndustry(v ?? '')}>
            <SelectTrigger>
              <SelectValue placeholder="Select industry" />
            </SelectTrigger>
            <SelectContent>
              {INDUSTRIES.map((ind) => (
                <SelectItem key={ind} value={ind}>
                  {ind}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Status</Label>
          <Select value={status} onValueChange={(v) => v && setStatus(v as typeof status)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="prospect">Prospect</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="sm:col-span-2 space-y-2">
          <Label htmlFor="website">Website</Label>
          <Input
            id="website"
            name="website"
            type="url"
            defaultValue={client?.website ?? ''}
            placeholder="https://example.com"
          />
        </div>
      </div>

      {/* Contact */}
      <div>
        <h3 className="text-sm font-medium text-muted-foreground mb-3 uppercase tracking-wide">
          Contact
        </h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="contactName">Name</Label>
            <Input
              id="contactName"
              name="contactName"
              defaultValue={client?.contactName ?? ''}
              placeholder="Jane Smith"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="contactPhone">Phone</Label>
            <Input
              id="contactPhone"
              name="contactPhone"
              defaultValue={client?.contactPhone ?? ''}
              placeholder="+1 555 000 0000"
            />
          </div>
          <div className="sm:col-span-2 space-y-2">
            <Label htmlFor="contactEmail">Email</Label>
            <Input
              id="contactEmail"
              name="contactEmail"
              type="email"
              defaultValue={client?.contactEmail ?? ''}
              placeholder="jane@example.com"
            />
          </div>
        </div>
      </div>

      {/* Notes */}
      <div className="space-y-2">
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          name="notes"
          defaultValue={client?.notes ?? ''}
          placeholder="Any additional context…"
          rows={3}
        />
      </div>

      <div className="flex gap-3">
        <Button type="submit" disabled={isPending}>
          {isPending ? 'Saving…' : client ? 'Save changes' : 'Create client'}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={isPending}
        >
          Cancel
        </Button>
      </div>
    </form>
  )
}
