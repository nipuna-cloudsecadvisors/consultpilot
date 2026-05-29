'use client'

import Link from 'next/link'
import { Briefcase } from 'lucide-react'
import { StatusBadge } from '@/components/shared/status-badge'
import type { Engagement } from '@/db/schema'

const FRAMEWORK_LABELS: Record<string, string> = {
  SOC2_T1:  'SOC 2 Type I',
  SOC2_T2:  'SOC 2 Type II',
  HIPAA:    'HIPAA',
  ISO27001: 'ISO 27001',
  OTHER:    'Other',
}

interface EngagementsListProps {
  clientId: string
  engagements: Engagement[]
}

export function EngagementsList({ clientId, engagements }: EngagementsListProps) {
  if (engagements.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-10 text-center">
        <Briefcase className="mb-3 h-8 w-8 text-muted-foreground/50" />
        <p className="font-medium text-sm">No engagements yet</p>
        <p className="text-xs text-muted-foreground mt-1">Create an engagement to start tracking compliance</p>
      </div>
    )
  }

  return (
    <div className="divide-y divide-border rounded-md border border-border">
      {engagements.map((eng) => (
        <Link
          key={eng.id}
          href={`/clients/${clientId}/engagements/${eng.id}`}
          className="flex items-center justify-between px-4 py-3 hover:bg-muted/50 transition-colors"
        >
          <div className="space-y-0.5">
            <p className="font-medium text-sm">{eng.name}</p>
            <p className="text-xs text-muted-foreground">
              {FRAMEWORK_LABELS[eng.type] ?? eng.type}
              {eng.targetDate && ` · Due ${eng.targetDate}`}
            </p>
          </div>
          <StatusBadge status={eng.status} />
        </Link>
      ))}
    </div>
  )
}
