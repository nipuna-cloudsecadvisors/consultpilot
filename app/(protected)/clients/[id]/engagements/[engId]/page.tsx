import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft, Pencil } from 'lucide-react'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { StatusBadge } from '@/components/shared/status-badge'
import { getEngagement } from '@/lib/actions/engagements'

interface PageProps {
  params: Promise<{ id: string; engId: string }>
}

const FRAMEWORK_LABELS: Record<string, string> = {
  SOC2_T1:  'SOC 2 Type I',
  SOC2_T2:  'SOC 2 Type II',
  HIPAA:    'HIPAA',
  ISO27001: 'ISO 27001',
  OTHER:    'Other',
}

export default async function EngagementDetailPage({ params }: PageProps) {
  const { id, engId } = await params
  const engagement = await getEngagement(engId)

  if (!engagement) notFound()

  const clientName = (engagement as { clients?: { name: string } }).clients?.name ?? 'Client'

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div>
        <Link
          href={`/clients/${id}`}
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to {clientName}
        </Link>

        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold tracking-tight">{engagement.name}</h1>
              <StatusBadge status={engagement.status} />
            </div>
            <p className="text-muted-foreground mt-1">
              {FRAMEWORK_LABELS[engagement.type] ?? engagement.type}
            </p>
          </div>
          <Link href={`/clients/${id}/engagements/${engId}/edit`} className={cn(buttonVariants({ variant: 'outline', size: 'sm' }))}>
            <Pencil className="h-4 w-4 mr-1" />
            Edit
          </Link>
        </div>
      </div>

      {/* Details */}
      <div className="grid gap-6 md:grid-cols-3">
        <div className="rounded-lg border border-border p-5 space-y-4">
          <h2 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">
            Timeline
          </h2>
          <div className="space-y-2">
            <div>
              <p className="text-xs text-muted-foreground">Start date</p>
              <p className="text-sm font-medium">{engagement.startDate ?? '—'}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Target date</p>
              <p className="text-sm font-medium">{engagement.targetDate ?? '—'}</p>
            </div>
          </div>
        </div>

        {engagement.notes && (
          <div className="md:col-span-2 rounded-lg border border-border p-5">
            <h2 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground mb-3">
              Notes
            </h2>
            <p className="text-sm whitespace-pre-wrap">{engagement.notes}</p>
          </div>
        )}
      </div>

      {/* Link to Projects */}
      <div className="rounded-lg border border-border p-6 flex items-center justify-between">
        <div>
          <p className="text-sm font-medium">Certification project</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            Track controls, evidence, and findings in a project
          </p>
        </div>
        <Link
          href="/projects/new"
          className={cn(buttonVariants({ variant: 'outline', size: 'sm' }))}
        >
          Create project
        </Link>
      </div>
    </div>
  )
}
