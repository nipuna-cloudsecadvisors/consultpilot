'use client'

import { useRef, useState, useTransition } from 'react'
import { Upload, Trash2, FileText, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { uploadEvidence, deleteEvidence } from '@/lib/actions/evidence'
import type { Evidence } from '@/db/schema'

interface EvidenceUploaderProps {
  controlId: string
  projectId: string
  existing: Evidence[]
}

function formatBytes(bytes: number | null): string {
  if (!bytes) return ''
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function EvidenceUploader({ controlId, projectId, existing }: EvidenceUploaderProps) {
  const fileRef = useRef<HTMLInputElement>(null)
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [notes, setNotes] = useState('')

  function handleUpload(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)

    const input = fileRef.current
    if (!input?.files?.[0]) {
      setError('Please select a file')
      return
    }

    const formData = new FormData()
    formData.append('file', input.files[0])
    formData.append('notes', notes)

    startTransition(async () => {
      const result = await uploadEvidence(controlId, projectId, formData)
      if (!result.success) {
        setError(result.error)
      } else {
        input.value = ''
        setNotes('')
      }
    })
  }

  function handleDelete(evidenceId: string, filePath: string) {
    startTransition(async () => {
      const result = await deleteEvidence(evidenceId, filePath, controlId, projectId)
      if (!result.success) setError(result.error)
    })
  }

  return (
    <div className="space-y-4">
      {/* Existing evidence */}
      {existing.length > 0 && (
        <div className="divide-y divide-border rounded-md border border-border">
          {existing.map((ev) => (
            <div key={ev.id} className="flex items-center gap-3 px-4 py-3">
              <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{ev.fileName}</p>
                {ev.notes && (
                  <p className="text-xs text-muted-foreground mt-0.5">{ev.notes}</p>
                )}
                {ev.fileSize && (
                  <p className="text-xs text-muted-foreground">{formatBytes(ev.fileSize)}</p>
                )}
              </div>
              <button
                type="button"
                onClick={() => handleDelete(ev.id, ev.filePath)}
                disabled={isPending}
                className="text-muted-foreground hover:text-destructive transition-colors disabled:opacity-50"
                aria-label="Delete evidence"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Upload form */}
      <form onSubmit={handleUpload} className="space-y-3">
        {error && (
          <p className="text-sm text-destructive">{error}</p>
        )}

        <div className="space-y-2">
          <Label htmlFor="evidence-file">Upload evidence file</Label>
          <input
            ref={fileRef}
            id="evidence-file"
            type="file"
            className="block w-full text-sm text-muted-foreground file:mr-3 file:py-1 file:px-3 file:rounded file:border file:border-border file:text-xs file:font-medium file:bg-muted file:text-foreground hover:file:bg-muted/80 cursor-pointer"
            accept=".pdf,.png,.jpg,.jpeg,.csv,.xlsx,.docx,.txt,.zip"
          />
          <p className="text-xs text-muted-foreground">PDF, images, Office files, CSV — max 25 MB</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="evidence-notes">Notes (optional)</Label>
          <Textarea
            id="evidence-notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Describe what this file demonstrates…"
            rows={2}
          />
        </div>

        <Button type="submit" size="sm" variant="outline" disabled={isPending}>
          {isPending ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Uploading…
            </>
          ) : (
            <>
              <Upload className="h-4 w-4 mr-2" />
              Upload
            </>
          )}
        </Button>
      </form>
    </div>
  )
}
