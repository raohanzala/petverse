export type PetVaccinationListFilters = {
  search?: string
}

export function parsePetVaccinationListFilters(
  params: Record<string, string | string[] | undefined>
): PetVaccinationListFilters {
  const search =
    typeof params.q === "string"
      ? params.q.trim()
      : undefined

  return {
    search: search || undefined,
  }
}