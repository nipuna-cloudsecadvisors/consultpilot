import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import { ClientForm } from '@/components/clients/client-form'

export default function NewClientPage() {
  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/clients"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to clients
        </Link>
        <h1 className="text-2xl font-bold tracking-tight">New client</h1>
        <p className="text-muted-foreground">Add a new client to your workspace</p>
      </div>

      <ClientForm />
    </div>
  )
}
