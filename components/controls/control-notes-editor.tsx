'use client'

import { useState, useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { updateControl } from '@/lib/actions/controls'
import type { Control } from '@/db/schema'

interface ControlNotesEditorProps {
  controlId: string
  projectId: string
  initialNotes: string
  assignedTo: string
  dueDate: string
  status: Control['status']
}

export default function ControlNotesEditor({
  controlId,
  projectId,
  initialNotes,
  assignedTo,
  dueDate,
  status: initialStatus,
}: ControlNotesEditorProps) {
  const [isPending, startTransition] = useTransition()
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [notes, setNotes] = useState(initialNotes)
  const [assigned, setAssigned] = useState(assignedTo)
  const [due, setDue] = useState(dueDate)
  const [status, setStatus] = useState(initialStatus)

  function handleSave() {
    setError(null)
    setSaved(false)

    startTransition(async () => {
      const result = await updateControl(controlId, projectId, {
        status,
        evidenceNotes: notes,
        assignedTo:    assigned,
        dueDate:       due,
      })

      if (!result.success) {
        setError(result.error)
      } else {
        setSaved(true)
        setTimeout(() => setSaved(false), 2000)
      }
    })
  }

  return (
    <div className="space-y-4">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
        Assessment
      </h2>

      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}

      <div className="space-y-2">
        <Label>Status</Label>
        <Select value={status} onValueChange={(v) => v && setStatus(v as Control['status'])}>
          <SelectTrigger className="w-full">
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

      <div className="space-y-2">
        <Label htmlFor="notes">Evidence notes</Label>
        <Textarea
          id="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Document what evidence was gathered…"
          rows={4}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label htmlFor="assigned">Assigned to</Label>
          <Input
            id="assigned"
            value={assigned}
            onChange={(e) => setAssigned(e.target.value)}
            placeholder="Name or email"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="dueDate">Due date</Label>
          <Input
            id="dueDate"
            type="date"
            value={due}
            onChange={(e) => setDue(e.target.value)}
          />
        </div>
      </div>

      <Button
        size="sm"
        onClick={handleSave}
        disabled={isPending}
        variant={saved ? 'outline' : 'default'}
      >
        {isPending ? 'Saving…' : saved ? '✓ Saved' : 'Save'}
      </Button>
    </div>
  )
}
