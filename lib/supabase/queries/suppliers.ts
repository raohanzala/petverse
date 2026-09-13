import { createClient } from "@/lib/supabase/server"
import type { SupplierListFilters } from "@/lib/constants/supplier-filters"
import type { SupplierRow } from "@/lib/supabase/types"
import { getSupabaseErrorMessage } from "@/lib/supabase/errors"

const SUPPLIER_COLUMNS =
  "id, name, contact_name, email, phone, notes, is_active, created_at, updated_at" as const

function escapeIlikePattern(value: string) {
  return value.replace(/[%_\\]/g, "\\$&")
}

/** Admin list — supports server-side search and status filter */
export async function listSuppliers(
  filters: SupplierListFilters = {}
): Promise<SupplierRow[]> {
  const supabase = await createClient()
  const { search, status = "all" } = filters

  let query = supabase
    .from("suppliers")
    .select(SUPPLIER_COLUMNS)

  if (status === "active") {
    query = query.eq("is_active", true)
  } else if (status === "inactive") {
    query = query.eq("is_active", false)
  }

  if (search) {
    const pattern = `%${escapeIlikePattern(search)}%`

    query = query.or(
      `name.ilike.${pattern},contact_name.ilike.${pattern},email.ilike.${pattern},phone.ilike.${pattern},notes.ilike.${pattern}`
    )
  }

  const { data, error } = await query
    .order("name", { ascending: true })

  if (error) {
    throw new Error(
      getSupabaseErrorMessage(error, "Failed to load suppliers")
    )
  }

  return data ?? []
}

export async function listActiveSuppliers(): Promise<SupplierRow[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("suppliers")
    .select(SUPPLIER_COLUMNS)
    .eq("is_active", true)
    .order("name", { ascending: true })

  if (error) {
    throw new Error(
      getSupabaseErrorMessage(error, "Failed to load suppliers")
    )
  }

  return data ?? []
}

export async function getSupplierById(
  id: string
): Promise<SupplierRow | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("suppliers")
    .select(SUPPLIER_COLUMNS)
    .eq("id", id)
    .maybeSingle()

  if (error) {
    throw new Error(
      getSupabaseErrorMessage(error, "Failed to load supplier")
    )
  }

  return data
}