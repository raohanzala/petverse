export const CONSENT_FORM_TEMPLATE_STATUS_FILTERS = [
  "all",
  "active",
  "inactive",
] as const

export type ConsentFormTemplateStatusFilter =
  (typeof CONSENT_FORM_TEMPLATE_STATUS_FILTERS)[number]

export type ConsentFormTemplateListFilters = {
  search?: string
  status?: ConsentFormTemplateStatusFilter
}

export function parseConsentFormTemplateListFilters(
  params: Record<string, string | string[] | undefined>
): ConsentFormTemplateListFilters {
  const rawStatus =
    typeof params.status === "string"
      ? params.status
      : "all"

  const status =
    CONSENT_FORM_TEMPLATE_STATUS_FILTERS.includes(
      rawStatus as ConsentFormTemplateStatusFilter
    )
      ? (rawStatus as ConsentFormTemplateStatusFilter)
      : "all"

  const search =
    typeof params.q === "string"
      ? params.q.trim()
      : undefined

  return {
    search: search || undefined,
    status,
  }
}