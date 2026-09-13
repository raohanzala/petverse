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
import type { PetPhotoRow } from "@/lib/supabase/types"
import {
  createPetPhotoSchema,
  deletePetPhotoSchema,
  updatePetPhotoSchema,
  type CreatePetPhotoInput,
  type UpdatePetPhotoInput,
} from "@/lib/validations/pet-photo"

const REVALIDATE_PATHS = [
  "/admin/pets",
] as const

function revalidatePetPhotoPaths() {
  for (const path of REVALIDATE_PATHS) {
    revalidatePath(path)
  }
}

function normalizeCaption(
  value: string | null | undefined
) {
  const trimmed = value?.trim()

  return trimmed ? trimmed : null
}

export async function createPetPhoto(
  input: CreatePetPhotoInput
): Promise<MutationResult<PetPhotoRow>> {
  await requireStaff()

  const parsed =
    createPetPhotoSchema.safeParse({
      ...input,
      caption: normalizeCaption(input.caption),
    })

  if (!parsed.success) {
    return mutationError(
      parsed.error.issues[0]?.message ??
        "Invalid input"
    )
  }

  const supabase = await createClient()

  const { data, error } = await supabase
    .from("pet_photos")
    .insert({
      pet_id: parsed.data.pet_id,
      file_url: parsed.data.file_url.trim(),
      caption: parsed.data.caption,
    })
    .select()
    .single()

  if (error) {
    return mutationError(
      getSupabaseErrorMessage(
        error,
        "Failed to create pet photo"
      )
    )
  }

  revalidatePetPhotoPaths()

  return mutationSuccess(data)
}

export async function updatePetPhoto(
  input: UpdatePetPhotoInput
): Promise<MutationResult<PetPhotoRow>> {
  await requireStaff()

  const parsed =
    updatePetPhotoSchema.safeParse({
      ...input,
      caption:
        input.caption !== undefined
          ? normalizeCaption(input.caption)
          : undefined,
    })

  if (!parsed.success) {
    return mutationError(
      parsed.error.issues[0]?.message ??
        "Invalid input"
    )
  }

  const { id, ...updates } = parsed.data

  const payload: Record<string, unknown> = {}

  if (updates.pet_id !== undefined) {
    payload.pet_id = updates.pet_id
  }

  if (updates.file_url !== undefined) {
    payload.file_url =
      updates.file_url.trim()
  }

  if (updates.caption !== undefined) {
    payload.caption = updates.caption
  }

  if (Object.keys(payload).length === 0) {
    return mutationError("No changes to save")
  }

  const supabase = await createClient()

  const { data, error } = await supabase
    .from("pet_photos")
    .update(payload)
    .eq("id", id)
    .select()
    .single()

  if (error) {
    return mutationError(
      getSupabaseErrorMessage(
        error,
        "Failed to update pet photo"
      )
    )
  }

  revalidatePetPhotoPaths()

  return mutationSuccess(data)
}

export async function deletePetPhoto(
  id: string
): Promise<MutationResult> {
  await requireStaff()

  const parsed =
    deletePetPhotoSchema.safeParse({ id })

  if (!parsed.success) {
    return mutationError(
      parsed.error.issues[0]?.message ??
        "Invalid pet photo"
    )
  }

  const supabase = await createClient()

  const { error } = await supabase
    .from("pet_photos")
    .delete()
    .eq("id", parsed.data.id)

  if (error) {
    return mutationError(
      getSupabaseErrorMessage(
        error,
        "Failed to delete pet photo"
      )
    )
  }

  revalidatePetPhotoPaths()

  return mutationSuccess(undefined)
}