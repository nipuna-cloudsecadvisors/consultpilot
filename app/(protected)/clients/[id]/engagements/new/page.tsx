import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import { EngagementForm } from '@/components/engagements/engagement-form'
import { getClient } from '@/lib/actions/clients'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function NewEngagementPage({ params }: PageProps) {
  const { id } = await params
  const client = await getClient(id)

  if (!client) notFound()

  return (
    <div className="space-y-6">
      <div>
        <Link
          href={`/clients/${id}`}
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to {client.name}
        </Link>
        <h1 className="text-2xl font-bold tracking-tight">New engagement</h1>
        <p className="text-muted-foreground">Create a compliance engagement for {client.name}</p>
      </div>

      <EngagementForm clientId={id} />
    </div>
  )
}
