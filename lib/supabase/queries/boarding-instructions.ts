import { createClient } from "@/lib/supabase/server"
import type { BoardingInstructionsListFilters } from "@/lib/constants/boarding-instructions-filters"
import type {
  PetBoardingInstructionsListRow,
  PetBoardingInstructionsRow,
} from "@/lib/supabase/types"
import { getSupabaseErrorMessage } from "@/lib/supabase/errors"
import { ReservationStatus } from "../types"

const BOARDING_INSTRUCTIONS_COLUMNS = `
  id,
  pet_id,
  reservation_id,
  feeding_notes,
  medication_notes,
  behavior_notes,
  updated_at,
  pet:pets(
    name,
    species
  ),
  reservation:reservations(
    id,
    status,
    check_in_at,
    check_out_at
  )
` as const

function escapeIlikePattern(value: string) {
  return value.replace(/[%_\\]/g, "\\$&")
}

type BoardingInstructionsQueryRow = {
  id: string
  pet_id: string
  reservation_id: string | null
  feeding_notes: string | null
  medication_notes: string | null
  behavior_notes: string | null
  updated_at: string

  pet: {
    name: string
    species: string
  }[] | null

  reservation: {
    id: string
    status: ReservationStatus
    check_in_at: string
    check_out_at: string
  }[] | null
}

function normalizeBoardingInstructions(
  row: BoardingInstructionsQueryRow
): PetBoardingInstructionsListRow {
  const pet = row.pet?.[0]
  const reservation = row.reservation?.[0]

  return {
    id: row.id,
    pet_id: row.pet_id,
    reservation_id: row.reservation_id,
    feeding_notes: row.feeding_notes,
    medication_notes: row.medication_notes,
    behavior_notes: row.behavior_notes,
    updated_at: row.updated_at,

    pet: {
      name: pet?.name ?? "Unknown pet",
      species: pet?.species ?? "Unknown",
    },

    reservation: reservation
      ? {
        id: reservation.id,
        status: reservation.status,
        check_in_at: reservation.check_in_at,
        check_out_at: reservation.check_out_at,
      }
      : null,
  }
}

/** Admin list — supports server-side search */
export async function listBoardingInstructions(
  filters: BoardingInstructionsListFilters = {}
): Promise<PetBoardingInstructionsListRow[]> {
  const supabase = await createClient()
  const { search } = filters

  let query = supabase
    .from("pet_boarding_instructions")
    .select(BOARDING_INSTRUCTIONS_COLUMNS)

  if (search) {
    const [
      { data: pets, error: petsError },
    ] = await Promise.all([
      supabase
        .from("pets")
        .select("id")
        .ilike(
          "name",
          `%${escapeIlikePattern(search)}%`
        ),
    ])

    if (petsError) {
      throw new Error(
        getSupabaseErrorMessage(
          petsError,
          "Failed to search pets"
        )
      )
    }

    const petIds = (pets ?? []).map(
      (pet) => pet.id
    )

    if (petIds.length === 0) {
      return []
    }

    query = query.in("pet_id", petIds)
  }

  const { data, error } = await query.order(
    "updated_at",
    { ascending: false }
  )

  if (error) {
    throw new Error(
      getSupabaseErrorMessage(
        error,
        "Failed to load boarding instructions"
      )
    )
  }

  return (data ?? []).map((row) =>
    normalizeBoardingInstructions(
      row as BoardingInstructionsQueryRow
    )
  )
}

export async function getBoardingInstructionsById(
  id: string
): Promise<PetBoardingInstructionsRow | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("pet_boarding_instructions")
    .select(
      `
        id,
        pet_id,
        reservation_id,
        feeding_notes,
        medication_notes,
        behavior_notes,
        updated_at
      `
    )
    .eq("id", id)
    .maybeSingle()

  if (error) {
    throw new Error(
      getSupabaseErrorMessage(
        error,
        "Failed to load boarding instructions"
      )
    )
  }

  return data
}

export async function getBoardingInstructionsByPetId(
  petId: string
): Promise<PetBoardingInstructionsRow | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("pet_boarding_instructions")
    .select(
      `
        id,
        pet_id,
        reservation_id,
        feeding_notes,
        medication_notes,
        behavior_notes,
        updated_at
      `
    )
    .eq("pet_id", petId)
    .maybeSingle()

  if (error) {
    throw new Error(
      getSupabaseErrorMessage(
        error,
        "Failed to load boarding instructions"
      )
    )
  }

  return data
}