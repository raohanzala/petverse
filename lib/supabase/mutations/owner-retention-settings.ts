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
import type {
  OwnerRetentionSettingsRow,
} from "@/lib/supabase/types"
import {
  createOwnerRetentionSettingsSchema,
  deleteOwnerRetentionSettingsSchema,
  updateOwnerRetentionSettingsSchema,
  type CreateOwnerRetentionSettingsInput,
  type UpdateOwnerRetentionSettingsInput,
} from "@/lib/validations/owner-retention-settings"

const REVALIDATE_PATHS = [
  "/admin/crm/owner-retention-settings",
] as const

function revalidateRetentionPaths() {
  for (const path of REVALIDATE_PATHS) {
    revalidatePath(path)
  }
}

export async function createOwnerRetentionSettings(
  input: CreateOwnerRetentionSettingsInput
): Promise<
  MutationResult<OwnerRetentionSettingsRow>
> {
  await requireStaff()

  const parsed =
    createOwnerRetentionSettingsSchema.safeParse(
      input
    )

  if (!parsed.success) {
    return mutationError(
      parsed.error.issues[0]?.message ??
        "Invalid input"
    )
  }

  const supabase = await createClient()

  const {
    data,
    error,
  } = await supabase
    .from("owner_retention_settings")
    .insert({
      owner_id: parsed.data.owner_id,
      lapsed_after_days:
        parsed.data.lapsed_after_days,
      reengagement_queued_at:
        parsed.data.reengagement_queued_at ??
        null,
      opt_out: parsed.data.opt_out,
    })
    .select()
    .single()

  if (error) {
    return mutationError(
      getSupabaseErrorMessage(
        error,
        "Failed to create retention settings"
      )
    )
  }

  revalidateRetentionPaths()

  return mutationSuccess(data)
}

export async function updateOwnerRetentionSettings(
  input: UpdateOwnerRetentionSettingsInput
): Promise<
  MutationResult<OwnerRetentionSettingsRow>
> {
  await requireStaff()

  const parsed =
    updateOwnerRetentionSettingsSchema.safeParse(
      input
    )

  if (!parsed.success) {
    return mutationError(
      parsed.error.issues[0]?.message ??
        "Invalid input"
    )
  }

  const {
    id,
    ...updates
  } = parsed.data

  const payload: Record<
    string,
    unknown
  > = {}

  if (
    updates.owner_id !== undefined
  ) {
    payload.owner_id =
      updates.owner_id
  }

  if (
    updates.lapsed_after_days !==
    undefined
  ) {
    payload.lapsed_after_days =
      updates.lapsed_after_days
  }

  if (
    updates.reengagement_queued_at !==
    undefined
  ) {
    payload.reengagement_queued_at =
      updates.reengagement_queued_at
  }

  if (
    updates.opt_out !== undefined
  ) {
    payload.opt_out =
      updates.opt_out
  }

  if (
    Object.keys(payload).length === 0
  ) {
    return mutationError(
      "No changes to save"
    )
  }

  const supabase = await createClient()

  const {
    data,
    error,
  } = await supabase
    .from("owner_retention_settings")
    .update(payload)
    .eq("id", id)
    .select()
    .single()

  if (error) {
    return mutationError(
      getSupabaseErrorMessage(
        error,
        "Failed to update retention settings"
      )
    )
  }

  revalidateRetentionPaths()

  return mutationSuccess(data)
}

export async function deleteOwnerRetentionSettings(
  id: string
): Promise<MutationResult> {
  await requireStaff()

  const parsed =
    deleteOwnerRetentionSettingsSchema.safeParse(
      { id }
    )

  if (!parsed.success) {
    return mutationError(
      parsed.error.issues[0]?.message ??
        "Invalid retention settings"
    )
  }

  const supabase = await createClient()

  const { error } =
    await supabase
      .from("owner_retention_settings")
      .delete()
      .eq("id", parsed.data.id)

  if (error) {
    return mutationError(
      getSupabaseErrorMessage(
        error,
        "Failed to delete retention settings"
      )
    )
  }

  revalidateRetentionPaths()

  return mutationSuccess(undefined)
}