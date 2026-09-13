import { createClient } from "@/lib/supabase/server"

import type {
  PetUpdateImageRow,
  PetUpdateImageWithRelations,
} from "@/lib/supabase/types"

import { getSupabaseErrorMessage } from "@/lib/supabase/errors"

const PET_UPDATE_IMAGE_COLUMNS =
  "id, daily_update_id, pet_id, file_url, sorted_at, created_at" as const

const PET_UPDATE_IMAGE_RELATION_COLUMNS = `
  id,
  daily_update_id,
  pet_id,
  file_url,
  sorted_at,
  created_at,
  pet:pets (
    id,
    name,
    species
  ),
  daily_update:daily_updates (
    id,
    body,
    created_at
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

/** Load all images attached to a daily update */
export async function listPetUpdateImages(
  dailyUpdateId: string
): Promise<PetUpdateImageRow[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("pet_update_images")
    .select(PET_UPDATE_IMAGE_COLUMNS)
    .eq("daily_update_id", dailyUpdateId)
    .order("sorted_at", { ascending: true, nullsFirst: false })
    .order("created_at", { ascending: true })

  if (error) {
    throw new Error(
      getSupabaseErrorMessage(
        error,
        "Failed to load daily update images"
      )
    )
  }

  return data ?? []
}

/** Load a single image by id */
export async function getPetUpdateImageById(
  id: string
): Promise<PetUpdateImageRow | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("pet_update_images")
    .select(PET_UPDATE_IMAGE_COLUMNS)
    .eq("id", id)
    .maybeSingle()

  if (error) {
    throw new Error(
      getSupabaseErrorMessage(
        error,
        "Failed to load daily update image"
      )
    )
  }

  return data
}

/** Load an image with its pet and daily update relations */
export async function getPetUpdateImageWithRelations(
  id: string
): Promise<PetUpdateImageWithRelations | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("pet_update_images")
    .select(PET_UPDATE_IMAGE_RELATION_COLUMNS)
    .eq("id", id)
    .maybeSingle()

  if (error) {
    throw new Error(
      getSupabaseErrorMessage(
        error,
        "Failed to load daily update image"
      )
    )
  }

  if (!data) return null

  return {
    ...data,
    pet: normalizeRelation(data.pet),
    daily_update: normalizeRelation(
      data.daily_update
    ),
  }
}