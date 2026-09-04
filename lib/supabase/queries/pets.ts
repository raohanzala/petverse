import { createClient } from "@/lib/supabase/server"
import type { PetListFilters } from "@/lib/constants/pet-filters"
import type { PetRow } from "@/lib/supabase/types"
import { getSupabaseErrorMessage } from "@/lib/supabase/errors"

const PET_COLUMNS = `
  id,
  owner_id,
  name,
  species,
  breed,
  birth_date,
  weight_kg,
  color,
  notes,
  is_active,
  created_at,
  updated_at,
  owner:owners (
    name,
    phone
  )
` as const

function escapeIlikePattern(value: string) {
  return value.replace(/[%_\\]/g, "\\$&")
}

/** Admin list — supports server-side search and status filter */
export async function listPets(
  filters: PetListFilters = {}
): Promise<PetRow[]> {
  const supabase = await createClient()
  const { search, status = "all" } = filters

  let query = supabase
    .from("pets")
    .select(PET_COLUMNS)

  if (status === "active") {
    query = query.eq("is_active", true)
  } else if (status === "inactive") {
    query = query.eq("is_active", false)
  }

  if (search) {
    const pattern = `%${escapeIlikePattern(search)}%`

    query = query.or(
      `name.ilike.${pattern},species.ilike.${pattern},breed.ilike.${pattern},color.ilike.${pattern}`
    )
  }

  const { data, error } = await query
    .order("name", { ascending: true })

  if (error) {
    throw new Error(
      getSupabaseErrorMessage(
        error,
        "Failed to load pets"
      )
    )
  }

  return data ?? []
}

/** Booking / appointment — active pets only */
export async function listActivePets(): Promise<PetRow[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("pets")
    .select(PET_COLUMNS)
    .eq("is_active", true)
    .order("name", { ascending: true })

  if (error) {
    throw new Error(
      getSupabaseErrorMessage(
        error,
        "Failed to load pets"
      )
    )
  }

  return data ?? []
}

/** All active pets belonging to a specific owner */
export async function listPetsByOwnerId(
  ownerId: string
): Promise<PetRow[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("pets")
    .select(PET_COLUMNS)
    .eq("owner_id", ownerId)
    .eq("is_active", true)
    .order("name", { ascending: true })

  if (error) {
    throw new Error(
      getSupabaseErrorMessage(
        error,
        "Failed to load owner pets"
      )
    )
  }

  return data ?? []
}

export async function getPetById(
  id: string
): Promise<PetRow | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("pets")
    .select(PET_COLUMNS)
    .eq("id", id)
    .maybeSingle()

  if (error) {
    throw new Error(
      getSupabaseErrorMessage(
        error,
        "Failed to load pet"
      )
    )
  }

  return data
}