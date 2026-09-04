import { createClient } from "@/lib/supabase/server"
import type { EmployeeListFilters } from "@/lib/constants/employee-filters"
import type { EmployeeRow } from "@/lib/supabase/types"
import { getSupabaseErrorMessage } from "@/lib/supabase/errors"

const EMPLOYEE_COLUMNS =
  "id, user_id, display_name, initials, avatar_url, role, job_title, color, is_active, created_at, updated_at" as const

function escapeIlikePattern(value: string) {
  return value.replace(/[%_\\]/g, "\\$&")
}

/** Admin list — supports server-side search and status filter */
export async function listEmployees(
  filters: EmployeeListFilters = {}
): Promise<EmployeeRow[]> {
  const supabase = await createClient()
  const { search, status = "all" } = filters

  let query = supabase.from("employees").select(EMPLOYEE_COLUMNS)

  if (status === "active") {
    query = query.eq("is_active", true)
  } else if (status === "inactive") {
    query = query.eq("is_active", false)
  }

  if (search) {
    const pattern = `%${escapeIlikePattern(search)}%`

    query = query.or(
      `display_name.ilike.${pattern},initials.ilike.${pattern},job_title.ilike.${pattern}`
    )
  }

  const { data, error } = await query
    .order("display_name", { ascending: true })

  if (error) {
    throw new Error(
      getSupabaseErrorMessage(error, "Failed to load employees")
    )
  }

  return data ?? []
}

/** Public booking / staff selection — active employees only */
export async function listActiveEmployees(): Promise<EmployeeRow[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("employees")
    .select(EMPLOYEE_COLUMNS)
    .eq("is_active", true)
    .order("display_name", { ascending: true })

  if (error) {
    throw new Error(
      getSupabaseErrorMessage(error, "Failed to load employees")
    )
  }

  return data ?? []
}

export async function getEmployeeById(
  id: string
): Promise<EmployeeRow | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("employees")
    .select(EMPLOYEE_COLUMNS)
    .eq("id", id)
    .maybeSingle()

  if (error) {
    throw new Error(
      getSupabaseErrorMessage(error, "Failed to load employee")
    )
  }

  return data
}