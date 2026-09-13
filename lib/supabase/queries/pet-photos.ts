import { createClient } from "@/lib/supabase/server"

import type {
  PetPhotoRow,
  PetPhotoWithRelations,
} from "@/lib/supabase/types"

import { getSupabaseErrorMessage } from "@/lib/supabase/errors"

const PET_PHOTO_COLUMNS =
  "id, pet_id, file_url, caption, created_at" as const

const PET_PHOTO_RELATION_COLUMNS = `
  id,
  pet_id,
  file_url,
  caption,
  created_at,
  pet:pets (
    id,
    name,
    species,
    breed
  )
` as const

function normalizeRelation<T>(
  value: T | T[] | null | undefined
): T | null {
  if (value == null) return null

  return Array.isArray(value)
    ? value[0] ?? null
    : value
}

/** Pet profile — load all photos for a specific pet */
export async function listPetPhotos(
  petId: string
): Promise<PetPhotoRow[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("pet_photos")
    .select(PET_PHOTO_COLUMNS)
    .eq("pet_id", petId)
    .order("created_at", { ascending: false })

  if (error) {
    throw new Error(
      getSupabaseErrorMessage(
        error,
        "Failed to load pet photos"
      )
    )
  }

  return data ?? []
}

/** Load a single pet photo */
export async function getPetPhotoById(
  id: string
): Promise<PetPhotoRow | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("pet_photos")
    .select(PET_PHOTO_COLUMNS)
    .eq("id", id)
    .maybeSingle()

  if (error) {
    throw new Error(
      getSupabaseErrorMessage(
        error,
        "Failed to load pet photo"
      )
    )
  }

  return data
}

/** Load a pet photo together with its pet */
export async function getPetPhotoWithRelations(
  id: string
): Promise<PetPhotoWithRelations | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("pet_photos")
    .select(PET_PHOTO_RELATION_COLUMNS)
    .eq("id", id)
    .maybeSingle()

  if (error) {
    throw new Error(
      getSupabaseErrorMessage(
        error,
        "Failed to load pet photo"
      )
    )
  }

  if (!data) return null

  return {
    ...data,
    pet: normalizeRelation(data.pet),
  }
}