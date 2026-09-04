export type OwnerListFilters = {
  search?: string
}

export function parseOwnerListFilters(
  params: Record<string, string | string[] | undefined>
): OwnerListFilters {
  const search =
    typeof params.q === "string"
      ? params.q.trim()
      : undefined

  return {
    search: search || undefined,
  }
}