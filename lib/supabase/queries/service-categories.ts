import { createClient } from "@/lib/supabase/server"
import type { ServiceCategoryListFilters } from "@/lib/constants/service-category-filters"
import type { ServiceCategoryRow } from "@/lib/supabase/types"
import { getSupabaseErrorMessage } from "@/lib/supabase/errors"

const CATEGORY_COLUMNS =
  "id, name, slug, description, sort_order, is_active, created_at, updated_at" as const

function escapeIlikePattern(value: string) {
  return value.replace(/[%_\\]/g, "\\$&")
}

/** Admin list — supports server-side search and status filter */
export async function listServiceCategories(
  filters: ServiceCategoryListFilters = {}
): Promise<ServiceCategoryRow[]> {
  const supabase = await createClient()
  const { search, status = "all" } = filters

  let query = supabase.from("service_categories").select(CATEGORY_COLUMNS)

  if (status === "active") {
    query = query.eq("is_active", true)
  } else if (status === "inactive") {
    query = query.eq("is_active", false)
  }

  if (search) {
    const pattern = `%${escapeIlikePattern(search)}%`
    query = query.or(
      `name.ilike.${pattern},slug.ilike.${pattern},description.ilike.${pattern}`
    )
  }

  const { data, error } = await query
    .order("sort_order", { ascending: true })
    .order("name", { ascending: true })

  if (error) {
    throw new Error(getSupabaseErrorMessage(error, "Failed to load categories"))
  }

  return data ?? []
}

/** Public booking / marketing — active categories only */
export async function listActiveServiceCategories(): Promise<ServiceCategoryRow[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("service_categories")
    .select(CATEGORY_COLUMNS)
    .eq("is_active", true)
    .order("sort_order", { ascending: true })
    .order("name", { ascending: true })

  if (error) {
    throw new Error(getSupabaseErrorMessage(error, "Failed to load categories"))
  }

  return data ?? []
}

export async function getServiceCategoryById(
  id: string
): Promise<ServiceCategoryRow | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("service_categories")
    .select(CATEGORY_COLUMNS)
    .eq("id", id)
    .maybeSingle()

  if (error) {
    throw new Error(getSupabaseErrorMessage(error, "Failed to load category"))
  }

  return data
}
