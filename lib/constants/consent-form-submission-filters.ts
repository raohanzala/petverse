export type ConsentFormSubmissionListFilters = {
  search?: string
}

export function parseConsentFormSubmissionListFilters(
  params: Record<string, string | string[] | undefined>
): ConsentFormSubmissionListFilters {
  const search =
    typeof params.q === "string"
      ? params.q.trim()
      : undefined

  return {
    search: search || undefined,
  }
}