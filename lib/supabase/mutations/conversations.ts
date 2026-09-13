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
import type { ConversationRow } from "@/lib/supabase/types"
import {
  createConversationSchema,
  deleteConversationSchema,
  updateConversationSchema,
  type CreateConversationInput,
  type UpdateConversationInput,
} from "@/lib/validations/conversations"

const REVALIDATE_PATHS = [
  "/admin/communications/conversations",
] as const

function revalidateConversationPaths() {
  for (const path of REVALIDATE_PATHS) {
    revalidatePath(path)
  }
}

function normalizeText(value: string | null | undefined) {
  const trimmed = value?.trim()
  return trimmed ? trimmed : null
}

export async function createConversation(
  input: CreateConversationInput
): Promise<MutationResult<ConversationRow>> {
  await requireStaff()

  const parsed = createConversationSchema.safeParse({
    ...input,
    external_id: normalizeText(input.external_id),
    closed_lost_reason: normalizeText(input.closed_lost_reason),
  })

  if (!parsed.success) {
    return mutationError(
      parsed.error.issues[0]?.message ?? "Invalid input"
    )
  }

  const supabase = await createClient()

  const { data, error } = await supabase
    .from("conversations")
    .insert({
      owner_id: parsed.data.owner_id,
      channel: parsed.data.channel.trim(),
      external_id: parsed.data.external_id,
      stage: parsed.data.stage,
      closed_lost_reason: parsed.data.closed_lost_reason,
      quoted_amount: parsed.data.quoted_amount,
      lost_revenue: parsed.data.lost_revenue,
      assigned_employee_id: parsed.data.assigned_employee_id,
      first_staff_response_at: parsed.data.first_staff_response_at,
      ai_handled: parsed.data.ai_handled,
    })
    .select()
    .single()

  if (error) {
    return mutationError(
      getSupabaseErrorMessage(
        error,
        "Failed to create conversation"
      )
    )
  }

  revalidateConversationPaths()
  return mutationSuccess(data)
}

export async function updateConversation(
  input: UpdateConversationInput
): Promise<MutationResult<ConversationRow>> {
  await requireStaff()

  const parsed = updateConversationSchema.safeParse({
    ...input,
    external_id:
      input.external_id !== undefined
        ? normalizeText(input.external_id)
        : undefined,
    closed_lost_reason:
      input.closed_lost_reason !== undefined
        ? normalizeText(input.closed_lost_reason)
        : undefined,
  })

  if (!parsed.success) {
    return mutationError(
      parsed.error.issues[0]?.message ?? "Invalid input"
    )
  }

  const { id, ...updates } = parsed.data

  const payload: Record<string, unknown> = {}

  if (updates.owner_id !== undefined) {
    payload.owner_id = updates.owner_id
  }

  if (updates.channel !== undefined) {
    payload.channel = updates.channel.trim()
  }

  if (updates.external_id !== undefined) {
    payload.external_id = updates.external_id
  }

  if (updates.stage !== undefined) {
    payload.stage = updates.stage
  }

  if (updates.closed_lost_reason !== undefined) {
    payload.closed_lost_reason = updates.closed_lost_reason
  }

  if (updates.quoted_amount !== undefined) {
    payload.quoted_amount = updates.quoted_amount
  }

  if (updates.lost_revenue !== undefined) {
    payload.lost_revenue = updates.lost_revenue
  }

  if (updates.assigned_employee_id !== undefined) {
    payload.assigned_employee_id =
      updates.assigned_employee_id
  }

  if (updates.first_staff_response_at !== undefined) {
    payload.first_staff_response_at =
      updates.first_staff_response_at
  }

  if (updates.ai_handled !== undefined) {
    payload.ai_handled = updates.ai_handled
  }

  if (Object.keys(payload).length === 0) {
    return mutationError("No changes to save")
  }

  const supabase = await createClient()

  const { data, error } = await supabase
    .from("conversations")
    .update(payload)
    .eq("id", id)
    .select()
    .single()

  if (error) {
    return mutationError(
      getSupabaseErrorMessage(
        error,
        "Failed to update conversation"
      )
    )
  }

  revalidateConversationPaths()
  return mutationSuccess(data)
}

export async function deleteConversation(
  id: string
): Promise<MutationResult> {
  await requireStaff()

  const parsed = deleteConversationSchema.safeParse({ id })

  if (!parsed.success) {
    return mutationError(
      parsed.error.issues[0]?.message ?? "Invalid conversation"
    )
  }

  const supabase = await createClient()

  const { error } = await supabase
    .from("conversations")
    .delete()
    .eq("id", parsed.data.id)

  if (error) {
    return mutationError(
      getSupabaseErrorMessage(
        error,
        "Failed to delete conversation"
      )
    )
  }

  revalidateConversationPaths()
  return mutationSuccess(undefined)
}
