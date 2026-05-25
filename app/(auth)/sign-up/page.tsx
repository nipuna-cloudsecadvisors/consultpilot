import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { SignUpForm } from '@/components/auth/sign-up-form'

export default function SignUpPage() {
  return (
    <Card>
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl">Create account</CardTitle>
        <CardDescription>Start your ConsultPilot workspace — free forever for solo practitioners</CardDescription>
      </CardHeader>
      <CardContent>
        <SignUpForm />
      </CardContent>
    </Card>
  )
}
