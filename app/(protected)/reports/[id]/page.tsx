import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import { StatusBadge } from '@/components/shared/status-badge'
import { ReportViewer } from '@/components/reports/report-viewer'
import { ChatPanel } from '@/components/ai/chat-panel'
import { getReport, getAiMessages } from '@/lib/actions/reports'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function ReportDetailPage({ params }: PageProps) {
  const { id } = await params
  const report = await getReport(id)

  if (!report) notFound()

  const project = report.certification_projects as { name: string; framework: string } | null
  const markdown = (report.content as { markdown?: string } | null)?.markdown ?? ''

  const aiMessages = await getAiMessages(report.projectId)
  const chatHistory = aiMessages.map((m) => ({
    role: m.role as 'user' | 'assistant',
    content: m.content,
  }))

  return (
    <div className="space-y-6 h-[calc(100vh-6rem)] flex flex-col">
      {/* Header */}
      <div>
        <Link
          href="/reports"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to reports
        </Link>
        <div className="flex items-center gap-3 flex-wrap">
          <h1 className="text-2xl font-bold tracking-tight">{report.title}</h1>
          <StatusBadge status={report.status} />
          {report.generatedBy === 'ai' && (
            <span className="text-xs bg-purple-100 dark:bg-purple-950/30 text-purple-700 dark:text-purple-300 rounded px-1.5 py-0.5 font-medium">
              AI Generated
            </span>
          )}
        </div>
        {project && (
          <p className="text-muted-foreground mt-1">{project.name}</p>
        )}
      </div>

      {/* Split pane */}
      <div className="flex flex-1 gap-6 min-h-0">
        {/* Report content */}
        <div className="flex-1 overflow-y-auto">
          <ReportViewer
            reportId={id}
            markdown={markdown}
            status={report.status as 'draft' | 'final'}
            projectId={report.projectId}
          />
        </div>

        {/* AI Chat */}
        <div className="w-80 shrink-0 rounded-lg border border-border flex flex-col overflow-hidden">
          <div className="border-b border-border px-4 py-2">
            <p className="text-sm font-semibold">AI Assistant</p>
            <p className="text-xs text-muted-foreground">Ask about this report or project</p>
          </div>
          <div className="flex-1 min-h-0">
            <ChatPanel
              projectId={report.projectId}
              initialMessages={chatHistory}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
