import { NotificationComposer } from '@/components/notifications/notification-composer'
import { NotificationsTable } from '@/components/notifications/notifications-table'
import { getNotifications } from '@/lib/actions/notifications'
import { getSupabaseServerClient } from '@/lib/supabase/server'

async function getClients() {
  const supabase = await getSupabaseServerClient()
  const { data } = await supabase
    .from('clients')
    .select('id, name, contact_phone')
    .order('name', { ascending: true })
  return (data ?? []).map((c) => ({
    id:           c.id,
    name:         c.name,
    contactPhone: c.contact_phone,
  }))
}

export default async function NotificationsPage() {
  const [notifications, clients] = await Promise.all([
    getNotifications(),
    getClients(),
  ])

  const rows = notifications.map((n) => ({
    id:              n.id,
    recipientNumber: n.recipientNumber,
    type:            n.type,
    message:         n.message,
    status:          n.status,
    sentAt:          n.sentAt,
    createdAt:       n.createdAt,
    clients:         n.clients as { name: string } | null,
  }))

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Notifications</h1>
        <p className="text-muted-foreground">
          Send WhatsApp messages to clients via the WhatsApp Business API
        </p>
      </div>

      <NotificationComposer clients={clients} />

      <div>
        <h2 className="text-lg font-semibold mb-4">Message history</h2>
        <NotificationsTable notifications={rows} />
      </div>
    </div>
  )
}
