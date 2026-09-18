import { createClient } from "@/lib/supabase/server"
import type {
  DaycareScheduleListRow,
  DaycareScheduleRow,
  FacilityResourceType,
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

type DaycareScheduleQueryRow = {
  id: string
  pet_id: string
  owner_id: string
  resource_id: string | null
  days_of_week: number[]
  starts_at: string
  ends_at: string
  is_active: boolean
  created_at: string
  updated_at: string

  pet:
  | {
    id: string
    name: string
    species: string
  }
  | {
    id: string
    name: string
    species: string
  }[]
  | null

  owner:
  | {
    id: string
    name: string
    phone: string
  }
  | {
    id: string
    name: string
    phone: string
  }[]
  | null

  resource:
  | {
    id: string
    name: string
    type: FacilityResourceType
  }
  | {
    id: string
    name: string
    type: FacilityResourceType
  }[]
  | null
}

function firstRelation<T>(
  relation: T | T[] | null | undefined
): T | null {
  if (Array.isArray(relation)) {
    return relation[0] ?? null
  }

  return relation ?? null
}

function normalizeDaycareSchedule(
  schedule: DaycareScheduleQueryRow
): DaycareScheduleListRow {
  const pet = firstRelation(schedule.pet)
  const owner = firstRelation(schedule.owner)
  const resource = firstRelation(schedule.resource)

  return {
    id: schedule.id,
    pet_id: schedule.pet_id,
    owner_id: schedule.owner_id,
    resource_id: schedule.resource_id,
    days_of_week: schedule.days_of_week,
    starts_at: schedule.starts_at,
    ends_at: schedule.ends_at,
    is_active: schedule.is_active,
    created_at: schedule.created_at,
    updated_at: schedule.updated_at,

    pet: pet
      ? {
          id: pet.id,
          name: pet.name,
          species: pet.species,
        }
      : null,

    owner: owner
      ? {
          id: owner.id,
          name: owner.name,
          phone: owner.phone,
        }
      : null,

    resource: resource
      ? {
          id: resource.id,
          name: resource.name,
          type: resource.type,
        }
      : null,
  }
}

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

  return (data ?? []).map((schedule) =>
    normalizeDaycareSchedule(
      schedule as DaycareScheduleQueryRow
    )
  )
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

  return (data ?? []).map((schedule) =>
    normalizeDaycareSchedule(
      schedule as DaycareScheduleQueryRow
    )
  )
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

  return (data ?? []).map((schedule) =>
    normalizeDaycareSchedule(
      schedule as DaycareScheduleQueryRow
    )
  )
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

  return (data ?? []).map((schedule) =>
    normalizeDaycareSchedule(
      schedule as DaycareScheduleQueryRow
    )
  )
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
    ? normalizeDaycareSchedule(
      data as DaycareScheduleQueryRow
    )
    : null
}