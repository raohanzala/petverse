import { createClient } from "@/lib/supabase/server"
import type { FacilityResourceListFilters } from "@/lib/constants/facility-resources-filters"
import type { FacilityResourceRow } from "@/lib/supabase/types"
import { getSupabaseErrorMessage } from "@/lib/supabase/errors"

const FACILITY_RESOURCE_COLUMNS =
  "id, name, type, column_label, row_number, capacity, is_active, created_at, updated_at" as const

function escapeIlikePattern(value: string) {
  return value.replace(/[%_\\]/g, "\\$&")
}

/** Admin list — supports server-side search, status, and type filters */
export async function listFacilityResources(
  filters: FacilityResourceListFilters = {}
): Promise<FacilityResourceRow[]> {
  const supabase = await createClient()
  const {
    search,
    status = "all",
    type = "all",
  } = filters

  let query = supabase
    .from("facility_resources")
    .select(FACILITY_RESOURCE_COLUMNS)

  if (status === "active") {
    query = query.eq("is_active", true)
  } else if (status === "inactive") {
    query = query.eq("is_active", false)
  }

  if (type !== "all") {
    query = query.eq("type", type)
  }

  if (search) {
    const pattern = `%${escapeIlikePattern(search)}%`

    query = query.or(
      `name.ilike.${pattern},column_label.ilike.${pattern}`
    )
  }

  const { data, error } = await query
    .order("name", { ascending: true })

  if (error) {
    throw new Error(
      getSupabaseErrorMessage(
        error,
        "Failed to load facility resources"
      )
    )
  }

  return data ?? []
}

/** Boarding / daycare — active facility resources only */
export async function listActiveFacilityResources(): Promise<
  FacilityResourceRow[]
> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("facility_resources")
    .select(FACILITY_RESOURCE_COLUMNS)
    .eq("is_active", true)
    .order("name", { ascending: true })

  if (error) {
    throw new Error(
      getSupabaseErrorMessage(
        error,
        "Failed to load facility resources"
      )
    )
  }

  return data ?? []
}

export async function getFacilityResourceById(
  id: string
): Promise<FacilityResourceRow | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("facility_resources")
    .select(FACILITY_RESOURCE_COLUMNS)
    .eq("id", id)
    .maybeSingle()

  if (error) {
    throw new Error(
      getSupabaseErrorMessage(
        error,
        "Failed to load facility resource"
      )
    )
  }

  return data
}