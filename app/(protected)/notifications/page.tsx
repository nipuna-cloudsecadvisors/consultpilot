import { Bell } from 'lucide-react'

export default function NotificationsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Notifications</h1>
        <p className="text-muted-foreground">WhatsApp alerts & reminders</p>
      </div>
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-16 text-center">
        <Bell className="mb-3 h-10 w-10 text-muted-foreground/50" />
        <p className="font-medium">Coming in Module 5</p>
        <p className="text-sm text-muted-foreground">WhatsApp Business API integration</p>
      </div>
    </div>
  )
}
