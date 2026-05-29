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
import { createFinding, updateFinding } from '@/lib/actions/findings'
import type { Finding, Control } from '@/db/schema'

interface FindingFormProps {
  projectId: string
  finding?: Finding
  controls?: Control[]
}

export function FindingForm({ projectId, finding, controls = [] }: FindingFormProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [severity, setSeverity] = useState(finding?.severity ?? 'medium')
  const [status, setStatus] = useState(finding?.status ?? 'open')
  const [controlId, setControlId] = useState(finding?.controlId ?? '')

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)

    const form = e.currentTarget
    const data = {
      title:       (form.elements.namedItem('title') as HTMLInputElement).value,
      description: (form.elements.namedItem('description') as HTMLTextAreaElement).value || undefined,
      severity:    severity as Finding['severity'],
      status:      status as Finding['status'],
      remediation: (form.elements.namedItem('remediation') as HTMLTextAreaElement).value || undefined,
      dueDate:     (form.elements.namedItem('dueDate') as HTMLInputElement).value || undefined,
      controlId:   controlId || undefined,
    }

    startTransition(async () => {
      const result = finding
        ? await updateFinding(finding.id, projectId, data)
        : await createFinding(projectId, data)

      if (!result.success) {
        setError(result.error)
        return
      }

      router.push(`/projects/${projectId}`)
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
          <Label htmlFor="title">Title *</Label>
          <Input
            id="title"
            name="title"
            defaultValue={finding?.title ?? ''}
            placeholder="e.g. Missing MFA enforcement for admin accounts"
            required
          />
        </div>

        <div className="space-y-2">
          <Label>Severity</Label>
          <Select value={severity} onValueChange={(v) => v && setSeverity(v)}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="critical">Critical</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="info">Info</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Status</Label>
          <Select value={status} onValueChange={(v) => v && setStatus(v)}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="open">Open</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="resolved">Resolved</SelectItem>
              <SelectItem value="accepted">Accepted Risk</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {controls.length > 0 && (
          <div className="sm:col-span-2 space-y-2">
            <Label>Linked control (optional)</Label>
            <Select value={controlId} onValueChange={(v) => setControlId(v ?? '')}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select control…" />
              </SelectTrigger>
              <SelectContent>
                {controls.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.controlRef} — {c.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        <div className="sm:col-span-2 space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            name="description"
            defaultValue={finding?.description ?? ''}
            placeholder="Detail the finding…"
            rows={3}
          />
        </div>

        <div className="sm:col-span-2 space-y-2">
          <Label htmlFor="remediation">Remediation guidance</Label>
          <Textarea
            id="remediation"
            name="remediation"
            defaultValue={finding?.remediation ?? ''}
            placeholder="Steps to remediate…"
            rows={3}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="dueDate">Due date</Label>
          <Input
            id="dueDate"
            name="dueDate"
            type="date"
            defaultValue={finding?.dueDate ?? ''}
          />
        </div>
      </div>

      <div className="flex gap-3">
        <Button type="submit" disabled={isPending}>
          {isPending ? 'Saving…' : finding ? 'Save changes' : 'Create finding'}
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
