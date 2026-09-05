import { createClient } from "@/lib/supabase/server"
import type { ServiceListFilters } from "@/lib/constants/service-filters"
import type { ServiceListRow, ServiceRow } from "@/lib/supabase/types"
import { getSupabaseErrorMessage } from "@/lib/supabase/errors"

const SERVICE_COLUMNS = `
  id, 
  category_id, 
  name, 
  description, 
  kind, 
  duration_minutes, 
  price, 
  is_active, 
  is_public, 
  created_at, 
  updated_at,
  category:service_categories (
    id,
    name
  )
  ` as const

function escapeIlikePattern(value: string) {
  return value.replace(/[%_\\]/g, "\\$&")
}

function normalizeService(row: any): ServiceListRow {
  return {
    ...row,
    category: Array.isArray(row.category)
      ? (row.category[0] ?? null)
      : (row.category ?? null),
  }
}

/** Admin list — supports server-side search and filters */
export async function listServices(
  filters: ServiceListFilters = {}
): Promise<ServiceListRow[]> {
  const supabase = await createClient()

  const {
    search,
    categoryId,
    kind = "all",
    status = "all",
    visibility = "all",
  } = filters

  let query = supabase.from("services").select(SERVICE_COLUMNS)

  if (categoryId) {
    query = query.eq("category_id", categoryId)
  }

  if (kind !== "all") {
    query = query.eq("kind", kind)
  }

  if (status === "active") {
    query = query.eq("is_active", true)
  } else if (status === "inactive") {
    query = query.eq("is_active", false)
  }

  if (visibility === "public") {
    query = query.eq("is_public", true)
  } else if (visibility === "private") {
    query = query.eq("is_public", false)
  }

  if (search) {
    const pattern = `%${escapeIlikePattern(search)}%`

    query = query.or(
      `name.ilike.${pattern},description.ilike.${pattern}`
    )
  }

  const { data, error } = await query
    .order("name", { ascending: true })

  if (error) {
    throw new Error(
      getSupabaseErrorMessage(error, "Failed to load services")
    )
  }

  return (data ?? []).map(normalizeService)
}

/** Public booking / marketing — active and public services only */
export async function listActiveServices(): Promise<ServiceRow[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("services")
    .select(SERVICE_COLUMNS)
    .eq("is_active", true)
    .eq("is_public", true)
    .order("name", { ascending: true })

  if (error) {
    throw new Error(
      getSupabaseErrorMessage(error, "Failed to load services")
    )
  }

  return (data ?? []).map(normalizeService)
}

export async function getServiceById(
  id: string
): Promise<ServiceRow | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("services")
    .select(SERVICE_COLUMNS)
    .eq("id", id)
    .maybeSingle()

  if (error) {
    throw new Error(
      getSupabaseErrorMessage(error, "Failed to load service")
    )
  }

  return data ? normalizeService(data) : null
}
