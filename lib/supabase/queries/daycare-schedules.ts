import { createClient } from "@/lib/supabase/server"
import type { DaycareScheduleRow } from "@/lib/supabase/types"
import { getSupabaseErrorMessage } from "@/lib/supabase/errors"

const DAYCARE_SCHEDULE_COLUMNS =
  "id, pet_id, day_of_week, start_time, end_time, is_active" as const

/** Admin list — all daycare schedules */
export async function listDaycareSchedules(): Promise<
  DaycareScheduleRow[]
> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("daycare_schedules")
    .select(DAYCARE_SCHEDULE_COLUMNS)
    .order("day_of_week", { ascending: true })
    .order("start_time", { ascending: true })

  if (error) {
    throw new Error(
      getSupabaseErrorMessage(
        error,
        "Failed to load daycare schedules"
      )
    )
  }

  return data ?? []
}

/** Active daycare schedules only */
export async function listActiveDaycareSchedules(): Promise<
  DaycareScheduleRow[]
> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("daycare_schedules")
    .select(DAYCARE_SCHEDULE_COLUMNS)
    .eq("is_active", true)
    .order("day_of_week", { ascending: true })
    .order("start_time", { ascending: true })

  if (error) {
    throw new Error(
      getSupabaseErrorMessage(
        error,
        "Failed to load active daycare schedules"
      )
    )
  }

  return data ?? []
}

/** Schedules for a specific pet */
export async function listDaycareSchedulesByPetId(
  petId: string
): Promise<DaycareScheduleRow[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("daycare_schedules")
    .select(DAYCARE_SCHEDULE_COLUMNS)
    .eq("pet_id", petId)
    .order("day_of_week", { ascending: true })
    .order("start_time", { ascending: true })

  if (error) {
    throw new Error(
      getSupabaseErrorMessage(
        error,
        "Failed to load pet daycare schedules"
      )
    )
  }

  return data ?? []
}

/** Schedules for a specific day */
export async function listDaycareSchedulesByDay(
  dayOfWeek: number
): Promise<DaycareScheduleRow[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("daycare_schedules")
    .select(DAYCARE_SCHEDULE_COLUMNS)
    .eq("day_of_week", dayOfWeek)
    .eq("is_active", true)
    .order("start_time", { ascending: true })

  if (error) {
    throw new Error(
      getSupabaseErrorMessage(
        error,
        "Failed to load daycare schedules for day"
      )
    )
  }

  return data ?? []
}

/** Single daycare schedule */
export async function getDaycareScheduleById(
  id: string
): Promise<DaycareScheduleRow | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("daycare_schedules")
    .select(DAYCARE_SCHEDULE_COLUMNS)
    .eq("id", id)
    .maybeSingle()

  if (error) {
    throw new Error(
      getSupabaseErrorMessage(
        error,
        "Failed to load daycare schedule"
      )
    )
  }

  return data
}