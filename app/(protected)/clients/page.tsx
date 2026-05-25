import { Users } from 'lucide-react'

export default function ClientsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Clients</h1>
        <p className="text-muted-foreground">Manage your client engagements</p>
      </div>
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-16 text-center">
        <Users className="mb-3 h-10 w-10 text-muted-foreground/50" />
        <p className="font-medium">No clients yet</p>
        <p className="text-sm text-muted-foreground">Client management coming in Module 2</p>
      </div>
    </div>
  )
}
