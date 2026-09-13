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
import type { ConsentFormSubmissionRow } from "@/lib/supabase/types"
import {
  createConsentFormSubmissionSchema,
  deleteConsentFormSubmissionSchema,
  updateConsentFormSubmissionSchema,
  type CreateConsentFormSubmissionInput,
  type UpdateConsentFormSubmissionInput,
} from "@/lib/validations/consent-form-submissions"

const REVALIDATE_PATHS = [
  "/admin/compliance/consent-form-submissions",
] as const

function revalidateConsentFormSubmissionPaths() {
  for (const path of REVALIDATE_PATHS) {
    revalidatePath(path)
  }
}

export async function createConsentFormSubmission(
  input: CreateConsentFormSubmissionInput
): Promise<MutationResult<ConsentFormSubmissionRow>> {
  await requireStaff()

  const parsed =
    createConsentFormSubmissionSchema.safeParse(
      input
    )

  if (!parsed.success) {
    return mutationError(
      parsed.error.issues[0]?.message ??
        "Invalid input"
    )
  }

  const supabase = await createClient()

  const { data, error } = await supabase
    .from("consent_form_submissions")
    .insert({
      template_id: parsed.data.template_id,
      appointment_id:
        parsed.data.appointment_id,
      owner_id: parsed.data.owner_id,
      pet_id: parsed.data.pet_id,
      signed_at: parsed.data.signed_at,
      signature_data:
        parsed.data.signature_data,
    })
    .select()
    .single()

  if (error) {
    return mutationError(
      getSupabaseErrorMessage(
        error,
        "Failed to create consent form submission"
      )
    )
  }

  revalidateConsentFormSubmissionPaths()

  return mutationSuccess(data)
}

export async function updateConsentFormSubmission(
  input: UpdateConsentFormSubmissionInput
): Promise<MutationResult<ConsentFormSubmissionRow>> {
  await requireStaff()

  const parsed =
    updateConsentFormSubmissionSchema.safeParse(
      input
    )

  if (!parsed.success) {
    return mutationError(
      parsed.error.issues[0]?.message ??
        "Invalid input"
    )
  }

  const { id, ...updates } = parsed.data

  const payload: Record<string, unknown> = {}

  if (updates.template_id !== undefined) {
    payload.template_id =
      updates.template_id
  }

  if (updates.appointment_id !== undefined) {
    payload.appointment_id =
      updates.appointment_id
  }

  if (updates.owner_id !== undefined) {
    payload.owner_id =
      updates.owner_id
  }

  if (updates.pet_id !== undefined) {
    payload.pet_id =
      updates.pet_id
  }

  if (updates.signed_at !== undefined) {
    payload.signed_at =
      updates.signed_at
  }

  if (updates.signature_data !== undefined) {
    payload.signature_data =
      updates.signature_data
  }

  if (Object.keys(payload).length === 0) {
    return mutationError("No changes to save")
  }

  const supabase = await createClient()

  const { data, error } = await supabase
    .from("consent_form_submissions")
    .update(payload)
    .eq("id", id)
    .select()
    .single()

  if (error) {
    return mutationError(
      getSupabaseErrorMessage(
        error,
        "Failed to update consent form submission"
      )
    )
  }

  revalidateConsentFormSubmissionPaths()

  return mutationSuccess(data)
}

export async function deleteConsentFormSubmission(
  id: string
): Promise<MutationResult> {
  await requireStaff()

  const parsed =
    deleteConsentFormSubmissionSchema.safeParse({
      id,
    })

  if (!parsed.success) {
    return mutationError(
      parsed.error.issues[0]?.message ??
        "Invalid consent form submission"
    )
  }

  const supabase = await createClient()

  const { error } = await supabase
    .from("consent_form_submissions")
    .delete()
    .eq("id", parsed.data.id)

  if (error) {
    return mutationError(
      getSupabaseErrorMessage(
        error,
        "Failed to delete consent form submission"
      )
    )
  }

  revalidateConsentFormSubmissionPaths()

  return mutationSuccess(undefined)
}