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
import type { CampaignContactRow } from "@/lib/supabase/types"
import {
  createCampaignContactSchema,
  deleteCampaignContactSchema,
  updateCampaignContactSchema,
  type CreateCampaignContactInput,
  type UpdateCampaignContactInput,
} from "@/lib/validations/campaign-contacts"

const REVALIDATE_PATHS = [
  "/admin/communications/campaign-contacts",
  "/admin/communications/outbound-campaigns",
] as const

function revalidateCampaignContactPaths() {
  for (const path of REVALIDATE_PATHS) {
    revalidatePath(path)
  }
}

export async function createCampaignContact(
  input: CreateCampaignContactInput
): Promise<MutationResult<CampaignContactRow>> {
  await requireStaff()

  const parsed =
    createCampaignContactSchema.safeParse(input)

  if (!parsed.success) {
    return mutationError(
      parsed.error.issues[0]?.message ?? "Invalid input"
    )
  }

  const supabase = await createClient()

  const { data, error } = await supabase
    .from("campaign_contacts")
    .insert({
      campaign_id: parsed.data.campaign_id,
      owner_id: parsed.data.owner_id,
      status: parsed.data.status,
      sent_at: parsed.data.sent_at,
    })
    .select()
    .single()

  if (error) {
    return mutationError(
      getSupabaseErrorMessage(
        error,
        "Failed to create campaign contact"
      )
    )
  }

  revalidateCampaignContactPaths()
  return mutationSuccess(data)
}

export async function updateCampaignContact(
  input: UpdateCampaignContactInput
): Promise<MutationResult<CampaignContactRow>> {
  await requireStaff()

  const parsed =
    updateCampaignContactSchema.safeParse(input)

  if (!parsed.success) {
    return mutationError(
      parsed.error.issues[0]?.message ?? "Invalid input"
    )
  }

  const { id, ...updates } = parsed.data

  const payload: Record<string, unknown> = {}

  if (updates.campaign_id !== undefined) {
    payload.campaign_id = updates.campaign_id
  }

  if (updates.owner_id !== undefined) {
    payload.owner_id = updates.owner_id
  }

  if (updates.status !== undefined) {
    payload.status = updates.status
  }

  if (updates.sent_at !== undefined) {
    payload.sent_at = updates.sent_at
  }

  if (Object.keys(payload).length === 0) {
    return mutationError("No changes to save")
  }

  const supabase = await createClient()

  const { data, error } = await supabase
    .from("campaign_contacts")
    .update(payload)
    .eq("id", id)
    .select()
    .single()

  if (error) {
    return mutationError(
      getSupabaseErrorMessage(
        error,
        "Failed to update campaign contact"
      )
    )
  }

  revalidateCampaignContactPaths()
  return mutationSuccess(data)
}

export async function deleteCampaignContact(
  id: string
): Promise<MutationResult> {
  await requireStaff()

  const parsed =
    deleteCampaignContactSchema.safeParse({ id })

  if (!parsed.success) {
    return mutationError(
      parsed.error.issues[0]?.message ??
        "Invalid campaign contact"
    )
  }

  const supabase = await createClient()

  const { error } = await supabase
    .from("campaign_contacts")
    .delete()
    .eq("id", parsed.data.id)

  if (error) {
    return mutationError(
      getSupabaseErrorMessage(
        error,
        "Failed to delete campaign contact"
      )
    )
  }

  revalidateCampaignContactPaths()
  return mutationSuccess(undefined)
}