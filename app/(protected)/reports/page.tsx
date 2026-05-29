import { FileText } from 'lucide-react'

export default function ReportsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Reports</h1>
        <p className="text-muted-foreground">AI-generated compliance reports</p>
      </div>
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-16 text-center">
        <FileText className="mb-3 h-10 w-10 text-muted-foreground/50" />
        <p className="font-medium">Coming in Module 4</p>
        <p className="text-sm text-muted-foreground">AI-assisted report generation</p>
      </div>
    </div>
  )
}
