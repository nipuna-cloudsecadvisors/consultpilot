import { Settings } from 'lucide-react'

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">Manage your workspace preferences</p>
      </div>
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-16 text-center">
        <Settings className="mb-3 h-10 w-10 text-muted-foreground/50" />
        <p className="font-medium">Settings</p>
        <p className="text-sm text-muted-foreground">Workspace settings coming soon</p>
      </div>
    </div>
  )
}
