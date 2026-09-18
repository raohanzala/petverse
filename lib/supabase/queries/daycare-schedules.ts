import { createClient } from "@/lib/supabase/server"
import type {
  DaycareScheduleListRow,
  DaycareScheduleRow,
} from "@/lib/supabase/types"
import { getSupabaseErrorMessage } from "@/lib/supabase/errors"

const DAYCARE_SCHEDULE_COLUMNS = `
  id,
  pet_id,
  owner_id,
  resource_id,
  days_of_week,
  starts_at,
  ends_at,
  is_active,
  created_at,
  updated_at,
  pet:pets (
    id,
    name,
    species
  ),
  owner:owners (
    id,
    name,
    phone
  ),
  resource:facility_resources (
    id,
    name,
    type
  )
`

/** Admin list — all daycare schedules */
export async function listDaycareSchedules(): Promise<
  DaycareScheduleListRow[]
> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("daycare_schedules")
    .select(DAYCARE_SCHEDULE_COLUMNS)
    .order("days_of_week", { ascending: true })
    .order("starts_at", { ascending: true })

  if (error) {
    throw new Error(
      getSupabaseErrorMessage(
        error,
        "Failed to load daycare schedules"
      )
    )
  }

  return (data ?? []).map((schedule) => ({
    ...schedule,
    pet: schedule.pet?.[0] ?? null,
    owner: schedule.owner?.[0] ?? null,
    resource: schedule.resource?.[0] ?? null,
  }))
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
    .order("days_of_week", { ascending: true })
    .order("starts_at", { ascending: true })

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
    .order("days_of_week", { ascending: true })
    .order("starts_at", { ascending: true })

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
    .contains("days_of_week", [dayOfWeek])
    .eq("is_active", true)
    .order("starts_at", { ascending: true })

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