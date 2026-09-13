import { createClient } from "@/lib/supabase/server"
import type { VaccineTypeListFilters } from "@/lib/constants/vaccine-types-filters"
import type { VaccineTypeRow } from "@/lib/supabase/types"
import { getSupabaseErrorMessage } from "@/lib/supabase/errors"

const VACCINE_TYPE_COLUMNS =
  "id, name, species, interval_months, is_active, created_at, updated_at" as const

function escapeIlikePattern(value: string) {
  return value.replace(/[%_\\]/g, "\\$&")
}

/** Admin list — supports server-side search and status filter */
export async function listVaccineTypes(
  filters: VaccineTypeListFilters = {}
): Promise<VaccineTypeRow[]> {
  const supabase = await createClient()
  const { search, status = "all" } = filters

  let query = supabase
    .from("vaccine_types")
    .select(VACCINE_TYPE_COLUMNS)

  if (status === "active") {
    query = query.eq("is_active", true)
  } else if (status === "inactive") {
    query = query.eq("is_active", false)
  }

  if (search) {
    const pattern = `%${escapeIlikePattern(search)}%`

    query = query.or(
      `name.ilike.${pattern},species.ilike.${pattern}`
    )
  }

  const { data, error } = await query
    .order("name", { ascending: true })

  if (error) {
    throw new Error(
      getSupabaseErrorMessage(
        error,
        "Failed to load vaccine types"
      )
    )
  }

  return data ?? []
}

/** Active vaccine types — used when selecting a vaccine for a pet */
export async function listActiveVaccineTypes(): Promise<
  VaccineTypeRow[]
> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("vaccine_types")
    .select(VACCINE_TYPE_COLUMNS)
    .eq("is_active", true)
    .order("name", { ascending: true })

  if (error) {
    throw new Error(
      getSupabaseErrorMessage(
        error,
        "Failed to load active vaccine types"
      )
    )
  }

  return data ?? []
}

export async function getVaccineTypeById(
  id: string
): Promise<VaccineTypeRow | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("vaccine_types")
    .select(VACCINE_TYPE_COLUMNS)
    .eq("id", id)
    .maybeSingle()

  if (error) {
    throw new Error(
      getSupabaseErrorMessage(
        error,
        "Failed to load vaccine type"
      )
    )
  }

  return data
}