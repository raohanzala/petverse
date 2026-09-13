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
import type { ServiceConsentFormRow } from "@/lib/supabase/types"
import {
  createServiceConsentFormSchema,
  deleteServiceConsentFormSchema,
  type CreateServiceConsentFormInput,
} from "@/lib/validations/service-consent-forms"

const REVALIDATE_PATHS = [
  "/admin/compliance/service-consent-forms",
  "/admin/catalog/services",
] as const

function revalidateServiceConsentFormPaths() {
  for (const path of REVALIDATE_PATHS) {
    revalidatePath(path)
  }
}

export async function createServiceConsentForm(
  input: CreateServiceConsentFormInput
): Promise<MutationResult<ServiceConsentFormRow>> {
  await requireStaff()

  const parsed =
    createServiceConsentFormSchema.safeParse(input)

  if (!parsed.success) {
    return mutationError(
      parsed.error.issues[0]?.message ??
        "Invalid input"
    )
  }

  const supabase = await createClient()

  const { data, error } = await supabase
    .from("service_consent_forms")
    .insert({
      service_id: parsed.data.service_id,
      template_id: parsed.data.template_id,
    })
    .select()
    .single()

  if (error) {
    return mutationError(
      getSupabaseErrorMessage(
        error,
        "Failed to assign consent form template"
      )
    )
  }

  revalidateServiceConsentFormPaths()

  return mutationSuccess(data)
}

export async function deleteServiceConsentForm(
  input: CreateServiceConsentFormInput
): Promise<MutationResult> {
  await requireStaff()

  const parsed =
    deleteServiceConsentFormSchema.safeParse(input)

  if (!parsed.success) {
    return mutationError(
      parsed.error.issues[0]?.message ??
        "Invalid service consent form"
    )
  }

  const supabase = await createClient()

  const { error } = await supabase
    .from("service_consent_forms")
    .delete()
    .eq(
      "service_id",
      parsed.data.service_id
    )
    .eq(
      "template_id",
      parsed.data.template_id
    )

  if (error) {
    return mutationError(
      getSupabaseErrorMessage(
        error,
        "Failed to remove consent form template"
      )
    )
  }

  revalidateServiceConsentFormPaths()

  return mutationSuccess(undefined)
}