import { createClient } from "@/lib/supabase/server"
import type {
  ConsentFormSubmissionListFilters,
} from "@/lib/constants/consent-form-submission-filters"
import type {
  ConsentFormSubmissionAppointmentOption,
  ConsentFormSubmissionOwnerOption,
  ConsentFormSubmissionPetOption,
  ConsentFormSubmissionTemplateOption,
  ConsentFormSubmissionWithRelations,
} from "@/lib/supabase/types"
import { getSupabaseErrorMessage } from "@/lib/supabase/errors"

const CONSENT_FORM_SUBMISSION_COLUMNS = `
  id,
  template_id,
  appointment_id,
  owner_id,
  pet_id,
  signed_at,
  signature_data,

  template:consent_form_templates (
    id,
    name,
    version
  ),

  appointment:appointments (
    id,
    starts_at
    
  ),

  owner:owners (
    id,
    name,
    phone
  ),

  pet:pets (
    id,
    name,
    species
  )
` as const

type ConsentFormSubmissionQueryRow = {
  id: string
  template_id: string
  appointment_id: string | null
  owner_id: string
  pet_id: string | null
  signed_at: string
  signature_data: Record<string, unknown> | null

  template: {
    id: string
    name: string
    version: number
  }[] | null

  appointment: {
    id: string
    starts_at: string
  }[] | null

  owner: {
    id: string
    name: string
    phone: string
  }[] | null

  pet: {
    id: string
    name: string
    species: string
  }[] | null
}

function normalizeConsentFormSubmission(
  row: ConsentFormSubmissionQueryRow
): ConsentFormSubmissionWithRelations {
  return {
    id: row.id,
    template_id: row.template_id,
    appointment_id: row.appointment_id,
    owner_id: row.owner_id,
    pet_id: row.pet_id,
    signed_at: row.signed_at,
    signature_data: row.signature_data,

    template: row.template?.[0] ?? null,
    appointment: row.appointment?.[0] ?? null,
    owner: row.owner?.[0] ?? null,
    pet: row.pet?.[0] ?? null,
  }
}

function escapeIlikePattern(value: string) {
  return value.replace(/[%_\\]/g, "\\$&")
}

export async function listConsentFormSubmissions(
  filters: ConsentFormSubmissionListFilters = {}
): Promise<ConsentFormSubmissionWithRelations[]> {
  const supabase = await createClient()

  const { search } = filters

  let query = supabase
    .from("consent_form_submissions")
    .select(CONSENT_FORM_SUBMISSION_COLUMNS)

  if (search) {
    const pattern = `%${escapeIlikePattern(search)}%`

    query = query.or(
      `owner_id.eq.${search},pet_id.eq.${search},appointment_id.eq.${search}`
    )
  }

  const { data, error } = await query
    .order("signed_at", { ascending: false })

  if (error) {
    throw new Error(
      getSupabaseErrorMessage(
        error,
        "Failed to load consent form submissions"
      )
    )
  }

  return (data ?? []).map((row) =>
    normalizeConsentFormSubmission(
      row as ConsentFormSubmissionQueryRow
    )
  )
}

export async function getConsentFormSubmissionById(
  id: string
): Promise<ConsentFormSubmissionWithRelations | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("consent_form_submissions")
    .select(CONSENT_FORM_SUBMISSION_COLUMNS)
    .eq("id", id)
    .maybeSingle()

  if (error) {
    throw new Error(
      getSupabaseErrorMessage(
        error,
        "Failed to load consent form submission"
      )
    )
  }

  if (!data) {
    return null
  }

  return normalizeConsentFormSubmission(
    data as ConsentFormSubmissionQueryRow
  )
}

export async function listConsentFormSubmissionTemplates(): Promise<
  ConsentFormSubmissionTemplateOption[]
> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("consent_form_templates")
    .select("id, name, version")
    .eq("is_active", true)
    .order("name", { ascending: true })
    .order("version", { ascending: false })

  if (error) {
    throw new Error(
      getSupabaseErrorMessage(
        error,
        "Failed to load consent form templates"
      )
    )
  }

  return data ?? []
}

export async function listConsentFormSubmissionAppointments(): Promise<
  ConsentFormSubmissionAppointmentOption[]
> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("appointments")
    .select("id, starts_at, status,owner_id, pet_id")
    .order("starts_at", { ascending: false })

  if (error) {
    throw new Error(
      getSupabaseErrorMessage(
        error,
        "Failed to load appointments"
      )
    )
  }

  return data ?? []
}

export async function listConsentFormSubmissionOwners(): Promise<
  ConsentFormSubmissionOwnerOption[]
> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("owners")
    .select("id, name, phone")
    .order("name", { ascending: true })

  if (error) {
    throw new Error(
      getSupabaseErrorMessage(
        error,
        "Failed to load owners"
      )
    )
  }

  return data ?? []
}

export async function listConsentFormSubmissionPets(): Promise<
  ConsentFormSubmissionPetOption[]
> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("pets")
    .select("id, name, species, owner_id")
    .eq("is_active", true)
    .order("name", { ascending: true })

  if (error) {
    throw new Error(
      getSupabaseErrorMessage(
        error,
        "Failed to load pets"
      )
    )
  }

  return data ?? []
}