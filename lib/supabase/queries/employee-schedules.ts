import { createClient } from "@/lib/supabase/server"
import type {
  EmployeeScheduleRow,
} from "@/lib/supabase/types"
import { getSupabaseErrorMessage } from "@/lib/supabase/errors"

const EMPLOYEE_SCHEDULE_COLUMNS = `
  id,
  employee_id,
  day_of_week,
  start_time,
  end_time,
  employee:employees (
    display_name,
    initials
  )
` as const

/** Admin list — all employee schedules ordered by employee and day */
export async function listEmployeeSchedules(): Promise<
  EmployeeScheduleRow[]
> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("employee_schedules")
    .select(EMPLOYEE_SCHEDULE_COLUMNS)
    .order("employee_id", { ascending: true })
    .order("day_of_week", { ascending: true })
    .order("start_time", { ascending: true })

  if (error) {
    throw new Error(
      getSupabaseErrorMessage(
        error,
        "Failed to load employee schedules"
      )
    )
  }

  return data ?? []
}

/** Employee-specific schedules */
export async function listEmployeeSchedulesByEmployeeId(
  employeeId: string
): Promise<EmployeeScheduleRow[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("employee_schedules")
    .select(EMPLOYEE_SCHEDULE_COLUMNS)
    .eq("employee_id", employeeId)
    .order("day_of_week", { ascending: true })
    .order("start_time", { ascending: true })

  if (error) {
    throw new Error(
      getSupabaseErrorMessage(
        error,
        "Failed to load employee schedules"
      )
    )
  }

  return data ?? []
}

export async function getEmployeeScheduleById(
  id: string
): Promise<EmployeeScheduleRow | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("employee_schedules")
    .select(EMPLOYEE_SCHEDULE_COLUMNS)
    .eq("id", id)
    .maybeSingle()

  if (error) {
    throw new Error(
      getSupabaseErrorMessage(
        error,
        "Failed to load employee schedule"
      )
    )
  }

  return data
}