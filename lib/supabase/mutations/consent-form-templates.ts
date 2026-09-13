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
import type { ConsentFormTemplateRow } from "@/lib/supabase/types"
import {
  createConsentFormTemplateSchema,
  deleteConsentFormTemplateSchema,
  updateConsentFormTemplateSchema,
  type CreateConsentFormTemplateInput,
  type UpdateConsentFormTemplateInput,
} from "@/lib/validations/consent-form-templates"

const REVALIDATE_PATHS = [
  "/admin/compliance/consent-form-templates",
] as const

function revalidateConsentFormTemplatePaths() {
  for (const path of REVALIDATE_PATHS) {
    revalidatePath(path)
  }
}

function normalizeBodyHtml(value: string) {
  return value.trim()
}

export async function createConsentFormTemplate(
  input: CreateConsentFormTemplateInput
): Promise<MutationResult<ConsentFormTemplateRow>> {
  await requireStaff()

  const parsed =
    createConsentFormTemplateSchema.safeParse({
      ...input,
      name: input.name.trim(),
      body_html: normalizeBodyHtml(
        input.body_html
      ),
    })

  if (!parsed.success) {
    return mutationError(
      parsed.error.issues[0]?.message ??
        "Invalid input"
    )
  }

  const supabase = await createClient()

  const { data, error } = await supabase
    .from("consent_form_templates")
    .insert({
      name: parsed.data.name,
      body_html: parsed.data.body_html,
      version: parsed.data.version,
      is_active: parsed.data.is_active,
    })
    .select()
    .single()

  if (error) {
    return mutationError(
      getSupabaseErrorMessage(
        error,
        "Failed to create consent form template"
      )
    )
  }

  revalidateConsentFormTemplatePaths()
  return mutationSuccess(data)
}

export async function updateConsentFormTemplate(
  input: UpdateConsentFormTemplateInput
): Promise<MutationResult<ConsentFormTemplateRow>> {
  await requireStaff()

  const parsed =
    updateConsentFormTemplateSchema.safeParse({
      ...input,
      name:
        input.name !== undefined
          ? input.name.trim()
          : undefined,
      body_html:
        input.body_html !== undefined
          ? normalizeBodyHtml(
              input.body_html
            )
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

  if (updates.name !== undefined) {
    payload.name = updates.name
  }

  if (updates.body_html !== undefined) {
    payload.body_html = updates.body_html
  }

  if (updates.version !== undefined) {
    payload.version = updates.version
  }

  if (updates.is_active !== undefined) {
    payload.is_active = updates.is_active
  }

  if (Object.keys(payload).length === 0) {
    return mutationError("No changes to save")
  }

  const supabase = await createClient()

  const { data, error } = await supabase
    .from("consent_form_templates")
    .update(payload)
    .eq("id", id)
    .select()
    .single()

  if (error) {
    return mutationError(
      getSupabaseErrorMessage(
        error,
        "Failed to update consent form template"
      )
    )
  }

  revalidateConsentFormTemplatePaths()
  return mutationSuccess(data)
}

export async function deleteConsentFormTemplate(
  id: string
): Promise<MutationResult> {
  await requireStaff()

  const parsed =
    deleteConsentFormTemplateSchema.safeParse({
      id,
    })

  if (!parsed.success) {
    return mutationError(
      parsed.error.issues[0]?.message ??
        "Invalid consent form template"
    )
  }

  const supabase = await createClient()

  const { error } = await supabase
    .from("consent_form_templates")
    .delete()
    .eq("id", parsed.data.id)

  if (error) {
    return mutationError(
      getSupabaseErrorMessage(
        error,
        "Failed to delete consent form template"
      )
    )
  }

  revalidateConsentFormTemplatePaths()
  return mutationSuccess(undefined)
}