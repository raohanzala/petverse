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
import type { OutboundCampaignRow } from "@/lib/supabase/types"
import {
  createOutboundCampaignSchema,
  deleteOutboundCampaignSchema,
  updateOutboundCampaignSchema,
  type CreateOutboundCampaignInput,
  type UpdateOutboundCampaignInput,
} from "@/lib/validations/outbound-campaigns"

const REVALIDATE_PATHS = [
  "/admin/communications/outbound-campaigns",
] as const

function revalidateOutboundCampaignPaths() {
  for (const path of REVALIDATE_PATHS) {
    revalidatePath(path)
  }
}

function normalizeChannel(value: string) {
  return value.trim().toLowerCase()
}

export async function createOutboundCampaign(
  input: CreateOutboundCampaignInput
): Promise<MutationResult<OutboundCampaignRow>> {
  await requireStaff()

  const parsed = createOutboundCampaignSchema.safeParse({
    ...input,
    name: input.name.trim(),
    channel: normalizeChannel(input.channel),
  })

  if (!parsed.success) {
    return mutationError(
      parsed.error.issues[0]?.message ?? "Invalid input"
    )
  }

  const supabase = await createClient()

  const { data, error } = await supabase
    .from("outbound_campaigns")
    .insert({
      name: parsed.data.name,
      channel: parsed.data.channel,
      status: parsed.data.status,
      scheduled_at: parsed.data.scheduled_at,
    })
    .select()
    .single()

  if (error) {
    return mutationError(
      getSupabaseErrorMessage(
        error,
        "Failed to create outbound campaign"
      )
    )
  }

  revalidateOutboundCampaignPaths()
  return mutationSuccess(data)
}

export async function updateOutboundCampaign(
  input: UpdateOutboundCampaignInput
): Promise<MutationResult<OutboundCampaignRow>> {
  await requireStaff()

  const parsed = updateOutboundCampaignSchema.safeParse({
    ...input,
    name:
      input.name !== undefined
        ? input.name.trim()
        : undefined,
    channel:
      input.channel !== undefined
        ? normalizeChannel(input.channel)
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
    payload.name = updates.name
  }

  if (updates.channel !== undefined) {
    payload.channel = updates.channel
  }

  if (updates.status !== undefined) {
    payload.status = updates.status
  }

  if (updates.scheduled_at !== undefined) {
    payload.scheduled_at = updates.scheduled_at
  }

  if (Object.keys(payload).length === 0) {
    return mutationError("No changes to save")
  }

  const supabase = await createClient()

  const { data, error } = await supabase
    .from("outbound_campaigns")
    .update(payload)
    .eq("id", id)
    .select()
    .single()

  if (error) {
    return mutationError(
      getSupabaseErrorMessage(
        error,
        "Failed to update outbound campaign"
      )
    )
  }

  revalidateOutboundCampaignPaths()
  return mutationSuccess(data)
}

export async function deleteOutboundCampaign(
  id: string
): Promise<MutationResult> {
  await requireStaff()

  const parsed =
    deleteOutboundCampaignSchema.safeParse({ id })

  if (!parsed.success) {
    return mutationError(
      parsed.error.issues[0]?.message ??
        "Invalid outbound campaign"
    )
  }

  const supabase = await createClient()

  const { error } = await supabase
    .from("outbound_campaigns")
    .delete()
    .eq("id", parsed.data.id)

  if (error) {
    return mutationError(
      getSupabaseErrorMessage(
        error,
        "Failed to delete outbound campaign"
      )
    )
  }

  revalidateOutboundCampaignPaths()
  return mutationSuccess(undefined)
}