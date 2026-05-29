import { FolderKanban } from 'lucide-react'

export default function ProjectsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Projects</h1>
        <p className="text-muted-foreground">Certification & audit tracking</p>
      </div>
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-16 text-center">
        <FolderKanban className="mb-3 h-10 w-10 text-muted-foreground/50" />
        <p className="font-medium">Coming in Module 3</p>
        <p className="text-sm text-muted-foreground">Controls, evidence, and findings</p>
      </div>
    </div>
  )
}
