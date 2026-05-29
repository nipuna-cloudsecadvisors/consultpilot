import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft, Plus, Pencil } from 'lucide-react'
import { buttonVariants } from '@/components/ui/button'
import { StatusBadge } from '@/components/shared/status-badge'
import { ControlsBoard } from '@/components/controls/controls-board'
import { FindingsList } from '@/components/findings/findings-list'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { getProject } from '@/lib/actions/projects'
import { getControls } from '@/lib/actions/controls'
import { getFindings } from '@/lib/actions/findings'
import { cn } from '@/lib/utils'

interface PageProps {
  params: Promise<{ id: string }>
}

const FRAMEWORK_LABELS: Record<string, string> = {
  SOC2_T1:  'SOC 2 Type I',
  SOC2_T2:  'SOC 2 Type II',
  HIPAA:    'HIPAA',
  ISO27001: 'ISO 27001',
}

export default async function ProjectDetailPage({ params }: PageProps) {
  const { id } = await params
  const [project, controls, findings] = await Promise.all([
    getProject(id),
    getControls(id),
    getFindings(id),
  ])

  if (!project) notFound()

  const eng = project.engagements as { name: string; type: string; clients: { id: string; name: string } | null } | null
  const openFindings   = findings.filter((f) => f.status === 'open' || f.status === 'in_progress').length
  const doneControls   = controls.filter((c) => c.status === 'done' || c.status === 'na').length

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div>
        <Link
          href="/projects"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to projects
        </Link>

        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl font-bold tracking-tight">{project.name}</h1>
              <StatusBadge status={project.status} />
            </div>
            <p className="text-muted-foreground mt-1">
              {FRAMEWORK_LABELS[project.framework] ?? project.framework}
              {eng?.clients?.name && ` · ${eng.clients.name}`}
            </p>
          </div>
          <Link
            href={`/projects/${id}/edit`}
            className={cn(buttonVariants({ variant: 'outline', size: 'sm' }))}
          >
            <Pencil className="h-4 w-4 mr-1" />
            Edit
          </Link>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total controls', value: controls.length },
          { label: 'Completed',      value: doneControls },
          { label: 'Open findings',  value: openFindings },
          { label: 'Target date',    value: project.targetDate ?? '—' },
        ].map(({ label, value }) => (
          <div key={label} className="rounded-lg border border-border p-4">
            <p className="text-2xl font-bold">{value}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <Tabs defaultValue="controls">
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="controls">
              Controls ({controls.length})
            </TabsTrigger>
            <TabsTrigger value="findings">
              Findings ({findings.length})
            </TabsTrigger>
          </TabsList>

          <div className="flex gap-2">
            <Link
              href={`/projects/${id}/findings/new`}
              className={cn(buttonVariants({ variant: 'outline', size: 'sm' }))}
            >
              <Plus className="h-4 w-4 mr-1" />
              Finding
            </Link>
          </div>
        </div>

        <TabsContent value="controls" className="mt-4">
          <ControlsBoard projectId={id} controls={controls} />
        </TabsContent>

        <TabsContent value="findings" className="mt-4">
          <FindingsList projectId={id} findings={findings} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
