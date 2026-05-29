import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import { ProjectForm } from '@/components/projects/project-form'
import { getSupabaseServerClient } from '@/lib/supabase/server'

async function getAllEngagements() {
  const supabase = await getSupabaseServerClient()
  const { data } = await supabase
    .from('engagements')
    .select('id, name, type, clients(name)')
    .order('created_at', { ascending: false })
  return data ?? []
}

export default async function NewProjectPage() {
  const engagements = await getAllEngagements()

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/projects"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to projects
        </Link>
        <h1 className="text-2xl font-bold tracking-tight">New project</h1>
        <p className="text-muted-foreground">
          Create a certification project — controls will be auto-seeded from the framework
        </p>
      </div>

      <ProjectForm engagements={engagements as unknown as Parameters<typeof ProjectForm>[0]['engagements']} />
    </div>
  )
}
