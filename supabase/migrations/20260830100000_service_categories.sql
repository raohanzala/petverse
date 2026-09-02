-- Service categories (catalog grouping: Grooming, Veterinary, etc.)
-- Apply via Supabase CLI: npx supabase db push
-- Or run manually in the Supabase SQL editor.

create table if not exists public.service_categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  sort_order int not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists service_categories_sort_order_idx
  on public.service_categories (sort_order asc);

create index if not exists service_categories_is_active_idx
  on public.service_categories (is_active)
  where is_active = true;

-- Keep updated_at in sync
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists service_categories_set_updated_at on public.service_categories;

create trigger service_categories_set_updated_at
  before update on public.service_categories
  for each row
  execute function public.set_updated_at();

alter table public.service_categories enable row level security;

-- Public booking: read active categories only
create policy "anon_read_active_service_categories"
  on public.service_categories
  for select
  to anon
  using (is_active = true);

-- Staff (authenticated): full access — refine with employees RBAC later
create policy "authenticated_read_service_categories"
  on public.service_categories
  for select
  to authenticated
  using (true);

create policy "authenticated_insert_service_categories"
  on public.service_categories
  for insert
  to authenticated
  with check (true);

create policy "authenticated_update_service_categories"
  on public.service_categories
  for update
  to authenticated
  using (true)
  with check (true);

create policy "authenticated_delete_service_categories"
  on public.service_categories
  for delete
  to authenticated
  using (true);
