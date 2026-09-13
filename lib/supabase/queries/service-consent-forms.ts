import { createClient } from "@/lib/supabase/server"
import type {
  ServiceConsentFormServiceOption,
  ServiceConsentFormTemplateOption,
  ServiceConsentFormWithTemplate,
} from "@/lib/supabase/types"
import { getSupabaseErrorMessage } from "@/lib/supabase/errors"

const SERVICE_CONSENT_FORM_COLUMNS = `
  service_id,
  template_id,
  template:consent_form_templates (
    id,
    name,
    version,
    is_active
  )
` as const

type ServiceConsentFormQueryRow = {
  service_id: string
  template_id: string

  template: {
    id: string
    name: string
    version: number
    is_active: boolean
  }[] | null
}

function normalizeServiceConsentForm(
  row: ServiceConsentFormQueryRow
): ServiceConsentFormWithTemplate {
  return {
    service_id: row.service_id,
    template_id: row.template_id,
    template: row.template?.[0] ?? null,
  }
}

export async function listServiceConsentForms(
  serviceId: string
): Promise<ServiceConsentFormWithTemplate[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("service_consent_forms")
    .select(SERVICE_CONSENT_FORM_COLUMNS)
    .eq("service_id", serviceId)

  if (error) {
    throw new Error(
      getSupabaseErrorMessage(
        error,
        "Failed to load service consent forms"
      )
    )
  }

  return (data ?? []).map((row) =>
    normalizeServiceConsentForm(
      row as ServiceConsentFormQueryRow
    )
  )
}

export async function listServiceConsentFormServices(): Promise<
  ServiceConsentFormServiceOption[]
> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("services")
    .select("id, name")
    .order("name", { ascending: true })

  if (error) {
    throw new Error(
      getSupabaseErrorMessage(
        error,
        "Failed to load services"
      )
    )
  }

  return data ?? []
}

export async function listServiceConsentFormTemplates(): Promise<
  ServiceConsentFormTemplateOption[]
> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("consent_form_templates")
    .select(
      "id, name, version, is_active"
    )
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