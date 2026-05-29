import Link from 'next/link'
import { Plus } from 'lucide-react'
import { buttonVariants } from '@/components/ui/button'
import { ClientsTable } from '@/components/clients/clients-table'
import { getClients } from '@/lib/actions/clients'
import { cn } from '@/lib/utils'

export default async function ClientsPage() {
  const clients = await getClients()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Clients</h1>
          <p className="text-muted-foreground">Manage your client relationships</p>
        </div>
        <Link href="/clients/new" className={cn(buttonVariants())}>
          <Plus className="h-4 w-4 mr-2" />
          New client
        </Link>
      </div>

      <ClientsTable clients={clients} />
    </div>
  )
}
