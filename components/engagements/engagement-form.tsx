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
import { createEngagement, updateEngagement } from '@/lib/actions/engagements'
import type { Engagement } from '@/db/schema'

interface EngagementFormProps {
  clientId: string
  engagement?: Engagement
}

const FRAMEWORK_LABELS: Record<string, string> = {
  SOC2_T1:  'SOC 2 Type I',
  SOC2_T2:  'SOC 2 Type II',
  HIPAA:    'HIPAA',
  ISO27001: 'ISO 27001',
  OTHER:    'Other',
}

const STATUS_LABELS: Record<string, string> = {
  planning:    'Planning',
  in_progress: 'In Progress',
  review:      'In Review',
  completed:   'Completed',
  on_hold:     'On Hold',
}

export function EngagementForm({ clientId, engagement }: EngagementFormProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [type, setType] = useState<string>(engagement?.type ?? 'SOC2_T1')
  const [status, setStatus] = useState<string>(engagement?.status ?? 'planning')

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)

    const form = e.currentTarget
    const data = {
      name:       (form.elements.namedItem('name') as HTMLInputElement).value,
      type:       type as Engagement['type'],
      status:     status as Engagement['status'],
      startDate:  (form.elements.namedItem('startDate') as HTMLInputElement).value || undefined,
      targetDate: (form.elements.namedItem('targetDate') as HTMLInputElement).value || undefined,
      notes:      (form.elements.namedItem('notes') as HTMLTextAreaElement).value || undefined,
    }

    startTransition(async () => {
      const result = engagement
        ? await updateEngagement(engagement.id, clientId, data)
        : await createEngagement(clientId, data)

      if (!result.success) {
        setError(result.error)
        return
      }

      if (!engagement && result.success && 'data' in result) {
        router.push(`/clients/${clientId}/engagements/${(result.data as { id: string }).id}`)
      } else {
        router.push(`/clients/${clientId}/engagements/${engagement!.id}`)
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

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2 space-y-2">
          <Label htmlFor="name">Engagement name *</Label>
          <Input
            id="name"
            name="name"
            defaultValue={engagement?.name ?? ''}
            placeholder="e.g. SOC 2 Type II Audit 2026"
            required
          />
        </div>

        <div className="space-y-2">
          <Label>Framework</Label>
          <Select value={type} onValueChange={(v) => v && setType(v)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(FRAMEWORK_LABELS).map(([val, label]) => (
                <SelectItem key={val} value={val}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Status</Label>
          <Select value={status} onValueChange={(v) => v && setStatus(v)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(STATUS_LABELS).map(([val, label]) => (
                <SelectItem key={val} value={val}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="startDate">Start date</Label>
          <Input
            id="startDate"
            name="startDate"
            type="date"
            defaultValue={engagement?.startDate ?? ''}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="targetDate">Target date</Label>
          <Input
            id="targetDate"
            name="targetDate"
            type="date"
            defaultValue={engagement?.targetDate ?? ''}
          />
        </div>

        <div className="sm:col-span-2 space-y-2">
          <Label htmlFor="notes">Notes</Label>
          <Textarea
            id="notes"
            name="notes"
            defaultValue={engagement?.notes ?? ''}
            placeholder="Scope, special requirements…"
            rows={3}
          />
        </div>
      </div>

      <div className="flex gap-3">
        <Button type="submit" disabled={isPending}>
          {isPending ? 'Saving…' : engagement ? 'Save changes' : 'Create engagement'}
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
