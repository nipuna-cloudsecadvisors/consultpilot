'use client'

import Link from 'next/link'
import { Building2, Mail, Phone, ExternalLink } from 'lucide-react'
import { StatusBadge } from '@/components/shared/status-badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import type { Client } from '@/db/schema'

interface ClientsTableProps {
  clients: Client[]
}

export function ClientsTable({ clients }: ClientsTableProps) {
  if (clients.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-16 text-center">
        <Building2 className="mb-3 h-10 w-10 text-muted-foreground/50" />
        <p className="font-medium">No clients yet</p>
        <p className="text-sm text-muted-foreground">Add your first client to get started</p>
      </div>
    )
  }

  return (
    <div className="rounded-md border border-border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Client</TableHead>
            <TableHead>Industry</TableHead>
            <TableHead>Contact</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="w-px" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {clients.map((client) => (
            <TableRow key={client.id} className="cursor-pointer hover:bg-muted/50">
              <TableCell>
                <Link href={`/clients/${client.id}`} className="block">
                  <p className="font-medium">{client.name}</p>
                  {client.website && (
                    <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                      <ExternalLink className="h-3 w-3" />
                      {client.website.replace(/^https?:\/\//, '')}
                    </p>
                  )}
                </Link>
              </TableCell>
              <TableCell className="text-muted-foreground text-sm">
                {client.industry ?? '—'}
              </TableCell>
              <TableCell>
                <div className="space-y-0.5">
                  {client.contactName && (
                    <p className="text-sm font-medium">{client.contactName}</p>
                  )}
                  {client.contactEmail && (
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <Mail className="h-3 w-3" />
                      {client.contactEmail}
                    </p>
                  )}
                  {client.contactPhone && (
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <Phone className="h-3 w-3" />
                      {client.contactPhone}
                    </p>
                  )}
                  {!client.contactName && !client.contactEmail && !client.contactPhone && (
                    <span className="text-sm text-muted-foreground">—</span>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <StatusBadge status={client.status} />
              </TableCell>
              <TableCell>
                <Link
                  href={`/clients/${client.id}`}
                  className="text-xs text-muted-foreground hover:text-foreground"
                >
                  View →
                </Link>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
