import { createClient } from "@/lib/supabase/server"
import type { AttendanceEntryRow } from "@/lib/supabase/types"
import type { AttendanceEntryListFilters } from "@/lib/constants/attendance-entries-filters"
import { getSupabaseErrorMessage } from "@/lib/supabase/errors"

const ATTENDANCE_ENTRY_COLUMNS = `
  id,
  reservation_id,
  type,
  recorded_at,
  recorded_by,
  flags,
  notes,
  reservation:reservations (
    id,
    pet:pets (
      name,
      species
    )
  ),
  employee:employees (
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
  flags: string[]
  notes: string | null

  reservation:
    | {
        id: string
        pet:
          | {
              name: string
              species: string
            }[]
          | null
      }[]
    | null

  employee:
    | {
        display_name: string
        initials: string | null
      }[]
    | null
}

function normalizeAttendanceEntry(
  entry: AttendanceEntryQueryRow
): AttendanceEntryRow {
  const reservation = entry.reservation?.[0]

  return {
    id: entry.id,
    reservation_id: entry.reservation_id,
    type: entry.type,
    recorded_at: entry.recorded_at,
    recorded_by: entry.recorded_by,
    flags: entry.flags,
    notes: entry.notes,

    reservation: {
      id: reservation?.id ?? "",
      pet: {
        name: reservation?.pet?.[0]?.name ?? "Unknown pet",
        species: reservation?.pet?.[0]?.species ?? "Unknown",
      },
    },

    employee: entry.employee?.[0] ?? null,
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