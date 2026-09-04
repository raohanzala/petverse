export const PET_STATUS_FILTERS = [
  "all",
  "active",
  "inactive",
] as const

export type PetStatusFilter =
  (typeof PET_STATUS_FILTERS)[number]

export type PetListFilters = {
  search?: string
  status?: PetStatusFilter
}

export function parsePetListFilters(
  params: Record<string, string | string[] | undefined>
): PetListFilters {
  const rawStatus =
    typeof params.status === "string"
      ? params.status
      : "all"

  const status = PET_STATUS_FILTERS.includes(
    rawStatus as PetStatusFilter
  )
    ? (rawStatus as PetStatusFilter)
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