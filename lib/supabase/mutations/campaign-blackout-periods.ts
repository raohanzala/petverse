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
import type { CampaignBlackoutPeriodRow } from "@/lib/supabase/types"
import {
  createCampaignBlackoutPeriodSchema,
  deleteCampaignBlackoutPeriodSchema,
  updateCampaignBlackoutPeriodSchema,
  type CreateCampaignBlackoutPeriodInput,
  type UpdateCampaignBlackoutPeriodInput,
} from "@/lib/validations/campaign-blackout-periods"

const REVALIDATE_PATHS = [
  "/admin/communications/campaign-blackout-periods",
  "/admin/communications/outbound-campaigns",
] as const

function revalidateCampaignBlackoutPeriodPaths() {
  for (const path of REVALIDATE_PATHS) {
    revalidatePath(path)
  }
}

export async function createCampaignBlackoutPeriod(
  input: CreateCampaignBlackoutPeriodInput
): Promise<MutationResult<CampaignBlackoutPeriodRow>> {
  await requireStaff()

  const parsed =
    createCampaignBlackoutPeriodSchema.safeParse(input)

  if (!parsed.success) {
    return mutationError(
      parsed.error.issues[0]?.message ?? "Invalid input"
    )
  }

  const supabase = await createClient()

  const { data, error } = await supabase
    .from("campaign_blackout_periods")
    .insert({
      campaign_id: parsed.data.campaign_id,
      starts_at: parsed.data.starts_at,
      ends_at: parsed.data.ends_at,
    })
    .select()
    .single()

  if (error) {
    return mutationError(
      getSupabaseErrorMessage(
        error,
        "Failed to create campaign blackout period"
      )
    )
  }

  revalidateCampaignBlackoutPeriodPaths()
  return mutationSuccess(data)
}

export async function updateCampaignBlackoutPeriod(
  input: UpdateCampaignBlackoutPeriodInput
): Promise<MutationResult<CampaignBlackoutPeriodRow>> {
  await requireStaff()

  const parsed =
    updateCampaignBlackoutPeriodSchema.safeParse(input)

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

  if (updates.starts_at !== undefined) {
    payload.starts_at = updates.starts_at
  }

  if (updates.ends_at !== undefined) {
    payload.ends_at = updates.ends_at
  }

  if (Object.keys(payload).length === 0) {
    return mutationError("No changes to save")
  }

  const supabase = await createClient()

  const { data, error } = await supabase
    .from("campaign_blackout_periods")
    .update(payload)
    .eq("id", id)
    .select()
    .single()

  if (error) {
    return mutationError(
      getSupabaseErrorMessage(
        error,
        "Failed to update campaign blackout period"
      )
    )
  }

  revalidateCampaignBlackoutPeriodPaths()
  return mutationSuccess(data)
}

export async function deleteCampaignBlackoutPeriod(
  id: string
): Promise<MutationResult> {
  await requireStaff()

  const parsed =
    deleteCampaignBlackoutPeriodSchema.safeParse({ id })

  if (!parsed.success) {
    return mutationError(
      parsed.error.issues[0]?.message ??
        "Invalid campaign blackout period"
    )
  }

  const supabase = await createClient()

  const { error } = await supabase
    .from("campaign_blackout_periods")
    .delete()
    .eq("id", parsed.data.id)

  if (error) {
    return mutationError(
      getSupabaseErrorMessage(
        error,
        "Failed to delete campaign blackout period"
      )
    )
  }

  revalidateCampaignBlackoutPeriodPaths()
  return mutationSuccess(undefined)
}