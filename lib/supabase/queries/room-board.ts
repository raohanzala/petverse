import { createClient } from "@/lib/supabase/server"
import type {
  FacilityResourceType,
  ReservationRow,
  ReservationStatus,
} from "@/lib/supabase/types"

const ROOM_BOARD_RESERVATION_COLUMNS = `
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

type RoomBoardReservationQueryRow = {
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

function normalizeRoomBoardReservation(
  row: RoomBoardReservationQueryRow
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

export async function listRoomBoardReservations(): Promise<
  ReservationRow[]
> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("reservations")
    .select(ROOM_BOARD_RESERVATION_COLUMNS)
    .in("status", [
      "pending",
      "confirmed",
      "checked_in",
    ])
    .not("resource_id", "is", null)
    .order("check_in_at", {
      ascending: true,
    })

  if (error) {
    throw new Error(
      error.message ||
        "Failed to load room board reservations"
    )
  }

  return (data ?? []).map((row) =>
    normalizeRoomBoardReservation(
      row as RoomBoardReservationQueryRow
    )
  )
}