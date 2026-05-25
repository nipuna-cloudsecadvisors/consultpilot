# ConsultPilot

GRC compliance consultation platform for solo practitioners (SOC 2, HIPAA, ISO 27001).

---

## Stack

- **Next.js 16** (App Router) + **React 19** + **TypeScript**
- **Supabase** — Postgres + Auth + Storage + Row Level Security
- **Drizzle ORM** — TypeScript schema at `db/schema.ts`; pure-SQL migrations in `supabase/migrations/`
- **shadcn/ui** + **Tailwind CSS v4**
- **react-hook-form** + **zod** for all forms
- **next-themes** — light/dark mode toggle
- **Vitest** — unit + integration tests

---

## Local Setup

### 1. Clone and install

```bash
git clone https://github.com/nipuna-cloudsecadvisors/consultpilot.git
cd consultpilot
npm install
```

### 2. Create your Supabase project

1. Go to [supabase.com](https://supabase.com) → New project
2. Copy **Project URL**, **anon key**, and **service_role key** from **Settings → API**

### 3. Configure environment variables

```bash
cp .env.example .env.local
```

Edit `.env.local` and fill in your keys:

```dotenv
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### 4. Run the database migration

In the Supabase dashboard → **SQL Editor**, paste and run the contents of:

```
supabase/migrations/20260525000000_initial.sql
```

This creates `tenants` and `users` tables, RLS policies, and the sign-up trigger.

> With the Supabase CLI: `supabase db push`

### 5. Enable Google OAuth (optional)

In Supabase → **Authentication → Providers → Google**, paste your OAuth client ID and secret.
Add `http://localhost:3000/auth/callback` as an authorised redirect URI in Google Cloud Console.

### 6. Start the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Seed demo data

```bash
npm run seed
```

Creates a demo user (`demo@consultpilot.dev` / `demo123456`) with an auto-provisioned tenant.
The on_auth_user_created trigger fires automatically, creating the tenant and owner rows.

---

## Running tests

The RLS integration test requires a live Supabase project. With `.env.local` populated:

```bash
npm test
```

The test creates two isolated users, signs in as User A, attempts to read User B's tenant row,
and asserts the result is empty (RLS enforces isolation). Tests skip cleanly if env vars are absent.

---

## Project structure

```
consultpilot/
├── app/
│   ├── (auth)/          # sign-in, sign-up, mfa — public routes
│   ├── (protected)/     # dashboard, clients, settings — requires auth + MFA
│   ├── auth/callback/   # OAuth exchange endpoint
│   ├── layout.tsx       # root layout + providers
│   └── providers.tsx    # ThemeProvider + Toaster
├── components/
│   ├── auth/            # SignInForm, SignUpForm, MFAForm
│   ├── layout/          # Sidebar, TopBar, CommandPalette
│   └── ui/              # shadcn primitives
├── db/
│   └── schema.ts        # Drizzle ORM TypeScript schema
├── lib/
│   ├── actions/auth.ts  # server actions — sign-up, sign-in, MFA, OAuth
│   ├── status.ts        # shared status colour map (green/amber/red/gray)
│   └── supabase/        # browser, server, and admin clients
├── middleware.ts         # auth guard + MFA enforcement
├── scripts/seed.ts      # demo data seed
├── supabase/migrations/ # pure-SQL migrations
└── tests/rls.test.ts    # cross-tenant RLS integration test
```

---

## Module roadmap

| Module | Status |
|--------|--------|
| 1 — Foundation & Tenancy | ✅ Done |
| 2 — Clients & Engagements | Planned |
| 3 — Certification & Audit Tracking | Planned |
| 4 — Reporting & AI Assistant | Planned |
| 5 — WhatsApp Integration | Planned |

---

## Post-setup verification checklist

- [ ] Run migration in Supabase SQL editor
- [ ] Paste keys into `.env.local`
- [ ] `npm run dev` — app loads at `localhost:3000`
- [ ] `/sign-up` — create account
- [ ] `/sign-in` — log in → redirected to `/mfa`
- [ ] Set up TOTP in authenticator app → verify code → land on `/dashboard`
- [ ] Dashboard shows your workspace name and plan
- [ ] Sidebar links (Clients, Settings) render placeholder pages
- [ ] `Cmd+K` opens the command palette
- [ ] Theme toggle switches dark/light mode
- [ ] User menu → Sign out → back to `/sign-in`
- [ ] `npm run seed` — creates demo user
- [ ] `npm test` — passes or skips cleanly
