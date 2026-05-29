'use client'

import { Bell } from 'lucide-react'
import { StatusBadge } from '@/components/shared/status-badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

interface NotificationRow {
  id: string
  recipientNumber: string
  type: string
  message: string
  status: string
  sentAt: string | null
  createdAt: string
  clients: { name: string } | null
}

interface NotificationsTableProps {
  notifications: NotificationRow[]
}

const TYPE_LABELS: Record<string, string> = {
  deadline_reminder: 'Deadline',
  report_ready:      'Report',
  finding_alert:     'Finding',
  custom:            'Custom',
}

export function NotificationsTable({ notifications }: NotificationsTableProps) {
  if (notifications.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-16 text-center">
        <Bell className="mb-3 h-10 w-10 text-muted-foreground/50" />
        <p className="font-medium">No notifications sent yet</p>
        <p className="text-sm text-muted-foreground">Use the composer above to send a WhatsApp message</p>
      </div>
    )
  }

  return (
    <div className="rounded-md border border-border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Type</TableHead>
            <TableHead>Recipient</TableHead>
            <TableHead>Client</TableHead>
            <TableHead>Message</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Sent</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {notifications.map((n) => (
            <TableRow key={n.id}>
              <TableCell>
                <span className="text-xs font-medium">
                  {TYPE_LABELS[n.type] ?? n.type}
                </span>
              </TableCell>
              <TableCell className="text-sm font-mono">{n.recipientNumber}</TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {n.clients?.name ?? '—'}
              </TableCell>
              <TableCell className="max-w-xs">
                <p className="text-sm truncate text-muted-foreground">{n.message}</p>
              </TableCell>
              <TableCell>
                <StatusBadge status={n.status} />
              </TableCell>
              <TableCell className="text-xs text-muted-foreground">
                {n.sentAt
                  ? new Date(n.sentAt).toLocaleString()
                  : new Date(n.createdAt).toLocaleString()}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
