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
import type { ConversationMessageRow } from "@/lib/supabase/types"
import {
  createConversationMessageSchema,
  deleteConversationMessageSchema,
  updateConversationMessageSchema,
  type CreateConversationMessageInput,
  type UpdateConversationMessageInput,
} from "@/lib/validations/conversation-messages"

const REVALIDATE_PATHS = [
  "/admin/communications/conversations",
] as const

function revalidateConversationMessagePaths() {
  for (const path of REVALIDATE_PATHS) {
    revalidatePath(path)
  }
}

function normalizeBody(value: string) {
  return value.trim()
}

function normalizeExternalId(
  value: string | null | undefined
) {
  const trimmed = value?.trim()
  return trimmed ? trimmed : null
}

export async function createConversationMessage(
  input: CreateConversationMessageInput
): Promise<MutationResult<ConversationMessageRow>> {
  await requireStaff()

  const parsed = createConversationMessageSchema.safeParse({
    ...input,
    body: normalizeBody(input.body),
    external_id: normalizeExternalId(input.external_id),
  })

  if (!parsed.success) {
    return mutationError(
      parsed.error.issues[0]?.message ?? "Invalid input"
    )
  }

  const supabase = await createClient()

  const { data, error } = await supabase
    .from("conversation_messages")
    .insert({
      conversation_id: parsed.data.conversation_id,
      direction: parsed.data.direction,
      body: parsed.data.body,
      sent_at: parsed.data.sent_at,
      external_id: parsed.data.external_id,
    })
    .select()
    .single()

  if (error) {
    return mutationError(
      getSupabaseErrorMessage(
        error,
        "Failed to create conversation message"
      )
    )
  }

  revalidateConversationMessagePaths()

  return mutationSuccess(data)
}

export async function updateConversationMessage(
  input: UpdateConversationMessageInput
): Promise<MutationResult<ConversationMessageRow>> {
  await requireStaff()

  const parsed = updateConversationMessageSchema.safeParse({
    ...input,
    body:
      input.body !== undefined
        ? normalizeBody(input.body)
        : undefined,
    external_id:
      input.external_id !== undefined
        ? normalizeExternalId(input.external_id)
        : undefined,
  })

  if (!parsed.success) {
    return mutationError(
      parsed.error.issues[0]?.message ?? "Invalid input"
    )
  }

  const { id, ...updates } = parsed.data

  const payload: Record<string, unknown> = {}

  if (updates.conversation_id !== undefined) {
    payload.conversation_id = updates.conversation_id
  }

  if (updates.direction !== undefined) {
    payload.direction = updates.direction
  }

  if (updates.body !== undefined) {
    payload.body = updates.body
  }

  if (updates.sent_at !== undefined) {
    payload.sent_at = updates.sent_at
  }

  if (updates.external_id !== undefined) {
    payload.external_id = updates.external_id
  }

  if (Object.keys(payload).length === 0) {
    return mutationError("No changes to save")
  }

  const supabase = await createClient()

  const { data, error } = await supabase
    .from("conversation_messages")
    .update(payload)
    .eq("id", id)
    .select()
    .single()

  if (error) {
    return mutationError(
      getSupabaseErrorMessage(
        error,
        "Failed to update conversation message"
      )
    )
  }

  revalidateConversationMessagePaths()

  return mutationSuccess(data)
}

export async function deleteConversationMessage(
  id: string
): Promise<MutationResult> {
  await requireStaff()

  const parsed = deleteConversationMessageSchema.safeParse({
    id,
  })

  if (!parsed.success) {
    return mutationError(
      parsed.error.issues[0]?.message ?? "Invalid message"
    )
  }

  const supabase = await createClient()

  const { error } = await supabase
    .from("conversation_messages")
    .delete()
    .eq("id", parsed.data.id)

  if (error) {
    return mutationError(
      getSupabaseErrorMessage(
        error,
        "Failed to delete conversation message"
      )
    )
  }

  revalidateConversationMessagePaths()

  return mutationSuccess(undefined)
}