import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import { FindingForm } from '@/components/findings/finding-form'
import { getProject } from '@/lib/actions/projects'
import { getControls } from '@/lib/actions/controls'
import { getSupabaseServerClient } from '@/lib/supabase/server'
import type { Finding } from '@/db/schema'

interface PageProps {
  params: Promise<{ id: string; findingId: string }>
}

async function getFinding(id: string) {
  const supabase = await getSupabaseServerClient()
  const { data } = await supabase.from('findings').select('*').eq('id', id).single()
  return data
}

export default async function FindingDetailPage({ params }: PageProps) {
  const { id, findingId } = await params
  const [project, finding, controls] = await Promise.all([
    getProject(id),
    getFinding(findingId),
    getControls(id),
  ])

  if (!project || !finding) notFound()

  return (
    <div className="space-y-6">
      <div>
        <Link
          href={`/projects/${id}`}
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to {project.name}
        </Link>
        <h1 className="text-2xl font-bold tracking-tight">Edit finding</h1>
        <p className="text-muted-foreground">{finding.title}</p>
      </div>

      <FindingForm
        projectId={id}
        finding={finding as Finding}
        controls={controls}
      />
    </div>
  )
}
