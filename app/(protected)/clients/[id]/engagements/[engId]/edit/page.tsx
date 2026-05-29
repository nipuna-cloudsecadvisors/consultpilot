import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import { EngagementForm } from '@/components/engagements/engagement-form'
import { getEngagement } from '@/lib/actions/engagements'
import type { Engagement } from '@/db/schema'

interface PageProps {
  params: Promise<{ id: string; engId: string }>
}

export default async function EditEngagementPage({ params }: PageProps) {
  const { id, engId } = await params
  const engagement = await getEngagement(engId)

  if (!engagement) notFound()

  return (
    <div className="space-y-6">
      <div>
        <Link
          href={`/clients/${id}/engagements/${engId}`}
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to engagement
        </Link>
        <h1 className="text-2xl font-bold tracking-tight">Edit engagement</h1>
        <p className="text-muted-foreground">Update {engagement.name}</p>
      </div>

      <EngagementForm
        clientId={id}
        engagement={engagement as Engagement}
      />
    </div>
  )
}
