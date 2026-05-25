import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
const ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

const missingEnv = !SUPABASE_URL || !SERVICE_KEY || !ANON_KEY

const createdUserIds: string[] = []

describe.skipIf(missingEnv)('RLS: cross-tenant row isolation', () => {
  // Clients are created lazily inside beforeAll so module-level code
  // does not throw when env vars are absent.
  let admin: SupabaseClient

  beforeAll(() => {
    admin = createClient(SUPABASE_URL!, SERVICE_KEY!, {
      auth: { autoRefreshToken: false, persistSession: false },
    })
  })

  afterAll(async () => {
    for (const id of createdUserIds) {
      await admin.auth.admin.deleteUser(id)
    }
  })

  it('user from tenant A cannot read rows belonging to tenant B', async () => {
    const ts = Date.now()
    const emailA = `rls-a-${ts}@test.invalid`
    const emailB = `rls-b-${ts}@test.invalid`
    const password = 'Test1234!'

    // Create two users — on_auth_user_created trigger provisions their tenants
    const { data: dataA, error: errA } = await admin.auth.admin.createUser({
      email: emailA,
      password,
      email_confirm: true,
      user_metadata: { name: 'User A' },
    })
    expect(errA).toBeNull()
    createdUserIds.push(dataA!.user!.id)

    const { data: dataB, error: errB } = await admin.auth.admin.createUser({
      email: emailB,
      password,
      email_confirm: true,
      user_metadata: { name: 'User B' },
    })
    expect(errB).toBeNull()
    createdUserIds.push(dataB!.user!.id)

    // Sign in as User A
    const clientA = createClient(SUPABASE_URL!, ANON_KEY!, {
      auth: { autoRefreshToken: false, persistSession: false },
    })
    const { error: signInError } = await clientA.auth.signInWithPassword({
      email: emailA,
      password,
    })
    expect(signInError).toBeNull()

    // Fetch User B's tenant_id via admin (bypasses RLS)
    const { data: userBRow } = await admin
      .from('users')
      .select('tenant_id')
      .eq('id', dataB!.user!.id)
      .single()

    const tenantBId = userBRow?.tenant_id
    expect(tenantBId).toBeTruthy()

    // Attempt to read tenant B's row as User A — must return zero rows
    const { data: rows, error: rlsError } = await clientA
      .from('tenants')
      .select('id')
      .eq('id', tenantBId)

    expect(rlsError).toBeNull()
    expect(rows).toHaveLength(0)
  })
})
