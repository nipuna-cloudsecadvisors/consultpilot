'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { CheckCircle2, Clock, Eye, Minus, Circle } from 'lucide-react'
import { StatusBadge } from '@/components/shared/status-badge'
import { updateControl } from '@/lib/actions/controls'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { Control } from '@/db/schema'

interface ControlsBoardProps {
  projectId: string
  controls: Control[]
}

type ControlStatus = Control['status']

const COLUMNS: { status: ControlStatus; label: string; icon: React.ReactNode }[] = [
  { status: 'not_started', label: 'Not Started',  icon: <Circle     className="h-4 w-4 text-muted-foreground" /> },
  { status: 'in_progress', label: 'In Progress',  icon: <Clock      className="h-4 w-4 text-amber-500" /> },
  { status: 'in_review',   label: 'In Review',    icon: <Eye        className="h-4 w-4 text-blue-500" /> },
  { status: 'done',        label: 'Done',         icon: <CheckCircle2 className="h-4 w-4 text-green-500" /> },
  { status: 'na',          label: 'N/A',          icon: <Minus      className="h-4 w-4 text-muted-foreground" /> },
]

function ControlCard({
  control,
  projectId,
}: {
  control: Control
  projectId: string
}) {
  const [isPending, startTransition] = useTransition()

  function handleStatusChange(newStatus: string | null) {
    if (!newStatus || newStatus === control.status) return
    startTransition(async () => {
      await updateControl(control.id, projectId, { status: newStatus as ControlStatus })
    })
  }

  return (
    <div
      className={`rounded-md border border-border bg-card p-3 space-y-2 transition-opacity ${
        isPending ? 'opacity-50' : ''
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <Link
          href={`/projects/${projectId}/controls/${control.id}`}
          className="text-xs font-mono text-muted-foreground hover:text-foreground"
        >
          {control.controlRef}
        </Link>
        <StatusBadge status={control.status} />
      </div>
      <Link
        href={`/projects/${projectId}/controls/${control.id}`}
        className="block text-sm font-medium leading-snug hover:underline"
      >
        {control.title}
      </Link>
      {control.category && (
        <p className="text-xs text-muted-foreground">{control.category}</p>
      )}
      <Select value={control.status} onValueChange={handleStatusChange}>
        <SelectTrigger size="sm" className="w-full text-xs">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="not_started">Not Started</SelectItem>
          <SelectItem value="in_progress">In Progress</SelectItem>
          <SelectItem value="in_review">In Review</SelectItem>
          <SelectItem value="done">Done</SelectItem>
          <SelectItem value="na">N/A</SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
}

export function ControlsBoard({ projectId, controls }: ControlsBoardProps) {
  const [filter, setFilter] = useState('')

  const filtered = filter
    ? controls.filter(
        (c) =>
          c.title.toLowerCase().includes(filter.toLowerCase()) ||
          c.controlRef.toLowerCase().includes(filter.toLowerCase()) ||
          (c.category ?? '').toLowerCase().includes(filter.toLowerCase()),
      )
    : controls

  const byStatus = (status: ControlStatus) =>
    filtered.filter((c) => c.status === status)

  const total = controls.length
  const done  = controls.filter((c) => c.status === 'done' || c.status === 'na').length
  const pct   = total > 0 ? Math.round((done / total) * 100) : 0

  return (
    <div className="space-y-4">
      {/* Progress bar */}
      <div className="flex items-center gap-3">
        <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
          <div
            className="h-full bg-green-500 transition-all duration-500"
            style={{ width: `${pct}%` }}
          />
        </div>
        <span className="text-sm font-medium text-muted-foreground w-14 text-right">
          {done}/{total} ({pct}%)
        </span>
      </div>

      {/* Filter */}
      <input
        type="search"
        placeholder="Filter controls…"
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        className="w-full rounded-md border border-input bg-background px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-ring/50"
      />

      {/* Kanban columns */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4">
        {COLUMNS.map(({ status, label, icon }) => {
          const cards = byStatus(status)
          return (
            <div key={status} className="space-y-2">
              <div className="flex items-center gap-1.5">
                {icon}
                <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  {label}
                </span>
                <span className="ml-auto text-xs text-muted-foreground bg-muted rounded-full px-1.5 py-0.5">
                  {cards.length}
                </span>
              </div>
              <div className="space-y-2 min-h-12">
                {cards.map((ctrl) => (
                  <ControlCard key={ctrl.id} control={ctrl} projectId={projectId} />
                ))}
                {cards.length === 0 && (
                  <div className="rounded-md border border-dashed border-border h-12 flex items-center justify-center">
                    <span className="text-xs text-muted-foreground/50">empty</span>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
