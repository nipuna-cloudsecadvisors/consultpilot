import { redirect } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { MFAForm } from '@/components/auth/mfa-form'
import { getSupabaseServerClient } from '@/lib/supabase/server'

export default async function MFAPage() {
  const supabase = await getSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/sign-in')

  const { data: factors } = await supabase.auth.mfa.listFactors()
  const hasTotp = (factors?.totp?.length ?? 0) > 0

  return (
    <Card>
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl">Two-factor authentication</CardTitle>
        <CardDescription>
          {hasTotp
            ? 'Enter the code from your authenticator app to continue.'
            : 'Secure your account by setting up an authenticator app.'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <MFAForm mode={hasTotp ? 'verify' : 'enroll'} />
      </CardContent>
    </Card>
  )
}
