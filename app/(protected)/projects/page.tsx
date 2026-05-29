import Link from 'next/link'
import { Plus, FolderKanban } from 'lucide-react'
import { buttonVariants } from '@/components/ui/button'
import { StatusBadge } from '@/components/shared/status-badge'
import { getProjects } from '@/lib/actions/projects'
import { cn } from '@/lib/utils'

const FRAMEWORK_LABELS: Record<string, string> = {
  SOC2_T1:  'SOC 2 Type I',
  SOC2_T2:  'SOC 2 Type II',
  HIPAA:    'HIPAA',
  ISO27001: 'ISO 27001',
}

export default async function ProjectsPage() {
  const projects = await getProjects()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Projects</h1>
          <p className="text-muted-foreground">Certification & audit tracking</p>
        </div>
        <Link href="/projects/new" className={cn(buttonVariants())}>
          <Plus className="h-4 w-4 mr-2" />
          New project
        </Link>
      </div>

      {projects.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-16 text-center">
          <FolderKanban className="mb-3 h-10 w-10 text-muted-foreground/50" />
          <p className="font-medium">No projects yet</p>
          <p className="text-sm text-muted-foreground">Create a project to start tracking controls</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {projects.map((p) => {
            const eng = p.engagements as { name: string; type: string; clients: { name: string } | null } | null
            return (
              <Link
                key={p.id}
                href={`/projects/${p.id}`}
                className="rounded-lg border border-border p-5 space-y-3 hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="font-semibold leading-snug">{p.name}</p>
                  <StatusBadge status={p.status} />
                </div>
                <p className="text-sm text-muted-foreground">
                  {FRAMEWORK_LABELS[p.framework] ?? p.framework}
                </p>
                {eng && (
                  <p className="text-xs text-muted-foreground">
                    {eng.clients?.name} · {eng.name}
                  </p>
                )}
                {p.targetDate && (
                  <p className="text-xs text-muted-foreground">Due {p.targetDate}</p>
                )}
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
