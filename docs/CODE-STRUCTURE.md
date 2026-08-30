# Code Structure & Supabase Patterns

This document defines the **folder layout** and **Supabase access patterns** for Petverse. Follow it for every new feature so the codebase stays predictable, readable, and easy to review.

**Stack:** Next.js 16 (App Router) · Supabase (Postgres + Auth + Storage + RLS) · shadcn/ui · TanStack Query

**Related docs:** [MODULES.md](./MODULES.md) · [SUPABASE-SCHEMA.md](./SUPABASE-SCHEMA.md) · [MODULE-FLOWS.md](./MODULE-FLOWS.md)

---

## Principles

1. **Colocate by feature, share by layer** — route-specific UI lives near its route; shared primitives live in `components/ui`.
2. **One way to talk to Supabase** — never import `@supabase/supabase-js` directly in pages; always go through `lib/supabase/*` and domain query modules.
3. **Server-first data** — prefer Server Components + server queries; use client + TanStack Query only when the UI must be interactive.
4. **Thin routes, fat modules** — `page.tsx` composes components and calls query/action functions; it should not contain SQL or long business logic.
5. **Single clinic** — no tenant slug in URLs for MVP; business branding comes from the singleton `business_settings` row.

---

## Target folder structure

```text
petverse/
├── app/                          # Next.js App Router — routes only
│   ├── layout.tsx                # Root layout (font, providers)
│   ├── globals.css               # Design tokens + Tailwind
│   ├── page.tsx                  # Public landing (/)
│   │
│   ├── (public)/                 # Unauthenticated marketing + booking
│   │   ├── book/
│   │   │   └── page.tsx
│   │   ├── pay/[token]/
│   │   │   └── page.tsx
│   │   └── passport/[petId]/
│   │       └── page.tsx
│   │
│   ├── (auth)/                   # Staff auth (no admin chrome)
│   │   ├── login/page.tsx
│   │   ├── signup/page.tsx
│   │   ├── forgot-password/page.tsx
│   │   ├── reset-password/page.tsx
│   │   └── confirm/route.ts      # Supabase email confirm callback
│   │
│   ├── (admin)/                  # Staff dashboard (sidebar layout)
│   │   ├── layout.tsx            # Admin shell: Sidebar + header
│   │   └── admin/
│   │       ├── home/page.tsx
│   │       ├── scheduling/
│   │       │   ├── calendar/page.tsx
│   │       │   ├── board/page.tsx
│   │       │   ├── boarding/page.tsx
│   │       │   └── daycare/page.tsx
│   │       ├── clients/
│   │       │   ├── owners/page.tsx
│   │       │   └── pets/page.tsx
│   │       ├── catalog/
│   │       │   ├── services/page.tsx
│   │       │   ├── categories/page.tsx
│   │       │   └── packages/page.tsx
│   │       ├── communications/inbox/page.tsx
│   │       ├── sales/appointments/page.tsx
│   │       └── settings/team/page.tsx
│   │
│   ├── (staff)/                  # Light staff tools (optional separate layout)
│   │   └── staff/daily-pet-updates/page.tsx
│   │
│   └── api/                      # Route handlers (webhooks, public JSON, uploads)
│       └── webhooks/
│           └── payments/route.ts
│
├── components/
│   ├── ui/                       # shadcn primitives — DO NOT put business logic here
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   └── ...
│   │
│   ├── layout/                   # App shells shared across routes
│   │   ├── admin-sidebar.tsx
│   │   ├── admin-header.tsx
│   │   ├── public-header.tsx
│   │   └── public-footer.tsx
│   │
│   ├── shared/                   # Reusable composites (no route coupling)
│   │   ├── data-table.tsx
│   │   ├── status-badge.tsx
│   │   ├── empty-state.tsx
│   │   ├── page-header.tsx
│   │   └── confirm-dialog.tsx
│   │
│   ├── booking/                  # Feature: public booking wizard
│   │   ├── booking-wizard.tsx
│   │   ├── service-picker.tsx
│   │   ├── slot-picker.tsx
│   │   └── booking-summary.tsx
│   │
│   ├── scheduling/               # Feature: calendar, kanban, appointments
│   ├── clients/                  # Feature: owners, pets CRM
│   ├── catalog/                  # Feature: services, packages
│   └── auth/                     # Feature: login/signup forms
│       ├── login-form.tsx
│       └── signup-form.tsx
│
├── lib/
│   ├── supabase/                 # Supabase clients — low-level only
│   │   ├── client.ts             # Browser client (Client Components)
│   │   ├── server.ts             # Server client (RSC, Route Handlers, Actions)
│   │   └── middleware.ts         # Session refresh (proxy.ts / middleware)
│   │
│   ├── supabase/queries/         # Read operations — one file per domain
│   │   ├── business-settings.ts
│   │   ├── catalog.ts
│   │   ├── appointments.ts
│   │   ├── owners.ts
│   │   ├── pets.ts
│   │   └── employees.ts
│   │
│   ├── supabase/mutations/       # Write operations — one file per domain
│   │   ├── appointments.ts
│   │   ├── owners.ts
│   │   └── pets.ts
│   │
│   ├── supabase/types/           # Generated + app-level DB types
│   │   ├── database.types.ts     # Generated via Supabase CLI (do not hand-edit)
│   │   └── index.ts              # Re-exports + Row/Insert/Update helpers
│   │
│   ├── validations/              # Zod schemas (shared client + server)
│   │   ├── auth.ts
│   │   ├── booking.ts
│   │   └── appointment.ts
│   │
│   ├── auth/                     # Auth helpers (session, guards, permissions)
│   │   ├── session.ts            # getSession(), requireStaff()
│   │   └── permissions.ts        # can('appointments:write')
│   │
│   ├── constants/                # Enums, status maps, nav config
│   │   ├── appointment-status.ts
│   │   └── admin-nav.ts
│   │
│   └── utils.ts                  # cn(), formatters — generic only
│
├── hooks/                        # Client hooks
│   ├── use-mobile.ts
│   └── queries/                  # TanStack Query hooks (wrap lib/supabase/queries)
│       ├── use-appointments.ts
│       └── use-catalog.ts
│
├── types/                        # Non-DB app types (UI props, form state)
│   └── booking.ts
│
├── supabase/                     # Supabase project config (repo-local)
│   ├── migrations/               # SQL migrations (source of truth for schema)
│   ├── seed.sql                  # Dev seed data
│   └── config.toml               # Supabase CLI config (optional)
│
├── docs/                         # Product + engineering docs
├── public/                       # Static assets
└── components.json               # shadcn config
```

---

## Route groups explained

| Group | Purpose | Auth |
|-------|---------|------|
| `(public)` | Landing, booking, pay link, passport | None |
| `(auth)` | Login, signup, password reset | Guest only (redirect if logged in) |
| `(admin)` | Full operations dashboard | Staff session required |
| `(staff)` | Floor tools (daily updates) | Staff session required |

**Naming rule:** Route groups `(name)` do **not** appear in the URL.  
`(admin)/admin/home/page.tsx` → `/admin/home`.

Each group gets its own `layout.tsx` when the chrome differs (public header vs admin sidebar).

---

## Component placement rules

| If the component is… | Put it in… |
|----------------------|------------|
| A shadcn primitive (Button, Input, Dialog) | `components/ui/` |
| Used on 2+ unrelated features | `components/shared/` |
| Specific to one product module | `components/<feature>/` |
| A page shell (sidebar, header) | `components/layout/` |
| Only used by one route | `app/.../_components/` (optional colocation) |

**Do not** import from `components/booking/` inside `components/clients/` — lift shared pieces to `components/shared/`.

### File naming

- Components: `kebab-case.tsx` → export `PascalCase` (`booking-wizard.tsx` → `BookingWizard`)
- Hooks: `use-*.ts`
- Queries: plural domain noun (`appointments.ts`, not `getAppointments.ts`)

---

## Supabase client layer

Three clients — use the right one, never mix patterns.

### 1. Browser client — `lib/supabase/client.ts`

```ts
// Client Components, auth forms, realtime subscriptions
import { createClient } from '@/lib/supabase/client'

const supabase = createClient()
```

Use when:
- Interactive forms (login, signup)
- Client-side TanStack Query fetchers
- Realtime channels (future)

### 2. Server client — `lib/supabase/server.ts`

```ts
// Server Components, Server Actions, Route Handlers
import { createClient } from '@/lib/supabase/server'

const supabase = await createClient()
```

Use when:
- Loading data in RSC `page.tsx` / `layout.tsx`
- Server Actions that mutate data
- Route Handlers (`app/api/**`)

### 3. Middleware client — `lib/supabase/middleware.ts`

Used in `middleware.ts` (or `proxy.ts`) to refresh the auth session cookie on every request.  
Do not duplicate cookie logic elsewhere.

---

## Supabase data access pattern

**Never** call `supabase.from('...')` directly in `page.tsx`. Always go through query/mutation modules.

### Queries (reads) — `lib/supabase/queries/<domain>.ts`

```ts
import { createClient } from '@/lib/supabase/server'
import type { AppointmentRow } from '@/lib/supabase/types'

export async function getAppointmentsByDate(date: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('appointments')
    .select(`
      id,
      status,
      starts_at,
      owner:owners ( id, full_name, phone ),
      pet:pets ( id, name ),
      service:services ( id, name ),
      employee:employees ( id, full_name )
    `)
    .gte('starts_at', `${date}T00:00:00`)
    .lt('starts_at', `${date}T23:59:59`)
    .order('starts_at')

  if (error) throw error
  return data
}
```

**Rules:**
- One exported function per use case (`getX`, `listX`, `lookupXByPhone`)
- Always handle `error` — throw in server context, return `{ data, error }` in client fetchers
- Keep `select()` explicit — avoid `select('*')` in production queries
- Co-locate related joins in the same file (don't split owners/pets fetch across files for one screen)

### Mutations (writes) — `lib/supabase/mutations/<domain>.ts`

```ts
'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { requireStaff } from '@/lib/auth/session'
import { createAppointmentSchema } from '@/lib/validations/appointment'

export async function confirmAppointment(id: string) {
  await requireStaff()
  const supabase = await createClient()

  const { error } = await supabase
    .from('appointments')
    .update({ status: 'confirmed' })
    .eq('id', id)

  if (error) throw error
  revalidatePath('/admin/scheduling/board')
}
```

**Rules:**
- Prefer **Server Actions** in `mutations/` for admin writes
- Always call `requireStaff()` (or equivalent) at the top of staff mutations
- Validate input with Zod from `lib/validations/` before touching the DB
- Call `revalidatePath()` / `revalidateTag()` after mutations that affect RSC data

### When to use Route Handlers (`app/api/`)

Use route handlers only for:
- Webhooks (Stripe/Square, WhatsApp)
- Public endpoints consumed by external clients
- File upload endpoints that need special headers

Do **not** create REST wrappers for every table — Server Actions + RSC are enough for this app.

---

## Database types

Generate types from your Supabase project:

```bash
npx supabase gen types typescript --project-id <id> > lib/supabase/types/database.types.ts
```

Then re-export helpers in `lib/supabase/types/index.ts`:

```ts
import type { Database } from './database.types'

export type Tables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Row']

export type AppointmentRow = Tables<'appointments'>
export type AppointmentStatus = AppointmentRow['status']
```

**Never hand-edit `database.types.ts`** — regenerate after migrations.

---

## Auth pattern

```text
lib/auth/
├── session.ts       # getSession(), getStaff(), requireStaff(), requireAdmin()
└── permissions.ts # role/permission checks against employees + RBAC tables
```

| Function | Use |
|----------|-----|
| `getSession()` | Optional — returns null if guest |
| `requireStaff()` | Throws / redirects — admin layouts, mutations |
| `requireAdmin()` | Settings, team management |

Staff link: `employees.user_id` → `auth.users.id` (see [SUPABASE-SCHEMA.md](./SUPABASE-SCHEMA.md)).

Auth forms stay in `components/auth/`; thin wrappers in `lib/auth/` for signup helpers if needed. Prefer Server Actions for login redirect flow when possible.

---

## Client data fetching (TanStack Query)

Use TanStack Query **only** when the UI needs client-side refetch, polling, or optimistic updates (calendar drag, kanban board, inbox).

```text
lib/supabase/queries/appointments.ts   ← pure fetch function (usable on server too)
hooks/queries/use-appointments.ts      ← useQuery wrapper for client components
```

```ts
// hooks/queries/use-appointments.ts
'use client'

import { useQuery } from '@tanstack/react-query'
import { getAppointmentsByDate } from '@/lib/supabase/queries/appointments'

export function useAppointmentsByDate(date: string) {
  return useQuery({
    queryKey: ['appointments', date],
    queryFn: () => getAppointmentsByDate(date),
  })
}
```

Add a `QueryProvider` in `components/providers.tsx` when you introduce the first client query.

---

## Validations

All form schemas live in `lib/validations/`:

```ts
// lib/validations/booking.ts
import { z } from 'zod'

export const createBookingSchema = z.object({
  serviceId: z.string().uuid(),
  startsAt: z.string().datetime(),
  ownerPhone: z.string().min(10),
  petId: z.string().uuid(),
})

export type CreateBookingInput = z.infer<typeof createBookingSchema>
```

Use the **same schema** in:
- Client forms (`react-hook-form` + `zodResolver`)
- Server Actions (parse before DB write)

---

## Migrations & schema

| What | Where |
|------|-------|
| SQL migrations | `supabase/migrations/YYYYMMDDHHMMSS_description.sql` |
| Schema reference doc | `docs/SUPABASE-SCHEMA.md` |
| RLS policies | Same migration files as table creation |
| Seed data | `supabase/seed.sql` |

**Workflow:**
1. Write migration SQL locally
2. Apply via Supabase CLI or dashboard
3. Regenerate `database.types.ts`
4. Add query/mutation functions
5. Build UI

Follow phase order in [SUPABASE-SCHEMA.md](./SUPABASE-SCHEMA.md): Phase 1 (core booking) before Phase 2 (boarding/billing).

---

## RLS conventions

- **Public read:** `business_settings`, active `services`, `service_categories` — select allowed for `anon`
- **Public write:** booking flow inserts `owners`, `pets`, `appointments` via controlled Server Actions using service role **or** narrow RLS insert policies
- **Staff read/write:** authenticated users linked to `employees` row
- **Never** expose service role key to the client

Document each table's policies in the migration file comment block.

---

## Example: adding a feature end-to-end

**Feature:** Admin appointments list (`/admin/sales/appointments`)

1. **Route:** `app/(admin)/admin/sales/appointments/page.tsx` — Server Component, calls query
2. **Query:** `lib/supabase/queries/appointments.ts` → `listAppointments(filters)`
3. **UI:** `components/scheduling/appointments-table.tsx` — uses `DataTable` + `StatusBadge`
4. **Mutation:** `lib/supabase/mutations/appointments.ts` → `cancelAppointment(id)`
5. **Validation:** `lib/validations/appointment.ts`
6. **Constants:** `lib/constants/appointment-status.ts` — maps status → badge variant
7. **Types:** regenerate if schema changed

---

## Import aliases

Use `@/` prefix (configured in `tsconfig.json`):

```ts
import { Button } from '@/components/ui/button'
import { getAppointmentsByDate } from '@/lib/supabase/queries/appointments'
import { cn } from '@/lib/utils'
```

**Avoid deep relative imports** (`../../../`).

---

## Checklist before opening a PR

- [ ] No Supabase calls in `page.tsx` — only in `lib/supabase/queries|mutations`
- [ ] Staff mutations call `requireStaff()`
- [ ] Input validated with Zod on the server
- [ ] New UI uses `components/ui/*` primitives + design tokens from `globals.css`
- [ ] Feature components in correct folder (`components/<feature>/`)
- [ ] Types regenerated if schema changed
- [ ] `revalidatePath` added after mutations affecting RSC pages

---

## Current repo vs target

What exists today and where it should move as you build:

| Current | Target |
|---------|--------|
| `app/page.tsx` (landing) | Keep; extract header/footer to `components/layout/` |
| `lib/auth.ts` (signUp only) | Expand into `lib/auth/session.ts` + `components/auth/` |
| `lib/supabase/client.ts`, `server.ts` | Keep; add `middleware.ts` |
| No `lib/supabase/queries/` | Create on first data feature |
| No `supabase/migrations/` | Add when first migration is written |
| `docs/SUPABASE-SCHEMA.md` | Stays as schema reference; migrations are executable source |

---

## Related documents

- [MODULES.md](./MODULES.md) — product modules and routes
- [SUPABASE-SCHEMA.md](./SUPABASE-SCHEMA.md) — tables, enums, phases
- [MODULE-FLOWS.md](./MODULE-FLOWS.md) — user flows per screen
- [ARCHITECTURE.md](./ARCHITECTURE.md) — high-level system design (legacy NestJS notes — prefer Supabase patterns in this doc)
