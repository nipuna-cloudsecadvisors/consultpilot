import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('Missing env vars. Create .env.local with NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
})

async function seed() {
  console.log('Seeding demo data…\n')

  // Create demo auth user — the on_auth_user_created trigger will auto-create tenant + user row
  const { data: existing } = await supabase.auth.admin.listUsers()
  const alreadyExists = existing.users.some((u) => u.email === 'demo@consultpilot.dev')

  if (alreadyExists) {
    console.log('ℹ  Demo user already exists — skipping user creation.')
  } else {
    const { data, error } = await supabase.auth.admin.createUser({
      email: 'demo@consultpilot.dev',
      password: 'demo123456',
      email_confirm: true,
      user_metadata: { name: 'Demo Owner' },
    })

    if (error) {
      console.error('Failed to create demo user:', error.message)
      process.exit(1)
    }

    console.log('✓  Created demo auth user:', data.user?.email)
    console.log('✓  Trigger auto-created: tenant "Demo Owner\'s Workspace" + owner user row')
  }

  console.log('\nℹ  Client seed → deferred to Module 2')
  console.log('ℹ  Certification project seed → deferred to Module 3')
  console.log('\n── Seed complete ──────────────────────────────')
  console.log('   Email:    demo@consultpilot.dev')
  console.log('   Password: demo123456')
  console.log('   Visit:    http://localhost:3000/sign-in')
}

seed().catch((err) => {
  console.error(err)
  process.exit(1)
})
