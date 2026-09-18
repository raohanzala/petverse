import { createClient } from "@/lib/supabase/server"
import type { AttendanceEntryRow } from "@/lib/supabase/types"
import type { AttendanceEntryListFilters } from "@/lib/constants/attendance-entries-filters"
import { getSupabaseErrorMessage } from "@/lib/supabase/errors"

const ATTENDANCE_ENTRY_COLUMNS = `
  id,
  reservation_id,
  type,
  recorded_by,
  recorded_at,
  flags,
  notes,

  reservation:reservations!attendance_entries_reservation_id_fkey (
    id,
    pet_id,
    owner_id,

    pet:pets!reservations_pet_id_fkey (
      name,
      species
    ),

    owner:owners!reservations_owner_id_fkey (
      name,
      phone
    )
  ),

  employee:employees!attendance_entries_recorded_by_fkey (
    display_name,
    initials
  )
` as const

type AttendanceEntryQueryRow = {
  id: string
  reservation_id: string
  type: AttendanceEntryRow["type"]
  recorded_at: string
  recorded_by: string | null
  flags: string[] | string | null
  notes: string | null

  reservation:
    | {
        id: string
        pet_id: string
        owner_id: string
        pet:
          | {
              name: string
              species: string
            }[]
          | {
              name: string
              species: string
            }
          | null
        owner:
          | {
              name: string
              phone: string
            }[]
          | {
              name: string
              phone: string
            }
          | null
      }[]
    | {
        id: string
        pet_id: string
        owner_id: string
        pet:
          | {
              name: string
              species: string
            }[]
          | {
              name: string
              species: string
            }
          | null
        owner:
          | {
              name: string
              phone: string
            }[]
          | {
              name: string
              phone: string
            }
          | null
      }
    | null

  employee:
    | {
        display_name: string
        initials: string | null
      }[]
    | {
        display_name: string
        initials: string | null
      }
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

function normalizeAttendanceEntry(
  entry: AttendanceEntryQueryRow
): AttendanceEntryRow {
  const reservation = firstRelation(entry.reservation)
  const pet = firstRelation(reservation?.pet)

  const employee = firstRelation(entry.employee)

  let flags: string[] = []

  if (Array.isArray(entry.flags)) {
    flags = entry.flags
  } else if (entry.flags) {
    try {
      const parsed = JSON.parse(entry.flags)

      if (Array.isArray(parsed)) {
        flags = parsed.filter(
          (flag): flag is string => typeof flag === "string"
        )
      }
    } catch {
      flags = []
    }
  }

  return {
    id: entry.id,
    reservation_id: entry.reservation_id,
    type: entry.type,
    recorded_at: entry.recorded_at,
    recorded_by: entry.recorded_by,
    flags,
    notes: entry.notes,

    reservation: {
      id: reservation?.id ?? "",
      pet: {
        name: pet?.name ?? "Unknown pet",
        species: pet?.species ?? "Unknown",
      },
    },

    employee,
  }
}

/**
 * Admin list
 */
export async function listAttendanceEntries(
  filters: AttendanceEntryListFilters = {}
): Promise<AttendanceEntryRow[]> {
  const supabase = await createClient()

  let query = supabase
    .from("attendance_entries")
    .select(ATTENDANCE_ENTRY_COLUMNS)

  if (filters.type && filters.type !== "all") {
    query = query.eq("type", filters.type)
  }

  if (filters.search) {
    const search = filters.search.replace(
      /[%_]/g,
      (character) => `\\${character}`
    )

    // Find pets whose names match the search.
    const { data: pets, error: petsError } = await supabase
      .from("pets")
      .select("id")
      .ilike("name", `%${search}%`)

    if (petsError) {
      throw new Error(
        getSupabaseErrorMessage(
          petsError,
          "Failed to search pets for attendance entries"
        )
      )
    }

    const petIds = (pets ?? []).map((pet) => pet.id)

    // Find reservations belonging to matching pets.
    let matchingReservationIds: string[] = []

    if (petIds.length > 0) {
      const { data: reservations, error: reservationsError } =
        await supabase
          .from("reservations")
          .select("id")
          .in("pet_id", petIds)

      if (reservationsError) {
        throw new Error(
          getSupabaseErrorMessage(
            reservationsError,
            "Failed to search reservations for attendance entries"
          )
        )
      }

      matchingReservationIds = (reservations ?? []).map(
        (reservation) => reservation.id
      )
    }

    const searchConditions = [
      `notes.ilike.%${search}%`,
      `type.ilike.%${search}%`,
    ]

    if (matchingReservationIds.length > 0) {
      searchConditions.push(
        `reservation_id.in.(${matchingReservationIds.join(",")})`
      )
    }

    query = query.or(searchConditions.join(","))
  }

  const { data, error } = await query.order(
    "recorded_at",
    {
      ascending: false,
    }
  )

  if (error) {
    throw new Error(
      getSupabaseErrorMessage(
        error,
        "Failed to load attendance entries"
      )
    )
  }

  return (data ?? []).map(normalizeAttendanceEntry)
}

/**
 * Reservation attendance history
 */
export async function listAttendanceEntriesByReservationId(
  reservationId: string,
  filters: AttendanceEntryListFilters = {}
): Promise<AttendanceEntryRow[]> {
  const supabase = await createClient()

  let query = supabase
    .from("attendance_entries")
    .select(ATTENDANCE_ENTRY_COLUMNS)
    .eq("reservation_id", reservationId)

  if (filters.type && filters.type !== "all") {
    query = query.eq("type", filters.type)
  }

  if (filters.search) {
    const search = filters.search.replace(
      /[%_]/g,
      (character) => `\\${character}`
    )

    query = query.or(
      `notes.ilike.%${search}%,type.ilike.%${search}%`
    )
  }

  const { data, error } = await query.order(
    "recorded_at",
    {
      ascending: true,
    }
  )

  if (error) {
    throw new Error(
      getSupabaseErrorMessage(
        error,
        "Failed to load reservation attendance"
      )
    )
  }

  return (data ?? []).map(normalizeAttendanceEntry)
}

export async function getAttendanceEntryById(
  id: string
): Promise<AttendanceEntryRow | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("attendance_entries")
    .select(ATTENDANCE_ENTRY_COLUMNS)
    .eq("id", id)
    .maybeSingle()

  if (error) {
    throw new Error(
      getSupabaseErrorMessage(
        error,
        "Failed to load attendance entry"
      )
    )
  }

  return data ? normalizeAttendanceEntry(data) : null
}