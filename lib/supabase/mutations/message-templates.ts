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
import type { MessageTemplateRow } from "@/lib/supabase/types"
import {
  createMessageTemplateSchema,
  deleteMessageTemplateSchema,
  updateMessageTemplateSchema,
  type CreateMessageTemplateInput,
  type UpdateMessageTemplateInput,
} from "@/lib/validations/message-templates"

const REVALIDATE_PATHS = [
  "/admin/communications/templates",
  "/admin/communications/inbox",
] as const

function revalidateMessageTemplatePaths() {
  for (const path of REVALIDATE_PATHS) {
    revalidatePath(path)
  }
}

function normalizeChannel(value: string) {
  return value.trim().toLowerCase()
}

function normalizeBody(value: string) {
  return value.trim()
}

export async function createMessageTemplate(
  input: CreateMessageTemplateInput
): Promise<MutationResult<MessageTemplateRow>> {
  await requireStaff()

  const parsed = createMessageTemplateSchema.safeParse({
    ...input,
    channel: normalizeChannel(input.channel),
    body: normalizeBody(input.body),
  })

  if (!parsed.success) {
    return mutationError(
      parsed.error.issues[0]?.message ?? "Invalid input"
    )
  }

  const supabase = await createClient()

  const { data, error } = await supabase
    .from("message_templates")
    .insert({
      name: parsed.data.name.trim(),
      channel: parsed.data.channel,
      body: parsed.data.body,
      is_active: parsed.data.is_active,
    })
    .select()
    .single()

  if (error) {
    return mutationError(
      getSupabaseErrorMessage(
        error,
        "Failed to create message template"
      )
    )
  }

  revalidateMessageTemplatePaths()

  return mutationSuccess(data)
}

export async function updateMessageTemplate(
  input: UpdateMessageTemplateInput
): Promise<MutationResult<MessageTemplateRow>> {
  await requireStaff()

  const parsed = updateMessageTemplateSchema.safeParse({
    ...input,
    channel:
      input.channel !== undefined
        ? normalizeChannel(input.channel)
        : undefined,
    body:
      input.body !== undefined
        ? normalizeBody(input.body)
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

  if (updates.channel !== undefined) {
    payload.channel = updates.channel
  }

  if (updates.body !== undefined) {
    payload.body = updates.body
  }

  if (updates.is_active !== undefined) {
    payload.is_active = updates.is_active
  }

  if (Object.keys(payload).length === 0) {
    return mutationError("No changes to save")
  }

  const supabase = await createClient()

  const { data, error } = await supabase
    .from("message_templates")
    .update(payload)
    .eq("id", id)
    .select()
    .single()

  if (error) {
    return mutationError(
      getSupabaseErrorMessage(
        error,
        "Failed to update message template"
      )
    )
  }

  revalidateMessageTemplatePaths()

  return mutationSuccess(data)
}

export async function deleteMessageTemplate(
  id: string
): Promise<MutationResult> {
  await requireStaff()

  const parsed =
    deleteMessageTemplateSchema.safeParse({ id })

  if (!parsed.success) {
    return mutationError(
      parsed.error.issues[0]?.message ??
        "Invalid message template"
    )
  }

  const supabase = await createClient()

  const { error } = await supabase
    .from("message_templates")
    .delete()
    .eq("id", parsed.data.id)

  if (error) {
    return mutationError(
      getSupabaseErrorMessage(
        error,
        "Failed to delete message template"
      )
    )
  }

  revalidateMessageTemplatePaths()

  return mutationSuccess(undefined)
}