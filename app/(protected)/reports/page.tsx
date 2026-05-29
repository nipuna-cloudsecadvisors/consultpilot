import Link from 'next/link'
import { Plus, FileText } from 'lucide-react'
import { buttonVariants } from '@/components/ui/button'
import { StatusBadge } from '@/components/shared/status-badge'
import { getReports } from '@/lib/actions/reports'
import { cn } from '@/lib/utils'

export default async function ReportsPage() {
  const reports = await getReports()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Reports</h1>
          <p className="text-muted-foreground">AI-generated compliance reports</p>
        </div>
        <Link href="/reports/new" className={cn(buttonVariants())}>
          <Plus className="h-4 w-4 mr-2" />
          Generate report
        </Link>
      </div>

      {reports.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-16 text-center">
          <FileText className="mb-3 h-10 w-10 text-muted-foreground/50" />
          <p className="font-medium">No reports yet</p>
          <p className="text-sm text-muted-foreground">Generate your first AI-powered compliance report</p>
        </div>
      ) : (
        <div className="divide-y divide-border rounded-md border border-border">
          {reports.map((r) => {
            const project = r.certification_projects as { name: string } | null
            return (
              <Link
                key={r.id}
                href={`/reports/${r.id}`}
                className="flex items-center justify-between px-5 py-4 hover:bg-muted/50 transition-colors"
              >
                <div className="space-y-0.5">
                  <p className="font-medium">{r.title}</p>
                  <p className="text-sm text-muted-foreground">
                    {project?.name ?? ''}
                    {r.generatedBy === 'ai' && (
                      <span className="ml-2 text-xs bg-purple-100 dark:bg-purple-950/30 text-purple-700 dark:text-purple-300 rounded px-1.5 py-0.5">
                        AI
                      </span>
                    )}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(r.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <StatusBadge status={r.status} />
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
