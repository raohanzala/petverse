"use server"

import { revalidatePath } from "next/cache"

import { requireStaff } from "@/lib/auth/session"
import {
  getSupabaseErrorMessage,
  mutationError,
  mutationSuccess,
  type MutationResult,
} from "@/lib/supabase/errors"
import { createClient } from "@/lib/supabase/server"
import type { PetUpdateImageRow } from "@/lib/supabase/types"
import {
  createPetUpdateImageSchema,
  deletePetUpdateImageSchema,
  reorderPetUpdateImagesSchema,
  type CreatePetUpdateImageInput,
  type ReorderPetUpdateImagesInput,
} from "@/lib/validations/pet-update-image"
import { listPetUpdateImages } from "../queries/pet-update-images"

const REVALIDATE_PATHS = [
  "/admin/crm/daily-updates",
] as const

function revalidatePetUpdateImagePaths() {
  for (const path of REVALIDATE_PATHS) {
    revalidatePath(path)
  }
}

export async function createPetUpdateImage(
  input: CreatePetUpdateImageInput
): Promise<MutationResult<PetUpdateImageRow>> {
  await requireStaff()

  const parsed = createPetUpdateImageSchema.safeParse(input)

  if (!parsed.success) {
    return mutationError(
      parsed.error.issues[0]?.message ?? "Invalid input"
    )
  }

  const supabase = await createClient()

  const { data, error } = await supabase
    .from("pet_update_images")
    .insert({
      daily_update_id: parsed.data.daily_update_id ?? null,
      pet_id: parsed.data.pet_id,
      file_url: parsed.data.file_url.trim(),
      sorted_at: parsed.data.sorted_at ?? null,
    })
    .select()
    .single()

  if (error) {
    return mutationError(
      getSupabaseErrorMessage(
        error,
        "Failed to create pet update image"
      )
    )
  }

  revalidatePetUpdateImagePaths()

  return mutationSuccess(data)
}

export async function deletePetUpdateImage(
  id: string
): Promise<MutationResult> {
  await requireStaff()

  const parsed = deletePetUpdateImageSchema.safeParse({ id })

  if (!parsed.success) {
    return mutationError(
      parsed.error.issues[0]?.message ?? "Invalid image"
    )
  }

  const supabase = await createClient()

  const { error } = await supabase
    .from("pet_update_images")
    .delete()
    .eq("id", parsed.data.id)

  if (error) {
    return mutationError(
      getSupabaseErrorMessage(
        error,
        "Failed to delete pet update image"
      )
    )
  }

  revalidatePetUpdateImagePaths()

  return mutationSuccess(undefined)
}

export async function reorderPetUpdateImages(
  input: ReorderPetUpdateImagesInput
): Promise<MutationResult> {
  await requireStaff()

  const parsed = reorderPetUpdateImagesSchema.safeParse(input)

  if (!parsed.success) {
    return mutationError(
      parsed.error.issues[0]?.message ?? "Invalid image order"
    )
  }

  const supabase = await createClient()

  for (const [index, image] of parsed.data.images.entries()) {
    const { error } = await supabase
      .from("pet_update_images")
      .update({
        sorted_at: new Date(
          Date.now() + index * 1000
        ).toISOString(),
      })
      .eq("id", image.id)

    if (error) {
      return mutationError(
        getSupabaseErrorMessage(
          error,
          "Failed to reorder pet update images"
        )
      )
    }
  }

  revalidatePetUpdateImagePaths()

  return mutationSuccess(undefined)
}

export async function getPetUpdateImages(
  dailyUpdateId: string
): Promise<MutationResult<PetUpdateImageRow[]>> {
  await requireStaff()

  if (!dailyUpdateId) {
    return mutationError(
      "Daily update id is required"
    )
  }

  try {
    const images =
      await listPetUpdateImages(dailyUpdateId)

    return mutationSuccess(images)
  } catch (error) {
    return mutationError(
      error instanceof Error
        ? error.message
        : "Failed to load pet update images"
    )
  }
}