import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import { StatusBadge } from '@/components/shared/status-badge'
import { EvidenceUploader } from '@/components/controls/evidence-uploader'
import { getControl } from '@/lib/actions/controls'
import type { Evidence } from '@/db/schema'

interface PageProps {
  params: Promise<{ id: string; controlId: string }>
}

export default async function ControlDetailPage({ params }: PageProps) {
  const { id: projectId, controlId } = await params
  const control = await getControl(controlId)

  if (!control) notFound()

  const evidenceItems = (control as { evidence?: Evidence[] }).evidence ?? []

  return (
    <div className="space-y-6">
      <div>
        <Link
          href={`/projects/${projectId}`}
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to project
        </Link>

        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-mono text-muted-foreground mb-1">{control.controlRef}</p>
            <h1 className="text-xl font-bold tracking-tight">{control.title}</h1>
            {control.category && (
              <p className="text-sm text-muted-foreground mt-1">{control.category}</p>
            )}
          </div>
          <StatusBadge status={control.status} />
        </div>
      </div>

      {control.description && (
        <div className="rounded-lg border border-border p-5">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-2">
            Requirement
          </h2>
          <p className="text-sm leading-relaxed">{control.description}</p>
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        {/* Notes */}
        <ControlNotesEditor
          controlId={controlId}
          projectId={projectId}
          initialNotes={control.evidenceNotes ?? ''}
          assignedTo={control.assignedTo ?? ''}
          dueDate={control.dueDate ?? ''}
          status={control.status}
        />

        {/* Evidence */}
        <div className="space-y-3">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Evidence ({evidenceItems.length})
          </h2>
          <EvidenceUploader
            controlId={controlId}
            projectId={projectId}
            existing={evidenceItems}
          />
        </div>
      </div>
    </div>
  )
}

// ── Inline client component for notes form ────────────────────────────────────

import ControlNotesEditor from '@/components/controls/control-notes-editor'
