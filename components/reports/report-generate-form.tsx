'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, Sparkles } from 'lucide-react'
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
import { generateReport } from '@/lib/actions/reports'

interface Project {
  id: string
  name: string
  framework: string
}

interface ReportGenerateFormProps {
  projects: Project[]
}

const FRAMEWORK_LABELS: Record<string, string> = {
  SOC2_T1:  'SOC 2 Type I',
  SOC2_T2:  'SOC 2 Type II',
  HIPAA:    'HIPAA',
  ISO27001: 'ISO 27001',
}

export function ReportGenerateForm({ projects }: ReportGenerateFormProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [projectId, setProjectId] = useState('')

  const selectedProject = projects.find((p) => p.id === projectId)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)

    const form = e.currentTarget
    const title = (form.elements.namedItem('title') as HTMLInputElement).value

    if (!projectId) {
      setError('Please select a project')
      return
    }

    startTransition(async () => {
      const result = await generateReport({
        title,
        projectId,
        framework: selectedProject?.framework ?? '',
      })

      if (!result.success) {
        setError(result.error)
        return
      }

      if (result.success && 'data' in result) {
        router.push(`/reports/${(result.data as { id: string }).id}`)
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-lg">
      {error && (
        <div className="rounded-md bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {isPending && (
        <div className="rounded-md bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 px-4 py-3 text-sm text-blue-700 dark:text-blue-300 flex items-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          Generating report with AI… this may take 15–30 seconds
        </div>
      )}

      <div className="space-y-2">
        <Label>Project</Label>
        <Select value={projectId} onValueChange={(v) => v && setProjectId(v)}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select a project" />
          </SelectTrigger>
          <SelectContent>
            {projects.map((p) => (
              <SelectItem key={p.id} value={p.id}>
                {p.name} ({FRAMEWORK_LABELS[p.framework] ?? p.framework})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="title">Report title *</Label>
        <Input
          id="title"
          name="title"
          defaultValue={
            selectedProject
              ? `${FRAMEWORK_LABELS[selectedProject.framework] ?? selectedProject.framework} Audit Report`
              : ''
          }
          key={projectId}
          placeholder="e.g. SOC 2 Type II Audit Report 2026"
          required
        />
      </div>

      <div className="flex gap-3">
        <Button type="submit" disabled={isPending || !projectId}>
          {isPending ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Generating…
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4 mr-2" />
              Generate with AI
            </>
          )}
        </Button>
      </div>
    </form>
  )
}
