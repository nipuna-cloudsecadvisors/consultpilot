'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { createProject, updateProject } from '@/lib/actions/projects'

interface Engagement {
  id: string
  name: string
  type: string
  clients: { name: string } | null
}

interface ProjectFormProps {
  engagements: Engagement[]
  projectId?: string
  defaultValues?: {
    name: string
    status: string
    startDate?: string | null
    targetDate?: string | null
    engagementId?: string
    framework?: string
  }
}

const FRAMEWORK_LABELS: Record<string, string> = {
  SOC2_T1:  'SOC 2 Type I',
  SOC2_T2:  'SOC 2 Type II',
  HIPAA:    'HIPAA',
  ISO27001: 'ISO 27001',
}

const STATUS_LABELS: Record<string, string> = {
  not_started: 'Not Started',
  in_progress: 'In Progress',
  review:      'In Review',
  completed:   'Completed',
}

export function ProjectForm({ engagements, projectId, defaultValues }: ProjectFormProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [framework, setFramework] = useState(defaultValues?.framework ?? 'SOC2_T2')
  const [status, setStatus] = useState(defaultValues?.status ?? 'not_started')
  const [engagementId, setEngagementId] = useState(defaultValues?.engagementId ?? '')

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)

    const form = e.currentTarget
    const data = {
      name:         (form.elements.namedItem('name') as HTMLInputElement).value,
      framework:    framework as 'SOC2_T1' | 'SOC2_T2' | 'HIPAA' | 'ISO27001',
      engagementId,
      status:       status as 'not_started' | 'in_progress' | 'review' | 'completed',
      startDate:    (form.elements.namedItem('startDate') as HTMLInputElement).value || undefined,
      targetDate:   (form.elements.namedItem('targetDate') as HTMLInputElement).value || undefined,
    }

    startTransition(async () => {
      const result = projectId
        ? await updateProject(projectId, data)
        : await createProject(data)

      if (!result.success) {
        setError(result.error)
        return
      }

      if (!projectId && result.success && 'data' in result) {
        router.push(`/projects/${(result.data as { id: string }).id}`)
      } else {
        router.push(`/projects/${projectId}`)
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
          <Label htmlFor="name">Project name *</Label>
          <Input
            id="name"
            name="name"
            defaultValue={defaultValues?.name ?? ''}
            placeholder="e.g. SOC 2 Type II 2026"
            required
          />
        </div>

        {!projectId && (
          <>
            <div className="space-y-2">
              <Label>Engagement *</Label>
              <Select value={engagementId} onValueChange={(v) => v && setEngagementId(v)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select engagement" />
                </SelectTrigger>
                <SelectContent>
                  {engagements.map((eng) => (
                    <SelectItem key={eng.id} value={eng.id}>
                      {eng.clients?.name} — {eng.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Framework *</Label>
              <Select value={framework} onValueChange={(v) => v && setFramework(v)}>
                <SelectTrigger className="w-full">
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
              <p className="text-xs text-muted-foreground">
                Controls will be auto-seeded from the selected framework
              </p>
            </div>
          </>
        )}

        <div className="space-y-2">
          <Label>Status</Label>
          <Select value={status} onValueChange={(v) => v && setStatus(v)}>
            <SelectTrigger className="w-full">
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
            defaultValue={defaultValues?.startDate ?? ''}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="targetDate">Target date</Label>
          <Input
            id="targetDate"
            name="targetDate"
            type="date"
            defaultValue={defaultValues?.targetDate ?? ''}
          />
        </div>
      </div>

      <div className="flex gap-3">
        <Button type="submit" disabled={isPending || (!projectId && !engagementId)}>
          {isPending
            ? 'Saving…'
            : projectId
            ? 'Save changes'
            : 'Create project'}
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
