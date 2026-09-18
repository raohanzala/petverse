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

  pet:pets!reservations_pet_id_fkey (
    name,
    species
  ),

  owner:owners!reservations_owner_id_fkey (
    name,
    phone
  ),

  resource:facility_resources!reservations_resource_id_fkey (
    name,
    type
  ),

  service:services!reservations_service_id_fkey (
    name
  )
` as const

type PetRelation = {
  name: string
  species: string
}

type OwnerRelation = {
  name: string
  phone: string
}

type ResourceRelation = {
  name: string
  type: FacilityResourceType
}

type ServiceRelation = {
  name: string
}

type RawRelation<T> = T | T[] | null

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

  pet: RawRelation<PetRelation>
  owner: RawRelation<OwnerRelation>
  resource: RawRelation<ResourceRelation>
  service: RawRelation<ServiceRelation>
}

function getRelation<T>(
  relation: RawRelation<T>
): T | null {
  if (Array.isArray(relation)) {
    return relation[0] ?? null
  }

  return relation
}

function normalizeReservation(
  row: ReservationQueryRow
): ReservationRow {
  const pet = getRelation(row.pet)
  const owner = getRelation(row.owner)
  const resource = getRelation(row.resource)
  const service = getRelation(row.service)

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
      name: service?.name ?? "Unknown Service",
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

/**
 * Admin list
 * Supports server-side search and status filters.
 */
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

/**
 * Boarding / daycare
 * Returns active reservations only.
 */
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