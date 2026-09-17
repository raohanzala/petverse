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
import type { OwnerRow } from "@/lib/supabase/types"
import {
  createOwnerSchema,
  deleteOwnerSchema,
  updateOwnerSchema,
  type CreateOwnerInput,
  type UpdateOwnerInput,
} from "@/lib/validations/owner"

const REVALIDATE_PATHS = [
  "/admin/owners",
  "/admin/appointments",
  "/book",
] as const

function revalidateOwnerPaths() {
  for (const path of REVALIDATE_PATHS) {
    revalidatePath(path)
  }
}

function normalizeOptionalText(
  value: string | null | undefined
) {
  const trimmed = value?.trim()
  return trimmed ? trimmed : null
}

export async function createOwner(
  input: CreateOwnerInput
): Promise<MutationResult<OwnerRow>> {
  await requireStaff()

  const parsed = createOwnerSchema.safeParse({
    ...input,
    email: normalizeOptionalText(input.email),
    preferred_contact: normalizeOptionalText(
      input.preferred_contact
    ),
  })

  if (!parsed.success) {
    return mutationError(
      parsed.error.issues[0]?.message ?? "Invalid input"
    )
  }

  const supabase = await createClient()

  const { data, error } = await supabase
    .from("owners")
    .insert({
      name: parsed.data.name.trim(),
      phone: parsed.data.phone.trim(),
      email: parsed.data.email,
      preferred_contact: parsed.data.preferred_contact,
    })
    .select()
    .single()

  if (error) {
    return mutationError(
      getSupabaseErrorMessage(
        error,
        "Failed to create owner"
      )
    )
  }

  revalidateOwnerPaths()
  return mutationSuccess(data)
}

export async function updateOwner(
  input: UpdateOwnerInput
): Promise<MutationResult<OwnerRow>> {
  await requireStaff()

  const parsed = updateOwnerSchema.safeParse({
    ...input,
    email:
      input.email !== undefined
        ? normalizeOptionalText(input.email)
        : undefined,
    preferred_contact:
      input.preferred_contact !== undefined
        ? normalizeOptionalText(input.preferred_contact)
        : undefined,
  })

  if (!parsed.success) {
    return mutationError(
      parsed.error.issues[0]?.message ?? "Invalid input"
    )
  }

  const { id, ...updates } = parsed.data

  const payload: Record<string, unknown> = {}

  if (updates.name !== undefined) {
    payload.name = updates.name.trim()
  }

  if (updates.phone !== undefined) {
    payload.phone = updates.phone.trim()
  }

  if (updates.email !== undefined) {
    payload.email = updates.email
  }

  if (updates.preferred_contact !== undefined) {
    payload.preferred_contact = updates.preferred_contact
  }

  if (Object.keys(payload).length === 0) {
    return mutationError("No changes to save")
  }

  const supabase = await createClient()

  const { data, error } = await supabase
    .from("owners")
    .update(payload)
    .eq("id", id)
    .select()
    .single()

  if (error) {
    return mutationError(
      getSupabaseErrorMessage(
        error,
        "Failed to update owner"
      )
    )
  }

  revalidateOwnerPaths()
  return mutationSuccess(data)
}

export async function deleteOwner(
  id: string
): Promise<MutationResult> {
  await requireStaff()

  const parsed = deleteOwnerSchema.safeParse({ id })

  if (!parsed.success) {
    return mutationError(
      parsed.error.issues[0]?.message ?? "Invalid owner"
    )
  }

  const supabase = await createClient()

  // Check for deposits before attempting to delete the owner
  const { count: depositCount, error: depositError } = await supabase
    .from("deposits")
    .select("id", {
      count: "exact",
      head: true,
    })
    .eq("owner_id", parsed.data.id)

  if (depositError) {
    return mutationError(
      getSupabaseErrorMessage(
        depositError,
        "Failed to check owner records"
      )
    )
  }

  if ((depositCount ?? 0) > 0) {
    return mutationError(
      `This owner cannot be deleted because they have ${depositCount} deposit ${
        depositCount === 1 ? "record" : "records"
      }. Delete or resolve ${
        depositCount === 1 ? "this deposit" : "these deposits"
      } first.`
    )
  }

  const { data, error } = await supabase
    .from("owners")
    .delete()
    .eq("id", parsed.data.id)
    .select("id")

  if (error) {
    return mutationError(
      getSupabaseErrorMessage(
        error,
        "Failed to delete owner"
      )
    )
  }

  if (!data || data.length === 0) {
    return mutationError(
      "Owner could not be deleted. It may not exist or you may not have permission to delete it."
    )
  }

  revalidateOwnerPaths()

  return mutationSuccess(undefined)
}