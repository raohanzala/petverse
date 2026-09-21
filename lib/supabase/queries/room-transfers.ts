import { createClient } from "@/lib/supabase/server"
import type { RoomTransferListFilters } from "@/lib/constants/room-transfer-filters"
import type {
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

    const petIds = (pets ?? []).map((pet) => pet.id)
    const ownerIds = (owners ?? []).map((owner) => owner.id)
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

  const { data, error } = await query
    .order("transferred_at", { ascending: false })

  if (error) {
    throw new Error(
      getSupabaseErrorMessage(
        error,
        "Failed to load room transfers"
      )
    )
  }

  return (data ?? []) as unknown as RoomTransferListRow[]
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