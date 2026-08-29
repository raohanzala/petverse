# Supabase Schema — Pet Care Booking Platform

Complete database plan for building this project on **Supabase** (PostgreSQL + Auth + Storage + RLS).  
Reference product: [Petverse demo](https://petverse-nine.vercel.app/).

> **Single business — not multi-tenant.** Petverse is one clinic (“Pet Company 1”). There is no `tenants` table and no `tenant_id` on rows. Business name, logo, timezone, and currency live in one **`business_settings`** row (singleton). If you ever need multiple clinics later, you can add tenancy then — don’t build it for MVP.

**How to use this doc**

1. Create tables in **Phase 1** first → build MVP frontend (landing, book, login, calendar, confirm queue).
2. Add **Phase 2** when you need boarding, daycare, and payments.
3. Add **Phase 3** for WhatsApp funnel, campaigns, retention, stock, etc.

Related: [MODULES.md](./MODULES.md) · [MODULE-FLOWS.md](./MODULE-FLOWS.md) · [ARCHITECTURE.md](./ARCHITECTURE.md)

---

## Phase overview

| Phase | Goal | Tables | Frontend you unlock |
|-------|------|--------|---------------------|
| **1 — Core (MVP)** | End-to-end booking loop | **11 tables** | Landing, `/book`, login, calendar, Daily Ops board, confirm/reject queue, catalog + team admin |
| **2 — Extended ops** | Boarding, daycare, billing | **+16 tables** | Boarding room board, daycare check-in, invoices, pay link |
| **3 — Growth** | CRM, comms, compliance, retail | **+22 tables** | WhatsApp funnel home, campaigns, passport, photos, stock, retention |

```text
Phase 1 (build first)
├── business_settings          ← single row: name, logo, timezone, currency
├── service_categories, services, service_packages, service_package_steps
├── employees, employee_schedules, employee_services
├── owners, pets
└── appointments

Phase 2 (after MVP works)
├── boarding: facility_resources, reservations, boarding_waitlist, …
├── daycare: daycare_pricing, daycare_packages, daycare_transactions, …
└── billing: invoices, invoice_line_items, deposits, payment_tokens

Phase 3 (later)
├── communications, campaigns, reminders
├── compliance: vaccines, consent forms
├── media: daily_updates, pet_photos
└── inventory, retention, targets
```

---

## Supabase setup (before tables)

### Auth

- Use **Supabase Auth** (email + password) for staff/admin.
- Link staff to `employees.user_id` → `auth.users.id`.
- Pet parents **do not** get accounts; they book via phone lookup on `owners.phone`.

### Storage buckets (Phase 1 optional, Phase 3 required)

| Bucket | Phase | Purpose |
|--------|-------|---------|
| `business-assets` | 1 | Logo, landing images |
| `pet_update_images` | 3 | Daily pet photos for owners |

### Extensions (run once in SQL editor)

```sql
create extension if not exists "pgcrypto";
```

---

# PHASE 1 — CORE (implement first)

> **MVP definition:** A customer can book online → staff sees **requested** appointment → confirms on calendar/board → appointment moves through statuses.  
> **You do NOT need** boarding, daycare, invoices, WhatsApp, or campaigns for this.

## 1.1 Enums (Phase 1)

```sql
-- Staff job type (calendar column / role badge)
create type employee_role as enum (
  'admin',
  'veterinarian',
  'groomer',
  'boarding_attendant',
  'vet_technician',
  'receptionist'
);

-- Service line (drives public book grouping)
create type service_kind as enum (
  'grooming',
  'veterinary',
  'boarding',
  'daycare',
  'other'
);

-- Package step execution
create type package_step_mode as enum ('sequential', 'parallel');

-- Appointment pipeline (matches Daily Ops kanban)
create type appointment_status as enum (
  'requested',    -- online book default; Pending Review
  'confirmed',    -- staff confirmed
  'arrived',      -- in lobby
  'in_service',
  'completed',
  'cancelled',
  'no_show'
);

create type appointment_source as enum (
  'online',
  'admin',
  'phone'
);
```

## 1.2 Business settings (singleton)

One row for the whole app — branding, locale, contact.

| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid PK | Fixed seed id or single row |
| `business_name` | text | e.g. Pet Company 1 |
| `logo_url` | text | Storage URL |
| `timezone` | text | e.g. `Asia/Dubai` |
| `currency` | text | e.g. `USD`, `AED` |
| `phone` | text | Clinic phone |
| `email` | text | |
| `address` | text | optional |
| `hero_title` | text | Landing headline |
| `hero_subtitle` | text | Landing subtext |
| `created_at` / `updated_at` | timestamptz | |

```sql
create table business_settings (
  id uuid primary key default gen_random_uuid(),
  business_name text not null default 'Pet Company 1',
  logo_url text,
  timezone text not null default 'UTC',
  currency text not null default 'USD',
  phone text,
  email text,
  address text,
  hero_title text,
  hero_subtitle text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Enforce singleton (only one settings row allowed)
create unique index business_settings_singleton on business_settings ((true));
```

**Frontend:** `/` landing, header on `/book` and `/admin`.  
**Query:** `select * from business_settings limit 1` — no slug, no tenant lookup.

---

## 1.3 Catalog

### `service_categories`

| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid PK | |
| `name` | text | e.g. Grooming, Veterinary |
| `slug` | text UNIQUE | |
| `description` | text | |
| `sort_order` | int | default 0 |
| `is_active` | boolean | |

### `services`

| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid PK | |
| `category_id` | uuid FK → service_categories nullable | |
| `name` | text | |
| `description` | text | |
| `kind` | service_kind | |
| `duration_minutes` | int | Slot length |
| `price` | numeric(10,2) | |
| `is_active` | boolean | |
| `is_public` | boolean | Show on `/book` |

### `service_packages`

| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid PK | |
| `name` | text | e.g. Deluxe Spa Package |
| `description` | text | |
| `price` | numeric(10,2) | |
| `duration_minutes` | int | Total block time |
| `step_mode` | package_step_mode | sequential \| parallel |
| `is_active` | boolean | |

### `service_package_steps`

| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid PK | |
| `package_id` | uuid FK → service_packages | |
| `service_id` | uuid FK → services | |
| `step_order` | int | 1, 2, 3… |
| `parallel_group` | int | Same number = run together |
| `override_duration_minutes` | int | optional |
| `override_price` | numeric(10,2) | optional |

```sql
create table service_categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  sort_order int not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table services (
  id uuid primary key default gen_random_uuid(),
  category_id uuid references service_categories(id) on delete set null,
  name text not null,
  description text,
  kind service_kind not null default 'other',
  duration_minutes int not null,
  price numeric(10,2) not null,
  is_active boolean not null default true,
  is_public boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table service_packages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  price numeric(10,2) not null,
  duration_minutes int not null,
  step_mode package_step_mode not null default 'sequential',
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table service_package_steps (
  id uuid primary key default gen_random_uuid(),
  package_id uuid not null references service_packages(id) on delete cascade,
  service_id uuid not null references services(id) on delete restrict,
  step_order int not null,
  parallel_group int,
  override_duration_minutes int,
  override_price numeric(10,2)
);

create index idx_package_steps_package on service_package_steps(package_id);
```

**Frontend:** `/book` step 1, `/admin/catalog/*`.

---

## 1.4 Team (staff)

### `employees`

| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid PK | |
| `user_id` | uuid FK → auth.users | nullable until linked |
| `display_name` | text | |
| `initials` | text | Calendar avatar |
| `avatar_url` | text | |
| `role` | employee_role | |
| `job_title` | text | e.g. Senior Groomer |
| `color` | text | Hex for calendar column |
| `is_active` | boolean | |

Unique: `user_id` where user_id is not null

### `employee_schedules`

Working hours for slot calculation.

| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid PK | |
| `employee_id` | uuid FK | |
| `day_of_week` | int | 0=Sun … 6=Sat |
| `start_time` | time | |
| `end_time` | time | |

### `employee_services`

Which services each staff member can perform.

| Column | Type | Notes |
|--------|------|-------|
| `employee_id` | uuid FK | |
| `service_id` | uuid FK | |
| PK | (employee_id, service_id) | |

```sql
create table employees (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  display_name text not null,
  initials text,
  avatar_url text,
  role employee_role not null,
  job_title text,
  color text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index idx_employees_user on employees(user_id) where user_id is not null;

create table employee_schedules (
  id uuid primary key default gen_random_uuid(),
  employee_id uuid not null references employees(id) on delete cascade,
  day_of_week int not null check (day_of_week between 0 and 6),
  start_time time not null,
  end_time time not null
);

create index idx_schedules_employee on employee_schedules(employee_id);

create table employee_services (
  employee_id uuid not null references employees(id) on delete cascade,
  service_id uuid not null references services(id) on delete cascade,
  primary key (employee_id, service_id)
);
```

**Frontend:** `/admin/scheduling/calendar`, `/admin/settings/team`, `/book` step 2 (staff preference + auto-assign).

---

## 1.5 Clients

### `owners` (pet parents)

| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid PK | |
| `name` | text | |
| `phone` | text UNIQUE | **Lookup key** on `/book` |
| `email` | text | optional |
| `preferred_contact` | text | phone, email, whatsapp |
| `created_at` / `updated_at` | timestamptz | |

### `pets`

| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid PK | |
| `owner_id` | uuid FK → owners | |
| `name` | text | |
| `species` | text | dog, cat, … |
| `breed` | text | |
| `birth_date` | date | |
| `weight_kg` | numeric(6,2) | |
| `color` | text | |
| `notes` | text | |
| `is_active` | boolean | |

```sql
create table owners (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text not null unique,
  email text,
  preferred_contact text default 'phone',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_owners_phone on owners(phone);

create table pets (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references owners(id) on delete cascade,
  name text not null,
  species text not null default 'dog',
  breed text,
  birth_date date,
  weight_kg numeric(6,2),
  color text,
  notes text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_pets_owner on pets(owner_id);
```

**Frontend:** `/book` steps 3–4, `/admin/clients/owners`, `/admin/clients/pets`.

---

## 1.6 Appointments (heart of the product)

### `appointments`

| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid PK | |
| `owner_id` | uuid FK | |
| `pet_id` | uuid FK | |
| `service_id` | uuid FK | nullable if package |
| `package_id` | uuid FK | nullable if single service |
| `employee_id` | uuid FK → employees | assigned pro |
| `preferred_employee_id` | uuid FK | optional from book step 2 |
| `status` | appointment_status | default `requested` |
| `source` | appointment_source | default `online` |
| `starts_at` | timestamptz | |
| `ends_at` | timestamptz | |
| `duration_minutes` | int | |
| `price` | numeric(10,2) | |
| `group_id` | uuid | Package steps share same group_id |
| `step_order` | int | For multi-step packages |
| `notes` | text | |
| `cancelled_at` | timestamptz | |
| `cancel_reason` | text | |

```sql
create table appointments (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references owners(id) on delete restrict,
  pet_id uuid not null references pets(id) on delete restrict,
  service_id uuid references services(id) on delete set null,
  package_id uuid references service_packages(id) on delete set null,
  employee_id uuid references employees(id) on delete set null,
  preferred_employee_id uuid references employees(id) on delete set null,
  status appointment_status not null default 'requested',
  source appointment_source not null default 'online',
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  duration_minutes int not null,
  price numeric(10,2) not null,
  group_id uuid,
  step_order int,
  notes text,
  cancelled_at timestamptz,
  cancel_reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (service_id is not null or package_id is not null)
);

create index idx_appts_date on appointments(starts_at);
create index idx_appts_status on appointments(status);
create index idx_appts_employee_date on appointments(employee_id, starts_at);
create index idx_appts_group on appointments(group_id) where group_id is not null;
```

**Frontend mapping (Phase 1 — no extra tables):**

| Screen | Query |
|--------|-------|
| `/book` submit | INSERT `appointments` status=`requested` |
| Inbox / Message queue | SELECT where `status = 'requested'` |
| Confirm | UPDATE `status = 'confirmed'` |
| Daily Ops board | GROUP BY `status` for selected date |
| Calendar | SELECT by `starts_at` + `employee_id` |
| Admin home “Today” | COUNT appointments for today |

---

## Phase 1 — MVP frontend checklist

Build frontend **only after** these 11 tables exist (+ seed data):

| # | Table | Required seed |
|---|-------|---------------|
| 1 | `business_settings` | 1 row: name, timezone, currency |
| 2 | `service_categories` | Grooming, Veterinary, … |
| 3 | `services` | 5–10 bookable services |
| 4 | `service_packages` | 1–2 packages (optional but Petverse has them) |
| 5 | `service_package_steps` | if packages |
| 6 | `employees` | 3–6 staff |
| 7 | `employee_schedules` | Mon–Sat hours |
| 8 | `employee_services` | link staff ↔ services |
| 9 | `owners` | optional test customer |
| 10 | `pets` | optional |
| 11 | `appointments` | empty |

**MVP screens (Phase 1 frontend):**

1. `/` — landing (read `business_settings`)
2. `/login` — Supabase Auth
3. `/book` — 5-step wizard
4. `/admin/home` — today stats (appointment counts only; no WhatsApp yet)
5. `/admin/scheduling/calendar` — resource day view
6. `/admin/scheduling/board` — kanban by status
7. `/admin/communications/inbox` — **filter `appointments` where status=requested** (no conversations table yet)
8. `/admin/catalog/services` + categories + packages (CRUD)
9. `/admin/settings/team` — employees + schedules

**Explicitly NOT needed for Phase 1 frontend:**

- `conversations`, `invoices`, `reservations`, `daycare_*`, `products`, `campaigns`, `vaccine_*`, `consent_*`, `daily_updates`

---

## Phase 1 — RLS (minimum)

Start permissive in dev; tighten before production.

```sql
-- Example: authenticated staff can manage all appointments (single business)
alter table appointments enable row level security;

create policy "staff manage appointments"
  on appointments for all
  to authenticated
  using (
    exists (
      select 1 from employees where user_id = auth.uid() and is_active = true
    )
  );

-- Public book: use Supabase Edge Function or service role for inserts
-- (Do NOT expose open INSERT on appointments to anon in production)
```

**Recommended for `/book`:** Supabase **Edge Function** `create-booking` with service role, or RPC `create_public_booking(...)`.

---

# PHASE 2 — EXTENDED OPS (after MVP)

Add when core booking is stable. Enables boarding, daycare, and payments.

## 2.1 Enums

```sql
create type facility_resource_type as enum ('kennel', 'suite', 'playroom', 'other');
create type reservation_status as enum ('pending', 'confirmed', 'checked_in', 'checked_out', 'cancelled');
create type daycare_session_status as enum ('scheduled', 'checked_in', 'checked_out', 'cancelled');
create type invoice_status as enum ('draft', 'open', 'paid', 'void');
```

## 2.2 Boarding (8 tables)

| Table | Purpose | Frontend |
|-------|---------|----------|
| `facility_resources` | Rooms/kennels + grid position | Boarding → Facilities, Room Board |
| `reservations` | Overnight stays | Boarding tabs |
| `boarding_waitlist` | No room available | Waitlist tab |
| `pet_boarding_instructions` | Feeding/meds notes | Pet profile |
| `pet_boarding_instructions_history` | Audit | optional |
| `reservation_boarding_overrides` | Per-stay overrides | |
| `room_transfers` | Move pet between rooms | |
| `attendance_entries` | Check-in/out log | Attendance tab |

Key columns for `facility_resources`: `name`, `type`, `column_label`, `row_number`, `capacity`, `is_active`.  
Key columns for `reservations`: `pet_id`, `owner_id`, `resource_id`, `check_in_at`, `check_out_at`, `status`.

## 2.3 Daycare (5 tables)

| Table | Purpose | Frontend |
|-------|---------|----------|
| `daycare_pricing` | Full/half day prices (singleton row) | Settings |
| `daycare_packages` | Prepaid visit bundles | Daycare → Billing |
| `daycare_wallets` | Remaining visits per owner/pet | |
| `daycare_schedules` | Recurring days | Schedules tab |
| `daycare_transactions` | Check-in/out sessions | Today / History |

## 2.4 Billing (4 tables)

| Table | Purpose | Frontend |
|-------|---------|----------|
| `invoices` | Bill documents | `/admin/sales/invoices` |
| `invoice_line_items` | Line items + products later | Checkout |
| `deposits` | Partial payments | Book deposit |
| `payment_tokens` | `/pay/:token` public pay | Pay link |

**RPC (like Petverse):**

```sql
create or replace function allocate_invoice_number()
returns int language plpgsql as $$
declare next_num int;
begin
  select coalesce(max(number), 0) + 1 into next_num from invoices;
  return next_num;
end;
$$;
```

**Phase 2 frontend unlocks:** `/admin/scheduling/boarding`, `/admin/scheduling/daycare`, `/admin/sales/*`, `/pay/:token`.

---

# PHASE 3 — GROWTH (later)

Add for WhatsApp funnel, marketing, compliance, retail, and rich pet profiles.

## 3.1 Communications (6 tables)

| Table | Purpose | Frontend |
|-------|---------|----------|
| `conversations` | WhatsApp inquiry pipeline | Inbox V2, Home funnel |
| `conversation_messages` | Message thread | Inbox |
| `message_templates` | Outbound templates | Outbound |
| `reminder_log` | Sent SMS/email/WhatsApp | Reminder log |
| `outbound_campaigns` | Marketing campaigns | Campaigns |
| `campaign_contacts` | Campaign recipients | |
| `campaign_blackout_periods` | Quiet hours | |

`conversations` key columns: `stage` (inquiry → engaged → quoted → booked → visited → closed_lost), `owner_id`, `quoted_amount`, `lost_revenue`, `ai_handled`, `first_staff_response_at`.

## 3.2 Compliance (5 tables)

| Table | Purpose |
|-------|---------|
| `vaccine_types` | Catalog |
| `pet_vaccinations` | Log on pet |
| `consent_form_templates` | HTML templates |
| `service_consent_forms` | Link service → template |
| `consent_form_submissions` | Signed at check-in |

## 3.3 CRM & analytics (2 tables)

| Table | Purpose |
|-------|---------|
| `owner_retention_settings` | Re-engagement rules |
| `business_targets` | KPI targets |

Add computed/ materialized views later: `owners_with_retention` (lifetime spend, last visit).

## 3.4 Media & pet passport (5 tables)

| Table | Purpose | Frontend |
|-------|---------|----------|
| `daily_updates` | Staff notes during visit | `/staff/daily_pet_updates` |
| `pet_update_images` | Photos for updates | Communications → Photos |
| `pet_photos` | Gallery | `/passport/:petId` |
| `pet_notes` | Internal notes | Pet admin |
| `client_documents` | Uploaded files | Pet admin |

## 3.5 Inventory (2 tables)

| Table | Purpose |
|-------|---------|
| `suppliers` | Supplier directory |
| `products` | Retail SKUs at checkout |

## 3.6 Staff extras (1 table)

| Table | Purpose |
|-------|---------|
| `employee_commission_tiers` | Commission by revenue tier |

**Phase 3 frontend unlocks:** full Home WhatsApp funnel, campaigns, passport, photos, stock, retention, vaccines, consent.

---

# Complete table list

| Phase | Table | Core? |
|-------|-------|-------|
| 1 | business_settings | ✅ |
| 1 | service_categories | ✅ |
| 1 | services | ✅ |
| 1 | service_packages | ✅ |
| 1 | service_package_steps | ✅ |
| 1 | employees | ✅ |
| 1 | employee_schedules | ✅ |
| 1 | employee_services | ✅ |
| 1 | owners | ✅ |
| 1 | pets | ✅ |
| 1 | appointments | ✅ |
| 2 | facility_resources | |
| 2 | reservations | |
| 2 | boarding_waitlist | |
| 2 | pet_boarding_instructions | |
| 2 | pet_boarding_instructions_history | |
| 2 | reservation_boarding_overrides | |
| 2 | room_transfers | |
| 2 | attendance_entries | |
| 2 | daycare_pricing | |
| 2 | daycare_packages | |
| 2 | daycare_wallets | |
| 2 | daycare_schedules | |
| 2 | daycare_transactions | |
| 2 | invoices | |
| 2 | invoice_line_items | |
| 2 | deposits | |
| 2 | payment_tokens | |
| 3 | conversations | |
| 3 | conversation_messages | |
| 3 | message_templates | |
| 3 | reminder_log | |
| 3 | outbound_campaigns | |
| 3 | campaign_contacts | |
| 3 | campaign_blackout_periods | |
| 3 | vaccine_types | |
| 3 | pet_vaccinations | |
| 3 | consent_form_templates | |
| 3 | service_consent_forms | |
| 3 | consent_form_submissions | |
| 3 | owner_retention_settings | |
| 3 | business_targets | |
| 3 | daily_updates | |
| 3 | pet_update_images | |
| 3 | pet_photos | |
| 3 | pet_notes | |
| 3 | client_documents | |
| 3 | suppliers | |
| 3 | products | |
| 3 | employee_commission_tiers | |

**Total: 11 core + 17 extended + 22 growth = 50 business tables** (+ Supabase `auth.users`).

---

# Suggested implementation order

```text
Week 1 — Supabase Phase 1 tables + seed
         └── business_settings, 6 employees, 10 services, 2 packages

Week 2 — Frontend Phase 1
         └── landing, login, book wizard, calendar, board, inbox (appointments)

Week 3 — Supabase Phase 2 (boarding + daycare + invoices)
         └── Frontend boarding/daycare/sales

Week 4+ — Phase 3 communications + growth features
```

---

# Phase 1 seed SQL (starter)

Run after creating Phase 1 tables:

```sql
insert into business_settings (
  id, business_name, timezone, currency, hero_title, hero_subtitle
) values (
  '11111111-1111-1111-1111-111111111111',
  'Pet Company 1',
  'Asia/Dubai',
  'AED',
  'Premium care for furry friends.',
  'Grooming, wellness, and boarding — with easy online booking.'
);

-- Add categories, services, employees, schedules via Table Editor or follow-on seed script
```

---

# Related documents

- [MODULES.md](./MODULES.md) — what each screen does
- [ARCHITECTURE.md](./ARCHITECTURE.md) — full field-level reference (Prisma-style)
