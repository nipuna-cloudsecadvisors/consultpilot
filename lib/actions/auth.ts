'use server'

import { z } from 'zod'
import { redirect } from 'next/navigation'
import { getSupabaseServerClient } from '@/lib/supabase/server'

const signUpSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Enter a valid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
})

const signInSchema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(1, 'Password is required'),
})

type ActionResult = { error: string } | undefined

export async function signUp(data: unknown): Promise<ActionResult> {
  const parsed = signUpSchema.safeParse(data)
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Invalid input' }
  }

  const { name, email, password } = parsed.data
  const supabase = await getSupabaseServerClient()

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { name } },
  })

  if (error) return { error: error.message }

  redirect('/sign-in?message=Check+your+email+to+confirm+your+account')
}

export async function signIn(data: unknown): Promise<ActionResult> {
  const parsed = signInSchema.safeParse(data)
  if (!parsed.success) {
    return { error: 'Invalid email or password' }
  }

  const supabase = await getSupabaseServerClient()
  const { error } = await supabase.auth.signInWithPassword(parsed.data)

  if (error) return { error: error.message }

  const { data: aal } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel()
  if (aal?.nextLevel === 'aal2' && aal?.currentLevel !== 'aal2') {
    redirect('/mfa')
  }

  redirect('/dashboard')
}

export async function getGoogleOAuthUrl(): Promise<{ url?: string; error?: string }> {
  const supabase = await getSupabaseServerClient()
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${siteUrl}/auth/callback`,
      skipBrowserRedirect: true,
    },
  })

  if (error) return { error: error.message }
  return { url: data.url ?? undefined }
}

export async function enrollMFA(): Promise<{
  factorId?: string
  totpUri?: string
  secret?: string
  error?: string
}> {
  const supabase = await getSupabaseServerClient()
  const { data, error } = await supabase.auth.mfa.enroll({ factorType: 'totp' })

  if (error) return { error: error.message }

  return {
    factorId: data.id,
    totpUri: data.totp.uri,
    secret: data.totp.secret,
  }
}

export async function verifyMFACode(code: string, factorId?: string): Promise<ActionResult> {
  const parsed = z
    .string()
    .length(6)
    .regex(/^\d{6}$/, 'Must be a 6-digit number')
    .safeParse(code)
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? 'Enter a 6-digit code' }

  const supabase = await getSupabaseServerClient()

  let fid = factorId
  if (!fid) {
    const { data: factors } = await supabase.auth.mfa.listFactors()
    fid = factors?.totp?.[0]?.id
    if (!fid) return { error: 'No TOTP factor found. Please enroll first.' }
  }

  const { data: challenge, error: challengeError } = await supabase.auth.mfa.challenge({
    factorId: fid,
  })
  if (challengeError) return { error: challengeError.message }

  const { error: verifyError } = await supabase.auth.mfa.verify({
    factorId: fid,
    challengeId: challenge.id,
    code: parsed.data,
  })
  if (verifyError) return { error: verifyError.message }

  redirect('/dashboard')
}

export async function signOut(): Promise<void> {
  const supabase = await getSupabaseServerClient()
  await supabase.auth.signOut()
  redirect('/sign-in')
}
