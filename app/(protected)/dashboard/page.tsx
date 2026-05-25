import { redirect } from 'next/navigation'
import { getSupabaseServerClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export default async function DashboardPage() {
  const supabase = await getSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/sign-in')

  const { data: profile } = await supabase
    .from('users')
    .select('name, role, tenant_id')
    .eq('id', user.id)
    .single()

  const { data: tenant } = profile?.tenant_id
    ? await supabase
        .from('tenants')
        .select('name, plan')
        .eq('id', profile.tenant_id)
        .single()
    : { data: null }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back, {profile?.name ?? user.email}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Workspace</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-semibold">{tenant?.name ?? '—'}</p>
            <Badge variant="secondary" className="mt-1 capitalize">
              {tenant?.plan ?? 'free'}
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Clients</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-semibold">—</p>
            <p className="text-xs text-muted-foreground">Available in Module 2</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Audits</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-semibold">—</p>
            <p className="text-xs text-muted-foreground">Available in Module 3</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
