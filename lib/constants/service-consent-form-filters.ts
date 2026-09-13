export type ServiceConsentFormListFilters = {
  search?: string
}

export function parseServiceConsentFormListFilters(
  params: Record<string, string | string[] | undefined>
): ServiceConsentFormListFilters {
  const search =
    typeof params.q === "string"
      ? params.q.trim()
      : undefined

  return {
    search: search || undefined,
  }
}