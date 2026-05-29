import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import { ProjectForm } from '@/components/projects/project-form'
import { getProject } from '@/lib/actions/projects'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function EditProjectPage({ params }: PageProps) {
  const { id } = await params
  const project = await getProject(id)

  if (!project) notFound()

  return (
    <div className="space-y-6">
      <div>
        <Link
          href={`/projects/${id}`}
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to project
        </Link>
        <h1 className="text-2xl font-bold tracking-tight">Edit project</h1>
        <p className="text-muted-foreground">{project.name}</p>
      </div>

      <ProjectForm
        engagements={[]}
        projectId={id}
        defaultValues={{
          name:       project.name,
          status:     project.status,
          startDate:  project.startDate,
          targetDate: project.targetDate,
          framework:  project.framework,
        }}
      />
    </div>
  )
}
