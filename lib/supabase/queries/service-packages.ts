import { createClient } from "@/lib/supabase/server"
import type { ServicePackageListFilters } from "@/lib/constants/service-package-filters"
import type { ServicePackageRow } from "@/lib/supabase/types"
import { getSupabaseErrorMessage } from "@/lib/supabase/errors"

const SERVICE_PACKAGE_COLUMNS =
  "id, name, description, price, duration_minutes, step_mode, is_active, created_at, updated_at" as const

function escapeIlikePattern(value: string) {
  return value.replace(/[%_\\]/g, "\\$&")
}

/** Admin list — supports server-side search, step mode, and status filter */
export async function listServicePackages(
  filters: ServicePackageListFilters = {}
): Promise<ServicePackageRow[]> {
  const supabase = await createClient()

  const {
    search,
    stepMode = "all",
    status = "all",
  } = filters

  let query = supabase
    .from("service_packages")
    .select(SERVICE_PACKAGE_COLUMNS)

  if (stepMode !== "all") {
    query = query.eq("step_mode", stepMode)
  }

  if (status === "active") {
    query = query.eq("is_active", true)
  } else if (status === "inactive") {
    query = query.eq("is_active", false)
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
      getSupabaseErrorMessage(
        error,
        "Failed to load packages"
      )
    )
  }

  return data ?? []
}

/** Public booking / marketing — active packages only */
export async function listActiveServicePackages(): Promise<ServicePackageRow[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("service_packages")
    .select(SERVICE_PACKAGE_COLUMNS)
    .eq("is_active", true)
    .order("name", { ascending: true })

  if (error) {
    throw new Error(
      getSupabaseErrorMessage(
        error,
        "Failed to load packages"
      )
    )
  }

  return data ?? []
}

export async function getServicePackageById(
  id: string
): Promise<ServicePackageRow | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("service_packages")
    .select(SERVICE_PACKAGE_COLUMNS)
    .eq("id", id)
    .maybeSingle()

  if (error) {
    throw new Error(
      getSupabaseErrorMessage(
        error,
        "Failed to load package"
      )
    )
  }

  return data
}