# Supabase Schema — Phase 2 & Phase 3 (Remaining Tables)

Full column definitions and `CREATE TABLE` SQL for everything **after** Phase 1 MVP.

> **Single business — not multi-tenant.** Same rule as [SUPABASE-SCHEMA.md](./SUPABASE-SCHEMA.md): no `tenant_id`.  
> **Prerequisite:** Phase 1 tables must exist (`owners`, `pets`, `employees`, `services`, `appointments`, `business_settings`, …).

Related: [SUPABASE-SCHEMA.md](./SUPABASE-SCHEMA.md) (Phase 1) · [MODULES.md](./MODULES.md) · [ARCHITECTURE.md](./ARCHITECTURE.md)

---

## Phase overview (remaining)

| Phase | Goal | Tables | Frontend unlocked |
|-------|------|--------|-------------------|
| **2 — Extended ops** | Boarding, daycare, billing | **17 tables** | Boarding room board, daycare check-in, invoices, `/pay/:token` |
| **3 — Growth** | CRM, compliance, media, retail | **22 tables** | WhatsApp funnel, campaigns, passport, photos, stock, retention |

```text
Phase 2
├── boarding: facility_resources, reservations, boarding_waitlist,
│             pet_boarding_instructions, pet_boarding_instructions_history,
│             reservation_boarding_overrides, room_transfers, attendance_entries
├── daycare:  daycare_pricing, daycare_packages, daycare_wallets,
│             daycare_schedules, daycare_transactions
└── billing:  invoices, invoice_line_items, deposits, payment_tokens

Phase 3
├── communications: conversations, conversation_messages, message_templates,
│                   reminder_log, outbound_campaigns, campaign_contacts,
│                   campaign_blackout_periods
├── compliance:     vaccine_types, pet_vaccinations, consent_form_templates,
│                   service_consent_forms, consent_form_submissions
├── CRM:            owner_retention_settings, business_targets
├── media:          daily_updates, pet_update_images, pet_photos,
│                   pet_notes, client_documents
├── inventory:      suppliers, products
└── staff extras:   employee_commission_tiers
```

---

# PHASE 2 — EXTENDED OPS

Add when core booking is stable.

## 2.1 Enums

```sql
create type facility_resource_type as enum (
  'kennel',
  'suite',
  'playroom',
  'other'
);

create type reservation_status as enum (
  'pending',
  'confirmed',
  'checked_in',
  'checked_out',
  'cancelled'
);

create type daycare_session_status as enum (
  'scheduled',
  'checked_in',
  'checked_out',
  'cancelled'
);

create type invoice_status as enum (
  'draft',
  'open',
  'paid',
  'void'
);

create type attendance_entry_type as enum (
  'check_in',
  'check_out'
);
```

---

## 2.2 Boarding

### `facility_resources`

Rooms / kennels for the boarding board grid.

| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid PK | |
| `name` | text | e.g. Kennel A1 |
| `type` | facility_resource_type | default `kennel` |
| `column_label` | text | Grid column (e.g. `A`) |
| `row_number` | int | Grid row |
| `capacity` | int | default 1 |
| `is_active` | boolean | |
| `created_at` / `updated_at` | timestamptz | |

### `reservations`

Overnight boarding stays.

| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid PK | |
| `pet_id` | uuid FK → pets | |
| `owner_id` | uuid FK → owners | |
| `resource_id` | uuid FK → facility_resources | nullable until assigned |
| `service_id` | uuid FK → services | optional boarding service |
| `status` | reservation_status | default `pending` |
| `check_in_at` | timestamptz | Planned / actual window start |
| `check_out_at` | timestamptz | Planned / actual window end |
| `notes` | text | |
| `created_at` / `updated_at` | timestamptz | |

### `boarding_waitlist`

When no room is available for requested dates.

| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid PK | |
| `pet_id` | uuid FK → pets | |
| `owner_id` | uuid FK → owners | |
| `desired_from` | timestamptz | |
| `desired_to` | timestamptz | |
| `notes` | text | |
| `created_at` | timestamptz | |

### `pet_boarding_instructions`

Default feeding / meds / behavior notes for a pet.

| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid PK | |
| `pet_id` | uuid FK → pets UNIQUE | One instruction set per pet |
| `reservation_id` | uuid FK → reservations UNIQUE | optional link to active stay |
| `feeding_notes` | text | |
| `medication_notes` | text | |
| `behavior_notes` | text | |
| `updated_at` | timestamptz | |

### `pet_boarding_instructions_history`

Audit snapshots when instructions change.

| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid PK | |
| `instruction_id` | uuid FK → pet_boarding_instructions | |
| `snapshot` | jsonb | Full instruction payload |
| `created_at` | timestamptz | |

### `reservation_boarding_overrides`

Per-stay overrides of default instructions.

| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid PK | |
| `reservation_id` | uuid FK → reservations | |
| `field_key` | text | e.g. `feeding_notes` |
| `value` | text | Override value |

### `room_transfers`

Move a pet between resources during a stay.

| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid PK | |
| `reservation_id` | uuid FK → reservations | |
| `from_resource_id` | uuid FK → facility_resources | nullable |
| `to_resource_id` | uuid FK → facility_resources | |
| `transferred_at` | timestamptz | |
| `notes` | text | |

### `attendance_entries`

Check-in / check-out log for boarding.

| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid PK | |
| `reservation_id` | uuid FK → reservations | |
| `type` | attendance_entry_type | `check_in` \| `check_out` |
| `recorded_at` | timestamptz | |
| `recorded_by` | uuid FK → employees | nullable |
| `flags` | text[] | e.g. `{late,meds_given}` |
| `notes` | text | |

```sql
create table facility_resources (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  type facility_resource_type not null default 'kennel',
  column_label text,
  row_number int,
  capacity int not null default 1 check (capacity > 0),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_facility_resources_grid
  on facility_resources(column_label, row_number)
  where is_active = true;

create table reservations (
  id uuid primary key default gen_random_uuid(),
  pet_id uuid not null references pets(id) on delete restrict,
  owner_id uuid not null references owners(id) on delete restrict,
  resource_id uuid references facility_resources(id) on delete set null,
  service_id uuid references services(id) on delete set null,
  status reservation_status not null default 'pending',
  check_in_at timestamptz not null,
  check_out_at timestamptz not null,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (check_out_at > check_in_at)
);

create index idx_reservations_dates on reservations(check_in_at, check_out_at);
create index idx_reservations_resource on reservations(resource_id);
create index idx_reservations_status on reservations(status);
create index idx_reservations_pet on reservations(pet_id);

create table boarding_waitlist (
  id uuid primary key default gen_random_uuid(),
  pet_id uuid not null references pets(id) on delete cascade,
  owner_id uuid not null references owners(id) on delete cascade,
  desired_from timestamptz not null,
  desired_to timestamptz not null,
  notes text,
  created_at timestamptz not null default now(),
  check (desired_to > desired_from)
);

create index idx_boarding_waitlist_dates on boarding_waitlist(desired_from, desired_to);

create table pet_boarding_instructions (
  id uuid primary key default gen_random_uuid(),
  pet_id uuid not null unique references pets(id) on delete cascade,
  reservation_id uuid unique references reservations(id) on delete set null,
  feeding_notes text,
  medication_notes text,
  behavior_notes text,
  updated_at timestamptz not null default now()
);

create table pet_boarding_instructions_history (
  id uuid primary key default gen_random_uuid(),
  instruction_id uuid not null
    references pet_boarding_instructions(id) on delete cascade,
  snapshot jsonb not null,
  created_at timestamptz not null default now()
);

create index idx_boarding_instructions_history
  on pet_boarding_instructions_history(instruction_id, created_at desc);

create table reservation_boarding_overrides (
  id uuid primary key default gen_random_uuid(),
  reservation_id uuid not null references reservations(id) on delete cascade,
  field_key text not null,
  value text not null,
  unique (reservation_id, field_key)
);

create table room_transfers (
  id uuid primary key default gen_random_uuid(),
  reservation_id uuid not null references reservations(id) on delete cascade,
  from_resource_id uuid references facility_resources(id) on delete set null,
  to_resource_id uuid not null references facility_resources(id) on delete restrict,
  transferred_at timestamptz not null default now(),
  notes text
);

create index idx_room_transfers_reservation on room_transfers(reservation_id);

create table attendance_entries (
  id uuid primary key default gen_random_uuid(),
  reservation_id uuid not null references reservations(id) on delete cascade,
  type attendance_entry_type not null,
  recorded_at timestamptz not null default now(),
  recorded_by uuid references employees(id) on delete set null,
  flags text[] not null default '{}',
  notes text
);

create index idx_attendance_entries_reservation
  on attendance_entries(reservation_id, recorded_at);
```

**Frontend:** `/admin/scheduling/boarding` (Facilities, Room Board, Waitlist, Attendance).

---

## 2.3 Daycare

### `daycare_pricing`

Singleton prices for full / half day drop-in.

| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid PK | |
| `full_day_price` | numeric(10,2) | |
| `half_day_price` | numeric(10,2) | |
| `updated_at` | timestamptz | |

### `daycare_packages`

Prepaid visit bundles.

| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid PK | |
| `name` | text | e.g. 10-Visit Pack |
| `visit_count` | int | Visits included |
| `price` | numeric(10,2) | |
| `valid_days` | int | Expiry window from purchase; nullable = no expiry |
| `is_active` | boolean | |
| `created_at` / `updated_at` | timestamptz | |

### `daycare_wallets`

Remaining prepaid visits per owner (optionally per pet).

| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid PK | |
| `owner_id` | uuid FK → owners | |
| `pet_id` | uuid FK → pets | nullable = owner-level wallet |
| `package_id` | uuid FK → daycare_packages | |
| `visits_remaining` | int | |
| `expires_at` | timestamptz | |
| `created_at` / `updated_at` | timestamptz | |

### `daycare_schedules`

Recurring weekly daycare days for a pet.

| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid PK | |
| `pet_id` | uuid FK → pets | |
| `day_of_week` | int | 0=Sun … 6=Sat |
| `start_time` | time | |
| `end_time` | time | |
| `is_active` | boolean | |

### `daycare_transactions`

Individual daycare sessions (check-in / out).

| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid PK | |
| `pet_id` | uuid FK → pets | |
| `owner_id` | uuid FK → owners | |
| `wallet_id` | uuid FK → daycare_wallets | nullable if pay-per-day |
| `status` | daycare_session_status | |
| `check_in_at` | timestamptz | |
| `check_out_at` | timestamptz | |
| `amount` | numeric(10,2) | Charged amount if not wallet |
| `notes` | text | |
| `created_at` | timestamptz | |

```sql
create table daycare_pricing (
  id uuid primary key default gen_random_uuid(),
  full_day_price numeric(10,2) not null,
  half_day_price numeric(10,2) not null,
  updated_at timestamptz not null default now()
);

-- Enforce singleton pricing row
create unique index daycare_pricing_singleton on daycare_pricing ((true));

create table daycare_packages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  visit_count int not null check (visit_count > 0),
  price numeric(10,2) not null,
  valid_days int check (valid_days is null or valid_days > 0),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table daycare_wallets (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references owners(id) on delete cascade,
  pet_id uuid references pets(id) on delete cascade,
  package_id uuid not null references daycare_packages(id) on delete restrict,
  visits_remaining int not null check (visits_remaining >= 0),
  expires_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_daycare_wallets_owner on daycare_wallets(owner_id);
create index idx_daycare_wallets_pet on daycare_wallets(pet_id)
  where pet_id is not null;

create table daycare_schedules (
  id uuid primary key default gen_random_uuid(),
  pet_id uuid not null references pets(id) on delete cascade,
  day_of_week int not null check (day_of_week between 0 and 6),
  start_time time not null,
  end_time time not null,
  is_active boolean not null default true,
  check (end_time > start_time),
  unique (pet_id, day_of_week)
);

create index idx_daycare_schedules_pet on daycare_schedules(pet_id);

create table daycare_transactions (
  id uuid primary key default gen_random_uuid(),
  pet_id uuid not null references pets(id) on delete restrict,
  owner_id uuid not null references owners(id) on delete restrict,
  wallet_id uuid references daycare_wallets(id) on delete set null,
  status daycare_session_status not null default 'scheduled',
  check_in_at timestamptz,
  check_out_at timestamptz,
  amount numeric(10,2),
  notes text,
  created_at timestamptz not null default now()
);

create index idx_daycare_tx_date on daycare_transactions(check_in_at);
create index idx_daycare_tx_pet on daycare_transactions(pet_id);
create index idx_daycare_tx_status on daycare_transactions(status);
```

**Frontend:** `/admin/scheduling/daycare` (Today, Schedules, History, Billing packs).

---

## 2.4 Billing

### `invoices`

| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid PK | |
| `owner_id` | uuid FK → owners | |
| `appointment_id` | uuid FK → appointments UNIQUE | optional link |
| `number` | int | Sequential via RPC |
| `status` | invoice_status | default `draft` |
| `subtotal` | numeric(12,2) | |
| `tax` | numeric(12,2) | default 0 |
| `total` | numeric(12,2) | |
| `currency` | text | e.g. `AED` |
| `issued_at` | timestamptz | |
| `paid_at` | timestamptz | |
| `voided_at` | timestamptz | |
| `notes` | text | |
| `created_at` / `updated_at` | timestamptz | |

### `invoice_line_items`

| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid PK | |
| `invoice_id` | uuid FK → invoices | |
| `appointment_id` | uuid FK → appointments | optional |
| `product_id` | uuid FK → products | Phase 3; nullable |
| `description` | text | |
| `quantity` | int | default 1 |
| `unit_price` | numeric(10,2) | |
| `total` | numeric(10,2) | |

> `product_id` FK is added in Phase 3 after `products` exists. Until then, omit the FK or leave the column nullable without a constraint.

### `deposits`

Partial payments against an appointment or invoice.

| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid PK | |
| `owner_id` | uuid FK → owners | |
| `appointment_id` | uuid FK → appointments | nullable |
| `invoice_id` | uuid FK → invoices | nullable |
| `amount` | numeric(10,2) | |
| `paid_at` | timestamptz | |
| `provider_ref` | text | Stripe / Square ref |
| `created_at` | timestamptz | |

### `payment_tokens`

Public pay-link tokens for `/pay/:token`.

| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid PK | |
| `token` | text UNIQUE | Opaque URL token |
| `invoice_id` | uuid FK → invoices UNIQUE | |
| `expires_at` | timestamptz | |
| `used_at` | timestamptz | |
| `created_at` | timestamptz | |

```sql
create table invoices (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references owners(id) on delete restrict,
  appointment_id uuid unique references appointments(id) on delete set null,
  number int,
  status invoice_status not null default 'draft',
  subtotal numeric(12,2) not null default 0,
  tax numeric(12,2) not null default 0,
  total numeric(12,2) not null default 0,
  currency text not null default 'USD',
  issued_at timestamptz,
  paid_at timestamptz,
  voided_at timestamptz,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (number)
);

create index idx_invoices_owner on invoices(owner_id);
create index idx_invoices_status on invoices(status);

create table invoice_line_items (
  id uuid primary key default gen_random_uuid(),
  invoice_id uuid not null references invoices(id) on delete cascade,
  appointment_id uuid references appointments(id) on delete set null,
  product_id uuid, -- FK added in Phase 3 → products(id)
  description text not null,
  quantity int not null default 1 check (quantity > 0),
  unit_price numeric(10,2) not null,
  total numeric(10,2) not null
);

create index idx_invoice_line_items_invoice on invoice_line_items(invoice_id);

create table deposits (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references owners(id) on delete restrict,
  appointment_id uuid references appointments(id) on delete set null,
  invoice_id uuid references invoices(id) on delete set null,
  amount numeric(10,2) not null check (amount > 0),
  paid_at timestamptz,
  provider_ref text,
  created_at timestamptz not null default now()
);

create index idx_deposits_owner on deposits(owner_id);
create index idx_deposits_invoice on deposits(invoice_id)
  where invoice_id is not null;

create table payment_tokens (
  id uuid primary key default gen_random_uuid(),
  token text not null unique,
  invoice_id uuid not null unique references invoices(id) on delete cascade,
  expires_at timestamptz not null,
  used_at timestamptz,
  created_at timestamptz not null default now()
);

create index idx_payment_tokens_token on payment_tokens(token);

create or replace function allocate_invoice_number()
returns int
language plpgsql
as $$
declare
  next_num int;
begin
  select coalesce(max(number), 0) + 1 into next_num from invoices;
  return next_num;
end;
$$;
```

**Frontend:** `/admin/sales/invoices`, checkout, `/pay/:token`.

---

# PHASE 3 — GROWTH

Add for WhatsApp funnel, marketing, compliance, retail, and rich pet profiles.

## 3.1 Enums

```sql
create type conversation_stage as enum (
  'inquiry',
  'engaged',
  'quoted',
  'booked',
  'visited',
  'closed_lost',
  'closed_won'
);

create type message_direction as enum (
  'inbound',
  'outbound'
);

create type campaign_status as enum (
  'draft',
  'scheduled',
  'running',
  'completed',
  'cancelled'
);

create type campaign_contact_status as enum (
  'pending',
  'sent',
  'delivered',
  'failed',
  'unsubscribed'
);
```

---

## 3.2 Communications

### `conversations`

WhatsApp / inquiry pipeline (Home funnel + Inbox V2).

| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid PK | |
| `owner_id` | uuid FK → owners | nullable until matched |
| `channel` | text | default `whatsapp` |
| `external_id` | text | Provider thread id |
| `stage` | conversation_stage | default `inquiry` |
| `closed_lost_reason` | text | |
| `quoted_amount` | numeric(10,2) | |
| `lost_revenue` | numeric(10,2) | |
| `assigned_employee_id` | uuid FK → employees | |
| `first_staff_response_at` | timestamptz | |
| `ai_handled` | boolean | |
| `created_at` / `updated_at` | timestamptz | |

### `conversation_messages`

| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid PK | |
| `conversation_id` | uuid FK → conversations | |
| `direction` | message_direction | |
| `body` | text | |
| `sent_at` | timestamptz | |
| `external_id` | text | Provider message id |

### `message_templates`

| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid PK | |
| `name` | text | |
| `channel` | text | whatsapp, sms, email |
| `body` | text | Supports `{{tokens}}` |
| `is_active` | boolean | |
| `created_at` / `updated_at` | timestamptz | |

### `reminder_log`

Sent reminder audit trail.

| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid PK | |
| `owner_id` | uuid FK → owners | nullable |
| `appointment_id` | uuid FK → appointments | nullable |
| `channel` | text | |
| `template_key` | text | |
| `status` | text | sent, failed, … |
| `sent_at` | timestamptz | |
| `error_message` | text | |

### `outbound_campaigns`

| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid PK | |
| `name` | text | |
| `channel` | text | |
| `status` | campaign_status | default `draft` |
| `scheduled_at` | timestamptz | |
| `created_at` | timestamptz | |

### `campaign_contacts`

| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid PK | |
| `campaign_id` | uuid FK → outbound_campaigns | |
| `owner_id` | uuid FK → owners | |
| `status` | campaign_contact_status | default `pending` |
| `sent_at` | timestamptz | |

### `campaign_blackout_periods`

Quiet hours / do-not-send windows for a campaign.

| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid PK | |
| `campaign_id` | uuid FK → outbound_campaigns | |
| `starts_at` | timestamptz | |
| `ends_at` | timestamptz | |

```sql
create table conversations (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references owners(id) on delete set null,
  channel text not null default 'whatsapp',
  external_id text,
  stage conversation_stage not null default 'inquiry',
  closed_lost_reason text,
  quoted_amount numeric(10,2),
  lost_revenue numeric(10,2),
  assigned_employee_id uuid references employees(id) on delete set null,
  first_staff_response_at timestamptz,
  ai_handled boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_conversations_stage on conversations(stage);
create index idx_conversations_owner on conversations(owner_id)
  where owner_id is not null;
create index idx_conversations_external
  on conversations(channel, external_id)
  where external_id is not null;

create table conversation_messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references conversations(id) on delete cascade,
  direction message_direction not null,
  body text not null,
  sent_at timestamptz not null default now(),
  external_id text
);

create index idx_conversation_messages_thread
  on conversation_messages(conversation_id, sent_at);

create table message_templates (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  channel text not null,
  body text not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table reminder_log (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references owners(id) on delete set null,
  appointment_id uuid references appointments(id) on delete set null,
  channel text not null,
  template_key text,
  status text not null,
  sent_at timestamptz not null default now(),
  error_message text
);

create index idx_reminder_log_sent on reminder_log(sent_at desc);
create index idx_reminder_log_appointment on reminder_log(appointment_id)
  where appointment_id is not null;

create table outbound_campaigns (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  channel text not null,
  status campaign_status not null default 'draft',
  scheduled_at timestamptz,
  created_at timestamptz not null default now()
);

create table campaign_contacts (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references outbound_campaigns(id) on delete cascade,
  owner_id uuid not null references owners(id) on delete cascade,
  status campaign_contact_status not null default 'pending',
  sent_at timestamptz,
  unique (campaign_id, owner_id)
);

create index idx_campaign_contacts_campaign on campaign_contacts(campaign_id);

create table campaign_blackout_periods (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references outbound_campaigns(id) on delete cascade,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  check (ends_at > starts_at)
);

create index idx_campaign_blackout on campaign_blackout_periods(campaign_id);
```

**Frontend:** Inbox V2, Outbound, Campaigns, Home WhatsApp funnel widgets.

---

## 3.3 Compliance

### `vaccine_types`

| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid PK | |
| `name` | text | |
| `species` | text | dog, cat, … nullable = all |
| `interval_months` | int | Suggested booster interval |
| `is_active` | boolean | |

### `pet_vaccinations`

| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid PK | |
| `pet_id` | uuid FK → pets | |
| `vaccine_type_id` | uuid FK → vaccine_types | |
| `administered_at` | timestamptz | |
| `expires_at` | timestamptz | |
| `notes` | text | |
| `recorded_by` | uuid FK → employees | nullable |

### `consent_form_templates`

| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid PK | |
| `name` | text | |
| `body_html` | text | Template HTML |
| `version` | int | default 1 |
| `is_active` | boolean | |
| `created_at` / `updated_at` | timestamptz | |

### `service_consent_forms`

Which templates are required for a service.

| Column | Type | Notes |
|--------|------|-------|
| `service_id` | uuid FK → services | |
| `template_id` | uuid FK → consent_form_templates | |
| PK | `(service_id, template_id)` | |

### `consent_form_submissions`

Signed forms at check-in.

| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid PK | |
| `template_id` | uuid FK → consent_form_templates | |
| `appointment_id` | uuid FK → appointments | nullable |
| `owner_id` | uuid FK → owners | |
| `pet_id` | uuid FK → pets | nullable |
| `signed_at` | timestamptz | |
| `signature_data` | jsonb | Stroke / image metadata |

```sql
create table vaccine_types (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  species text,
  interval_months int check (interval_months is null or interval_months > 0),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table pet_vaccinations (
  id uuid primary key default gen_random_uuid(),
  pet_id uuid not null references pets(id) on delete cascade,
  vaccine_type_id uuid not null references vaccine_types(id) on delete restrict,
  administered_at timestamptz not null,
  expires_at timestamptz,
  notes text,
  recorded_by uuid references employees(id) on delete set null
);

create index idx_pet_vaccinations_pet on pet_vaccinations(pet_id);

create table consent_form_templates (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  body_html text not null,
  version int not null default 1,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table service_consent_forms (
  service_id uuid not null references services(id) on delete cascade,
  template_id uuid not null references consent_form_templates(id) on delete cascade,
  primary key (service_id, template_id)
);

create table consent_form_submissions (
  id uuid primary key default gen_random_uuid(),
  template_id uuid not null references consent_form_templates(id) on delete restrict,
  appointment_id uuid references appointments(id) on delete set null,
  owner_id uuid not null references owners(id) on delete restrict,
  pet_id uuid references pets(id) on delete set null,
  signed_at timestamptz not null default now(),
  signature_data jsonb
);

create index idx_consent_submissions_owner on consent_form_submissions(owner_id);
create index idx_consent_submissions_appointment on consent_form_submissions(appointment_id)
  where appointment_id is not null;
```

**Frontend:** Pet admin vaccines, check-in consent capture.

---

## 3.4 CRM & analytics

### `owner_retention_settings`

Re-engagement rules per owner.

| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid PK | |
| `owner_id` | uuid FK → owners UNIQUE | |
| `lapsed_after_days` | int | Days since last visit → lapsed |
| `reengagement_queued_at` | timestamptz | |
| `opt_out` | boolean | default false |

### `business_targets`

KPI targets for dashboards.

| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid PK | |
| `metric_key` | text | e.g. `monthly_revenue`, `bookings` |
| `target_value` | numeric(12,2) | |
| `period_start` | date | |
| `period_end` | date | |
| `notes` | text | |
| `created_at` | timestamptz | |

```sql
create table owner_retention_settings (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null unique references owners(id) on delete cascade,
  lapsed_after_days int not null default 90 check (lapsed_after_days > 0),
  reengagement_queued_at timestamptz,
  opt_out boolean not null default false
);

create table business_targets (
  id uuid primary key default gen_random_uuid(),
  metric_key text not null,
  target_value numeric(12,2) not null,
  period_start date not null,
  period_end date not null,
  notes text,
  created_at timestamptz not null default now(),
  check (period_end >= period_start),
  unique (metric_key, period_start, period_end)
);

create index idx_business_targets_period
  on business_targets(period_start, period_end);
```

**Frontend:** Retention / re-engagement queues, Home KPI cards.  
**Later:** materialized view `owners_with_retention` (lifetime spend, last visit).

---

## 3.5 Media & pet passport

### `daily_updates`

Staff notes during a visit, optionally sent to owner.

| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid PK | |
| `pet_id` | uuid FK → pets | |
| `appointment_id` | uuid FK → appointments | nullable |
| `author_id` | uuid FK → employees | nullable |
| `body` | text | |
| `sent_to_owner_at` | timestamptz | |
| `created_at` | timestamptz | |

### `pet_update_images`

Photos attached to a daily update (or unsorted).

| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid PK | |
| `daily_update_id` | uuid FK → daily_updates | nullable until sorted |
| `pet_id` | uuid FK → pets | |
| `file_url` | text | Storage URL |
| `sorted_at` | timestamptz | |
| `created_at` | timestamptz | |

### `pet_photos`

Passport gallery.

| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid PK | |
| `pet_id` | uuid FK → pets | |
| `file_url` | text | |
| `caption` | text | |
| `created_at` | timestamptz | |

### `pet_notes`

Internal staff notes (not shown to owners).

| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid PK | |
| `pet_id` | uuid FK → pets | |
| `author_id` | uuid FK → employees | nullable |
| `body` | text | |
| `created_at` / `updated_at` | timestamptz | |

### `client_documents`

Uploaded files on pet / owner profile.

| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid PK | |
| `owner_id` | uuid FK → owners | nullable |
| `pet_id` | uuid FK → pets | nullable |
| `file_url` | text | |
| `file_name` | text | |
| `mime_type` | text | |
| `uploaded_by` | uuid FK → employees | nullable |
| `created_at` | timestamptz | |
| CHECK | at least one of owner_id / pet_id | |

```sql
create table daily_updates (
  id uuid primary key default gen_random_uuid(),
  pet_id uuid not null references pets(id) on delete cascade,
  appointment_id uuid references appointments(id) on delete set null,
  author_id uuid references employees(id) on delete set null,
  body text not null,
  sent_to_owner_at timestamptz,
  created_at timestamptz not null default now()
);

create index idx_daily_updates_pet on daily_updates(pet_id, created_at desc);

create table pet_update_images (
  id uuid primary key default gen_random_uuid(),
  daily_update_id uuid references daily_updates(id) on delete cascade,
  pet_id uuid not null references pets(id) on delete cascade,
  file_url text not null,
  sorted_at timestamptz,
  created_at timestamptz not null default now()
);

create index idx_pet_update_images_update on pet_update_images(daily_update_id)
  where daily_update_id is not null;
create index idx_pet_update_images_pet on pet_update_images(pet_id);

create table pet_photos (
  id uuid primary key default gen_random_uuid(),
  pet_id uuid not null references pets(id) on delete cascade,
  file_url text not null,
  caption text,
  created_at timestamptz not null default now()
);

create index idx_pet_photos_pet on pet_photos(pet_id);

create table pet_notes (
  id uuid primary key default gen_random_uuid(),
  pet_id uuid not null references pets(id) on delete cascade,
  author_id uuid references employees(id) on delete set null,
  body text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_pet_notes_pet on pet_notes(pet_id, created_at desc);

create table client_documents (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references owners(id) on delete cascade,
  pet_id uuid references pets(id) on delete cascade,
  file_url text not null,
  file_name text,
  mime_type text,
  uploaded_by uuid references employees(id) on delete set null,
  created_at timestamptz not null default now(),
  check (owner_id is not null or pet_id is not null)
);

create index idx_client_documents_owner on client_documents(owner_id)
  where owner_id is not null;
create index idx_client_documents_pet on client_documents(pet_id)
  where pet_id is not null;
```

**Storage buckets:** `pet_update_images`, `pet-photos`, `client-documents`.  
**Frontend:** `/staff/daily_pet_updates`, Communications → Photos, `/passport/:petId`.

---

## 3.6 Inventory

### `suppliers`

| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid PK | |
| `name` | text | |
| `contact_name` | text | |
| `email` | text | |
| `phone` | text | |
| `notes` | text | |
| `is_active` | boolean | |
| `created_at` / `updated_at` | timestamptz | |

### `products`

Retail SKUs used at checkout.

| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid PK | |
| `supplier_id` | uuid FK → suppliers | nullable |
| `sku` | text | |
| `name` | text | |
| `price` | numeric(10,2) | |
| `stock_qty` | int | default 0 |
| `is_active` | boolean | |
| `created_at` / `updated_at` | timestamptz | |

```sql
create table suppliers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  contact_name text,
  email text,
  phone text,
  notes text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table products (
  id uuid primary key default gen_random_uuid(),
  supplier_id uuid references suppliers(id) on delete set null,
  sku text,
  name text not null,
  price numeric(10,2) not null,
  stock_qty int not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index idx_products_sku on products(sku) where sku is not null;
create index idx_products_supplier on products(supplier_id)
  where supplier_id is not null;

-- Wire Phase 2 invoice lines to products
alter table invoice_line_items
  add constraint invoice_line_items_product_id_fkey
  foreign key (product_id) references products(id) on delete set null;
```

**Frontend:** Stock / retail at checkout.

---

## 3.7 Staff extras

### `employee_commission_tiers`

Commission by revenue tier.

| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid PK | |
| `employee_id` | uuid FK → employees | |
| `min_revenue` | numeric(12,2) | Inclusive floor |
| `max_revenue` | numeric(12,2) | nullable = no ceiling |
| `commission_percent` | numeric(5,2) | e.g. `10.00` |
| `created_at` | timestamptz | |

```sql
create table employee_commission_tiers (
  id uuid primary key default gen_random_uuid(),
  employee_id uuid not null references employees(id) on delete cascade,
  min_revenue numeric(12,2) not null default 0,
  max_revenue numeric(12,2),
  commission_percent numeric(5,2) not null
    check (commission_percent >= 0 and commission_percent <= 100),
  created_at timestamptz not null default now(),
  check (max_revenue is null or max_revenue > min_revenue)
);

create index idx_commission_tiers_employee
  on employee_commission_tiers(employee_id, min_revenue);
```

**Frontend:** Team settings / payroll reports.

---

## Complete remaining table list

| Phase | Table | Section |
|-------|-------|---------|
| 2 | `facility_resources` | Boarding |
| 2 | `reservations` | Boarding |
| 2 | `boarding_waitlist` | Boarding |
| 2 | `pet_boarding_instructions` | Boarding |
| 2 | `pet_boarding_instructions_history` | Boarding |
| 2 | `reservation_boarding_overrides` | Boarding |
| 2 | `room_transfers` | Boarding |
| 2 | `attendance_entries` | Boarding |
| 2 | `daycare_pricing` | Daycare |
| 2 | `daycare_packages` | Daycare |
| 2 | `daycare_wallets` | Daycare |
| 2 | `daycare_schedules` | Daycare |
| 2 | `daycare_transactions` | Daycare |
| 2 | `invoices` | Billing |
| 2 | `invoice_line_items` | Billing |
| 2 | `deposits` | Billing |
| 2 | `payment_tokens` | Billing |
| 3 | `conversations` | Communications |
| 3 | `conversation_messages` | Communications |
| 3 | `message_templates` | Communications |
| 3 | `reminder_log` | Communications |
| 3 | `outbound_campaigns` | Communications |
| 3 | `campaign_contacts` | Communications |
| 3 | `campaign_blackout_periods` | Communications |
| 3 | `vaccine_types` | Compliance |
| 3 | `pet_vaccinations` | Compliance |
| 3 | `consent_form_templates` | Compliance |
| 3 | `service_consent_forms` | Compliance |
| 3 | `consent_form_submissions` | Compliance |
| 3 | `owner_retention_settings` | CRM |
| 3 | `business_targets` | CRM |
| 3 | `daily_updates` | Media |
| 3 | `pet_update_images` | Media |
| 3 | `pet_photos` | Media |
| 3 | `pet_notes` | Media |
| 3 | `client_documents` | Media |
| 3 | `suppliers` | Inventory |
| 3 | `products` | Inventory |
| 3 | `employee_commission_tiers` | Staff |

**Total remaining: 17 (Phase 2) + 22 (Phase 3) = 39 tables** (+ enums + `allocate_invoice_number` RPC).

With Phase 1 (11 core): **50 business tables** (+ `auth.users`).

---

## Suggested apply order

```text
1. Phase 2 enums
2. Boarding tables (facility_resources → reservations → dependents)
3. Daycare tables (pricing → packages → wallets → schedules → transactions)
4. Billing tables (invoices → line_items → deposits → payment_tokens)
5. Phase 3 enums
6. Communications → Compliance → CRM → Media → Inventory → commission tiers
7. ALTER invoice_line_items ADD FK to products
```

---

## Related documents

- [SUPABASE-SCHEMA.md](./SUPABASE-SCHEMA.md) — Phase 1 core schema
- [MODULES.md](./MODULES.md) — screen ↔ table mapping
- [ARCHITECTURE.md](./ARCHITECTURE.md) — Prisma-style field reference (legacy multi-tenant notes)
