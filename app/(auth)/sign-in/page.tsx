import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { SignInForm } from '@/components/auth/sign-in-form'

interface SearchParams {
  message?: string
  error?: string
}

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const params = await searchParams
  return (
    <Card>
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl">Sign in</CardTitle>
        <CardDescription>Sign in to your ConsultPilot account</CardDescription>
      </CardHeader>
      <CardContent>
        <SignInForm message={params.message} error={params.error} />
      </CardContent>
    </Card>
  )
}
