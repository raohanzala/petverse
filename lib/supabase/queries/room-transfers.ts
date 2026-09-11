import { createClient } from "@/lib/supabase/server"
import type { RoomTransferListFilters } from "@/lib/constants/room-transfer-filters"
import type {
  FacilityResourceType,
  RoomTransferListRow,
  RoomTransferRow,
} from "@/lib/supabase/types"
import { getSupabaseErrorMessage } from "@/lib/supabase/errors"

const ROOM_TRANSFER_COLUMNS = `
  id,
  reservation_id,
  from_resource_id,
  to_resource_id,
  transferred_at,
  notes,
  reservation:reservations(
    id,
    pet:pets(
      name,
      species
    ),
    owner:owners(
      name,
      phone
    )
  ),
  from_resource:facility_resources!room_transfers_from_resource_id_fkey(
    id,
    name,
    type
  ),
  to_resource:facility_resources!room_transfers_to_resource_id_fkey(
    id,
    name,
    type
  )
` as const

type RoomTransferQueryRow = {
  id: string
  reservation_id: string
  from_resource_id: string | null
  to_resource_id: string
  transferred_at: string
  notes: string | null

  reservation: {
    id: string

    pet: {
      name: string
      species: string
    }[] | null

    owner: {
      name: string
      phone: string
    }[] | null
  }[] | null

  from_resource: {
    id: string
    name: string
    type: FacilityResourceType
  }[] | null

  to_resource: {
    id: string
    name: string
    type: FacilityResourceType
  }[] | null
}

function normalizeRoomTransfer(
  row: RoomTransferQueryRow
): RoomTransferListRow {
  const reservation = row.reservation?.[0]
  const pet = reservation?.pet?.[0]
  const owner = reservation?.owner?.[0]
  const fromResource = row.from_resource?.[0]
  const toResource = row.to_resource?.[0]

  return {
    id: row.id,
    reservation_id: row.reservation_id,
    from_resource_id: row.from_resource_id,
    to_resource_id: row.to_resource_id,
    transferred_at: row.transferred_at,
    notes: row.notes,

    reservation: {
      id: reservation?.id ?? "",
      pet: {
        name: pet?.name ?? "Unknown pet",
        species: pet?.species ?? "Unknown",
      },
      owner: {
        name: owner?.name ?? "Unknown owner",
        phone: owner?.phone ?? "",
      },
    },

    from_resource: fromResource
      ? {
          id: fromResource.id,
          name: fromResource.name,
          type: fromResource.type,
        }
      : null,

    to_resource: {
      id: toResource?.id ?? "",
      name: toResource?.name ?? "Unknown resource",
      type: toResource?.type ?? "other",
    },
  }
}

function normalizeRoomTransfers(
  rows: RoomTransferQueryRow[]
): RoomTransferListRow[] {
  return rows.map(normalizeRoomTransfer)
}

function escapeIlikePattern(value: string) {
  return value.replace(/[%_\\]/g, "\\$&")
}

/** Admin list — supports server-side search */
export async function listRoomTransfers(
  filters: RoomTransferListFilters = {}
): Promise<RoomTransferListRow[]> {
  const supabase = await createClient()
  const { search } = filters

  let query = supabase
    .from("room_transfers")
    .select(ROOM_TRANSFER_COLUMNS)

  if (search) {
    const pattern = `%${escapeIlikePattern(search)}%`

    const [
      { data: pets, error: petsError },
      { data: owners, error: ownersError },
      { data: resources, error: resourcesError },
    ] = await Promise.all([
      supabase
        .from("pets")
        .select("id")
        .ilike("name", pattern),

      supabase
        .from("owners")
        .select("id")
        .ilike("name", pattern),

      supabase
        .from("facility_resources")
        .select("id")
        .ilike("name", pattern),
    ])

    if (petsError) {
      throw new Error(
        getSupabaseErrorMessage(
          petsError,
          "Failed to search pets"
        )
      )
    }

    if (ownersError) {
      throw new Error(
        getSupabaseErrorMessage(
          ownersError,
          "Failed to search owners"
        )
      )
    }

    if (resourcesError) {
      throw new Error(
        getSupabaseErrorMessage(
          resourcesError,
          "Failed to search facility resources"
        )
      )
    }

    const petIds = (pets ?? []).map(
      (pet) => pet.id
    )

    const ownerIds = (owners ?? []).map(
      (owner) => owner.id
    )

    const resourceIds = (resources ?? []).map(
      (resource) => resource.id
    )

    const conditions: string[] = []

    if (petIds.length > 0) {
      conditions.push(
        `reservation.pet_id.in.(${petIds.join(",")})`
      )
    }

    if (ownerIds.length > 0) {
      conditions.push(
        `reservation.owner_id.in.(${ownerIds.join(",")})`
      )
    }

    if (resourceIds.length > 0) {
      conditions.push(
        `from_resource_id.in.(${resourceIds.join(",")})`
      )

      conditions.push(
        `to_resource_id.in.(${resourceIds.join(",")})`
      )
    }

    if (conditions.length === 0) {
      return []
    }

    query = query.or(conditions.join(","))
  }

  const { data, error } = await query.order(
    "transferred_at",
    {
      ascending: false,
    }
  )

  if (error) {
    throw new Error(
      getSupabaseErrorMessage(
        error,
        "Failed to load room transfers"
      )
    )
  }

  return normalizeRoomTransfers(
    (data ?? []) as RoomTransferQueryRow[]
  )
}

export async function getRoomTransferById(
  id: string
): Promise<RoomTransferRow | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("room_transfers")
    .select(`
      id,
      reservation_id,
      from_resource_id,
      to_resource_id,
      transferred_at,
      notes
    `)
    .eq("id", id)
    .maybeSingle()

  if (error) {
    throw new Error(
      getSupabaseErrorMessage(
        error,
        "Failed to load room transfer"
      )
    )
  }

  return data
}