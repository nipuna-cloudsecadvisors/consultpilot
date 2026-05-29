'use client'

import { useState, useTransition } from 'react'
import { Save, Lock, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { saveReport, finaliseReport } from '@/lib/actions/reports'

interface ReportViewerProps {
  reportId: string
  markdown: string
  status: 'draft' | 'final'
  projectId: string
}

export function ReportViewer({ reportId, markdown: initial, status, projectId }: ReportViewerProps) {
  const [content, setContent] = useState(initial)
  const [editMode, setEditMode] = useState(false)
  const [saved, setSaved] = useState(false)
  const [isPending, startTransition] = useTransition()
  const isFinal = status === 'final'

  function handleSave() {
    setSaved(false)
    startTransition(async () => {
      await saveReport(reportId, content)
      setSaved(true)
      setEditMode(false)
      setTimeout(() => setSaved(false), 2000)
    })
  }

  function handleFinalise() {
    startTransition(async () => {
      await finaliseReport(reportId)
    })
  }

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      {!isFinal && (
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setEditMode((v) => !v)}
            disabled={isPending}
          >
            {editMode ? 'Preview' : 'Edit'}
          </Button>
          {editMode && (
            <Button size="sm" onClick={handleSave} disabled={isPending}>
              {isPending ? 'Saving…' : saved ? (
                <><Check className="h-4 w-4 mr-1" />Saved</>
              ) : (
                <><Save className="h-4 w-4 mr-1" />Save</>
              )}
            </Button>
          )}
          <Button
            size="sm"
            variant="outline"
            onClick={handleFinalise}
            disabled={isPending}
            className="ml-auto"
          >
            <Lock className="h-4 w-4 mr-1" />
            Finalise
          </Button>
        </div>
      )}

      {isFinal && (
        <div className="flex items-center gap-2 text-sm text-green-700 dark:text-green-400">
          <Lock className="h-4 w-4" />
          This report is finalised and locked for editing
        </div>
      )}

      {/* Content */}
      {editMode && !isFinal ? (
        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="font-mono text-sm min-h-[600px]"
          rows={40}
        />
      ) : (
        <MarkdownView content={content} />
      )}
    </div>
  )
}

function MarkdownView({ content }: { content: string }) {
  if (!content) {
    return (
      <div className="rounded-lg border border-dashed border-border p-12 text-center text-muted-foreground">
        No content yet
      </div>
    )
  }

  // Simple markdown-to-HTML rendering (no external library needed for this use case)
  const lines = content.split('\n')
  const rendered: React.ReactNode[] = []
  let i = 0

  while (i < lines.length) {
    const line = lines[i]

    if (line.startsWith('# ')) {
      rendered.push(<h1 key={i} className="text-2xl font-bold mt-6 mb-3">{line.slice(2)}</h1>)
    } else if (line.startsWith('## ')) {
      rendered.push(<h2 key={i} className="text-xl font-semibold mt-5 mb-2">{line.slice(3)}</h2>)
    } else if (line.startsWith('### ')) {
      rendered.push(<h3 key={i} className="text-lg font-semibold mt-4 mb-2">{line.slice(4)}</h3>)
    } else if (line.startsWith('- ') || line.startsWith('* ')) {
      // Collect consecutive list items
      const items: string[] = []
      while (i < lines.length && (lines[i].startsWith('- ') || lines[i].startsWith('* '))) {
        items.push(lines[i].slice(2))
        i++
      }
      rendered.push(
        <ul key={`ul-${i}`} className="list-disc list-inside space-y-1 my-2 text-sm">
          {items.map((item, j) => <li key={j}>{item}</li>)}
        </ul>,
      )
      continue
    } else if (line.match(/^\d+\. /)) {
      const items: string[] = []
      while (i < lines.length && lines[i].match(/^\d+\. /)) {
        items.push(lines[i].replace(/^\d+\. /, ''))
        i++
      }
      rendered.push(
        <ol key={`ol-${i}`} className="list-decimal list-inside space-y-1 my-2 text-sm">
          {items.map((item, j) => <li key={j}>{item}</li>)}
        </ol>,
      )
      continue
    } else if (line === '') {
      rendered.push(<div key={i} className="h-2" />)
    } else {
      rendered.push(<p key={i} className="text-sm leading-relaxed">{line}</p>)
    }

    i++
  }

  return (
    <div className="prose dark:prose-invert max-w-none rounded-lg border border-border p-6">
      {rendered}
    </div>
  )
}
