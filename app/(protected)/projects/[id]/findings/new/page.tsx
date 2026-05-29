import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import { FindingForm } from '@/components/findings/finding-form'
import { getProject } from '@/lib/actions/projects'
import { getControls } from '@/lib/actions/controls'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function NewFindingPage({ params }: PageProps) {
  const { id } = await params
  const [project, controls] = await Promise.all([getProject(id), getControls(id)])

  if (!project) notFound()

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
        <h1 className="text-2xl font-bold tracking-tight">New finding</h1>
        <p className="text-muted-foreground">Record a compliance finding or gap</p>
      </div>

      <FindingForm projectId={id} controls={controls} />
    </div>
  )
}
