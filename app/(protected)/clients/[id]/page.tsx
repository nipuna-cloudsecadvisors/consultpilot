import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft, Pencil, Plus, Mail, Phone, Globe } from 'lucide-react'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { StatusBadge } from '@/components/shared/status-badge'
import { EngagementsList } from '@/components/engagements/engagements-list'
import { getClient } from '@/lib/actions/clients'
import { getEngagements } from '@/lib/actions/engagements'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function ClientDetailPage({ params }: PageProps) {
  const { id } = await params
  const [client, engagements] = await Promise.all([getClient(id), getEngagements(id)])

  if (!client) notFound()

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div>
        <Link
          href="/clients"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to clients
        </Link>

        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold tracking-tight">{client.name}</h1>
              <StatusBadge status={client.status} />
            </div>
            {client.industry && (
              <p className="text-muted-foreground mt-1">{client.industry}</p>
            )}
          </div>
          <Link href={`/clients/${id}/edit`} className={cn(buttonVariants({ variant: 'outline', size: 'sm' }))}>
            <Pencil className="h-4 w-4 mr-1" />
            Edit
          </Link>
        </div>
      </div>

      {/* Details grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Contact card */}
        <div className="rounded-lg border border-border p-5 space-y-3">
          <h2 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">
            Contact
          </h2>
          {client.contactName && (
            <p className="font-medium">{client.contactName}</p>
          )}
          {client.contactEmail && (
            <a
              href={`mailto:${client.contactEmail}`}
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
            >
              <Mail className="h-4 w-4" />
              {client.contactEmail}
            </a>
          )}
          {client.contactPhone && (
            <p className="flex items-center gap-2 text-sm text-muted-foreground">
              <Phone className="h-4 w-4" />
              {client.contactPhone}
            </p>
          )}
          {client.website && (
            <a
              href={client.website}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
            >
              <Globe className="h-4 w-4" />
              {client.website.replace(/^https?:\/\//, '')}
            </a>
          )}
          {!client.contactName && !client.contactEmail && !client.contactPhone && !client.website && (
            <p className="text-sm text-muted-foreground">No contact info provided</p>
          )}
        </div>

        {/* Notes card */}
        {client.notes && (
          <div className="rounded-lg border border-border p-5">
            <h2 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground mb-3">
              Notes
            </h2>
            <p className="text-sm text-foreground whitespace-pre-wrap">{client.notes}</p>
          </div>
        )}
      </div>

      {/* Engagements */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Engagements</h2>
          <Link href={`/clients/${id}/engagements/new`} className={cn(buttonVariants({ size: 'sm' }))}>
            <Plus className="h-4 w-4 mr-1" />
            New engagement
          </Link>
        </div>
        <EngagementsList clientId={id} engagements={engagements} />
      </div>
    </div>
  )
}
