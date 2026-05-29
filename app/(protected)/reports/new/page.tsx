import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import { ReportGenerateForm } from '@/components/reports/report-generate-form'
import { getSupabaseServerClient } from '@/lib/supabase/server'

async function getProjects() {
  const supabase = await getSupabaseServerClient()
  const { data } = await supabase
    .from('certification_projects')
    .select('id, name, framework')
    .order('created_at', { ascending: false })
  return data ?? []
}

export default async function NewReportPage() {
  const projects = await getProjects()

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/reports"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to reports
        </Link>
        <h1 className="text-2xl font-bold tracking-tight">Generate report</h1>
        <p className="text-muted-foreground">
          AI analyses your project controls and findings to produce a draft report
        </p>
      </div>

      <ReportGenerateForm projects={projects} />
    </div>
  )
}
