import { createClient } from "@/lib/supabase/server"
import type { BoardingWaitlistListFilters } from "@/lib/constants/boarding-waitlist-filters"
import type { BoardingWaitlistListRow } from "@/lib/supabase/types"
import { getSupabaseErrorMessage } from "@/lib/supabase/errors"

const WAITLIST_COLUMNS = `
  id,
  pet_id,
  owner_id,
  desired_from,
  desired_to,
  notes,
  created_at,
  pet:pets(
    name,
    species
  ),
  owner:owners(
    name,
    phone
  )
` as const

type BoardingWaitlistQueryRow = {
  id: string
  pet_id: string
  owner_id: string
  desired_from: string
  desired_to: string
  notes: string | null
  created_at: string

  pet: {
    name: string
    species: string
  }[] | null

  owner: {
    name: string
    phone: string
  }[] | null
}

function normalizeBoardingWaitlist(
  row: BoardingWaitlistQueryRow
): BoardingWaitlistListRow {
  const pet = row.pet?.[0]
  const owner = row.owner?.[0]

  return {
    id: row.id,
    pet_id: row.pet_id,
    owner_id: row.owner_id,
    desired_from: row.desired_from,
    desired_to: row.desired_to,
    notes: row.notes,
    created_at: row.created_at,

    pet: {
      name: pet?.name ?? "Unknown pet",
      species: pet?.species ?? "Unknown",
    },

    owner: {
      name: owner?.name ?? "Unknown owner",
      phone: owner?.phone ?? "",
    },
  }
}

function escapeIlikePattern(value: string) {
  return value.replace(/[%_\\]/g, "\\$&")
}

/** Admin list — supports server-side search */
export async function listBoardingWaitlist(
  filters: BoardingWaitlistListFilters = {}
): Promise<BoardingWaitlistListRow[]> {
  const supabase = await createClient()
  const { search } = filters

  let query = supabase
    .from("boarding_waitlist")
    .select(WAITLIST_COLUMNS)

  if (search) {
    const pattern = `%${escapeIlikePattern(search)}%`

    const [
      { data: pets, error: petsError },
      { data: owners, error: ownersError },
    ] = await Promise.all([
      supabase
        .from("pets")
        .select("id")
        .ilike("name", pattern),

      supabase
        .from("owners")
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

    const petIds = (pets ?? []).map((pet) => pet.id)
    const ownerIds = (owners ?? []).map((owner) => owner.id)

    if (petIds.length === 0 && ownerIds.length === 0) {
      return []
    }

    const conditions: string[] = []

    if (petIds.length > 0) {
      conditions.push(
        `pet_id.in.(${petIds.join(",")})`
      )
    }

    if (ownerIds.length > 0) {
      conditions.push(
        `owner_id.in.(${ownerIds.join(",")})`
      )
    }

    query = query.or(conditions.join(","))
  }

  const { data, error } = await query.order(
    "desired_from",
    {
      ascending: true,
    }
  )

  if (error) {
    throw new Error(
      getSupabaseErrorMessage(
        error,
        "Failed to load boarding waitlist"
      )
    )
  }

  return (data ?? []).map((row) =>
    normalizeBoardingWaitlist(
      row as BoardingWaitlistQueryRow
    )
  )
}