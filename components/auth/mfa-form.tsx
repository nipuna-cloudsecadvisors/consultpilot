'use client'

import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { enrollMFA, verifyMFACode } from '@/lib/actions/auth'
import { ShieldCheck, KeyRound } from 'lucide-react'

interface MFAFormProps {
  mode: 'enroll' | 'verify'
}

export function MFAForm({ mode }: MFAFormProps) {
  const [step, setStep] = useState<'loading' | 'enroll-show' | 'verify'>(
    mode === 'verify' ? 'verify' : 'loading',
  )
  const [factorId, setFactorId] = useState<string | null>(null)
  const [totpUri, setTotpUri] = useState<string | null>(null)
  const [secret, setSecret] = useState<string | null>(null)
  const [code, setCode] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (mode === 'enroll') {
      enrollMFA().then((result) => {
        if (result.error) {
          setError(result.error)
          setStep('verify') // fall back to verify if already enrolled
        } else {
          setFactorId(result.factorId ?? null)
          setTotpUri(result.totpUri ?? null)
          setSecret(result.secret ?? null)
          setStep('enroll-show')
        }
      })
    }
  }, [mode])

  useEffect(() => {
    if (step === 'verify' || step === 'enroll-show') {
      inputRef.current?.focus()
    }
  }, [step])

  const handleVerify = async () => {
    if (code.length !== 6) return
    setLoading(true)
    setError(null)
    const result = await verifyMFACode(code, factorId ?? undefined)
    if (result?.error) {
      setError(result.error)
      setCode('')
      setLoading(false)
    }
    // success → server action redirects to /dashboard
  }

  if (step === 'loading') {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    )
  }

  if (step === 'enroll-show') {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <ShieldCheck className="h-4 w-4" />
          Set up two-factor authentication
        </div>

        <div className="rounded-md border border-border bg-muted/50 p-4 space-y-3">
          <p className="text-sm font-medium">1. Open your authenticator app</p>
          <p className="text-sm text-muted-foreground">
            Google Authenticator, Authy, 1Password, or any TOTP app.
          </p>
          <p className="text-sm font-medium">2. Add account manually using this secret key:</p>
          <code className="block rounded bg-background px-3 py-2 text-sm font-mono break-all select-all border border-border">
            {secret}
          </code>
          <details className="text-xs text-muted-foreground">
            <summary className="cursor-pointer hover:text-foreground">Show full TOTP URI</summary>
            <code className="mt-1 block break-all">{totpUri}</code>
          </details>
        </div>

        <div className="space-y-2">
          <p className="text-sm font-medium">3. Enter the 6-digit code from your app</p>
          <Label htmlFor="code" className="sr-only">
            Verification code
          </Label>
          <Input
            ref={inputRef}
            id="code"
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={6}
            placeholder="123456"
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
            onKeyDown={(e) => e.key === 'Enter' && handleVerify()}
            className="text-center text-lg tracking-widest"
          />
          {error && <p className="text-sm text-destructive">{error}</p>}
        </div>

        <Button onClick={handleVerify} disabled={loading || code.length !== 6} className="w-full">
          {loading ? 'Verifying…' : 'Activate & continue'}
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <KeyRound className="h-4 w-4" />
        Enter the code from your authenticator app
      </div>

      <div className="space-y-2">
        <Label htmlFor="code" className="sr-only">
          Authentication code
        </Label>
        <Input
          ref={inputRef}
          id="code"
          type="text"
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={6}
          placeholder="123456"
          value={code}
          onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
          onKeyDown={(e) => e.key === 'Enter' && handleVerify()}
          className="text-center text-2xl tracking-widest"
        />
        {error && <p className="text-sm text-destructive">{error}</p>}
      </div>

      <Button onClick={handleVerify} disabled={loading || code.length !== 6} className="w-full">
        {loading ? 'Verifying…' : 'Verify'}
      </Button>
    </div>
  )
}
