import { createClient } from "@/lib/supabase/server"
import type { ConsentFormTemplateListFilters } from "@/lib/constants/consent-form-template-filters"
import type { ConsentFormTemplateRow } from "@/lib/supabase/types"
import { getSupabaseErrorMessage } from "@/lib/supabase/errors"

const CONSENT_FORM_TEMPLATE_COLUMNS =
  "id, name, body_html, version, is_active, created_at, updated_at" as const

function escapeIlikePattern(value: string) {
  return value.replace(/[%_\\]/g, "\\$&")
}

/** Admin list — supports server-side search and status filter */
export async function listConsentFormTemplates(
  filters: ConsentFormTemplateListFilters = {}
): Promise<ConsentFormTemplateRow[]> {
  const supabase = await createClient()
  const { search, status = "all" } = filters

  let query = supabase
    .from("consent_form_templates")
    .select(CONSENT_FORM_TEMPLATE_COLUMNS)

  if (status === "active") {
    query = query.eq("is_active", true)
  } else if (status === "inactive") {
    query = query.eq("is_active", false)
  }

  if (search) {
    const pattern = `%${escapeIlikePattern(search)}%`

    query = query.or(
      `name.ilike.${pattern},body_html.ilike.${pattern}`
    )
  }

  const { data, error } = await query
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

/** Active templates — used where templates are selectable */
export async function listActiveConsentFormTemplates(): Promise<
  ConsentFormTemplateRow[]
> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("consent_form_templates")
    .select(CONSENT_FORM_TEMPLATE_COLUMNS)
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

export async function getConsentFormTemplateById(
  id: string
): Promise<ConsentFormTemplateRow | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("consent_form_templates")
    .select(CONSENT_FORM_TEMPLATE_COLUMNS)
    .eq("id", id)
    .maybeSingle()

  if (error) {
    throw new Error(
      getSupabaseErrorMessage(
        error,
        "Failed to load consent form template"
      )
    )
  }

  return data
}