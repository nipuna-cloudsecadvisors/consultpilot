'use client'

import Link from 'next/link'
import { AlertTriangle } from 'lucide-react'
import { StatusBadge } from '@/components/shared/status-badge'
import type { Finding } from '@/db/schema'

interface FindingsListProps {
  projectId: string
  findings: Finding[]
}

const SEVERITY_ORDER = { critical: 0, high: 1, medium: 2, low: 3, info: 4 }

export function FindingsList({ projectId, findings }: FindingsListProps) {
  if (findings.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-8 text-center">
        <AlertTriangle className="mb-2 h-7 w-7 text-muted-foreground/50" />
        <p className="text-sm font-medium">No findings recorded</p>
        <p className="text-xs text-muted-foreground mt-0.5">Add findings as you audit controls</p>
      </div>
    )
  }

  const sorted = [...findings].sort(
    (a, b) =>
      (SEVERITY_ORDER[a.severity] ?? 99) - (SEVERITY_ORDER[b.severity] ?? 99),
  )

  return (
    <div className="divide-y divide-border rounded-md border border-border">
      {sorted.map((f) => (
        <Link
          key={f.id}
          href={`/projects/${projectId}/findings/${f.id}`}
          className="flex items-center justify-between px-4 py-3 hover:bg-muted/50 transition-colors"
        >
          <div className="space-y-0.5 flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{f.title}</p>
            {f.dueDate && (
              <p className="text-xs text-muted-foreground">Due {f.dueDate}</p>
            )}
          </div>
          <div className="flex items-center gap-2 ml-4 shrink-0">
            <StatusBadge status={f.severity} />
            <StatusBadge status={f.status} />
          </div>
        </Link>
      ))}
    </div>
  )
}
