import { createClient } from "@/lib/supabase/server"
import type { ReservationListFilters } from "@/lib/constants/reservation-filters"
import type {
  FacilityResourceType,
  ReservationRow,
  ReservationStatus,
} from "@/lib/supabase/types"
import { getSupabaseErrorMessage } from "@/lib/supabase/errors"

const RESERVATION_COLUMNS = `
  id,
  pet_id,
  owner_id,
  resource_id,
  service_id,
  status,
  check_in_at,
  check_out_at,
  notes,
  created_at,
  updated_at,
  pet:pets (
    name,
    species
  ),
  owner:owners (
    name,
    phone
  ),
  resource:facility_resources (
    name,
    type
  ),
  service:services (
    name
  )
` as const

type ReservationQueryRow = {
  id: string
  pet_id: string
  owner_id: string
  resource_id: string | null
  service_id: string | null
  status: ReservationStatus
  check_in_at: string
  check_out_at: string
  notes: string | null
  created_at: string
  updated_at: string

  pet: {
    name: string
    species: string
  }[] | null

  owner: {
    name: string
    phone: string
  }[] | null

  resource: {
    name: string
    type: FacilityResourceType
  }[] | null

  service: {
    name: string
  }[] | null
}

function normalizeReservation(
  row: ReservationQueryRow
): ReservationRow {
  const pet = row.pet?.[0]
  const owner = row.owner?.[0]
  const resource = row.resource?.[0]
  const service = row.service?.[0]

  return {
    id: row.id,
    pet_id: row.pet_id,
    owner_id: row.owner_id,
    resource_id: row.resource_id,
    service_id: row.service_id,
    status: row.status,
    check_in_at: row.check_in_at,
    check_out_at: row.check_out_at,
    notes: row.notes,
    created_at: row.created_at,
    updated_at: row.updated_at,

    pet: {
      name: pet?.name ?? "Unknown pet",
      species: pet?.species ?? "Unknown",
    },

    owner: {
      name: owner?.name ?? "Unknown owner",
      phone: owner?.phone ?? "",
    },

    resource: {
      name: resource?.name ?? "Unassigned",
      type: resource?.type ?? "other",
    },

    service: {
      name: service?.name ?? "No service",
    },
  }
}

function normalizeReservations(
  rows: ReservationQueryRow[]
): ReservationRow[] {
  return rows.map(normalizeReservation)
}

function escapeIlikePattern(value: string) {
  return value.replace(/[%_\\]/g, "\\$&")
}

/** Admin list — supports server-side search, status, and date filters */
export async function listReservations(
  filters: ReservationListFilters = {}
): Promise<ReservationRow[]> {
  const supabase = await createClient()

  const {
    search,
    status = "all",
  } = filters

  let query = supabase
    .from("reservations")
    .select(RESERVATION_COLUMNS)

  if (status !== "all") {
    query = query.eq("status", status)
  }

  if (search) {
    const pattern = `%${escapeIlikePattern(search)}%`

    query = query.or(
      `notes.ilike.${pattern}`
    )
  }

  const { data, error } = await query
    .order("check_in_at", {
      ascending: true,
    })

  if (error) {
    throw new Error(
      getSupabaseErrorMessage(
        error,
        "Failed to load reservations"
      )
    )
  }

  return normalizeReservations(
    (data ?? []) as ReservationQueryRow[]
  )
}

/** Boarding / daycare — active reservations only */
export async function listActiveReservations(): Promise<
  ReservationRow[]
> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("reservations")
    .select(RESERVATION_COLUMNS)
    .in("status", [
      "pending",
      "confirmed",
      "checked_in",
    ])
    .order("check_in_at", {
      ascending: true,
    })

  if (error) {
    throw new Error(
      getSupabaseErrorMessage(
        error,
        "Failed to load active reservations"
      )
    )
  }

  return normalizeReservations(
    (data ?? []) as ReservationQueryRow[]
  )
}

export async function getReservationById(
  id: string
): Promise<ReservationRow | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("reservations")
    .select(RESERVATION_COLUMNS)
    .eq("id", id)
    .maybeSingle()

  if (error) {
    throw new Error(
      getSupabaseErrorMessage(
        error,
        "Failed to load reservation"
      )
    )
  }

  return data
    ? normalizeReservation(
        data as ReservationQueryRow
      )
    : null
}

export async function listReservationsByPetId(
  petId: string
): Promise<ReservationRow[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("reservations")
    .select(RESERVATION_COLUMNS)
    .eq("pet_id", petId)
    .order("check_in_at", {
      ascending: false,
    })

  if (error) {
    throw new Error(
      getSupabaseErrorMessage(
        error,
        "Failed to load pet reservations"
      )
    )
  }

  return normalizeReservations(
    (data ?? []) as ReservationQueryRow[]
  )
}

export async function listReservationsByOwnerId(
  ownerId: string
): Promise<ReservationRow[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("reservations")
    .select(RESERVATION_COLUMNS)
    .eq("owner_id", ownerId)
    .order("check_in_at", {
      ascending: false,
    })

  if (error) {
    throw new Error(
      getSupabaseErrorMessage(
        error,
        "Failed to load owner reservations"
      )
    )
  }

  return normalizeReservations(
    (data ?? []) as ReservationQueryRow[]
  )
}