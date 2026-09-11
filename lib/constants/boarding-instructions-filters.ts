export const BOARDING_INSTRUCTIONS_FILTERS = [
  "all",
] as const

export type BoardingInstructionsFilter =
  (typeof BOARDING_INSTRUCTIONS_FILTERS)[number]

export type BoardingInstructionsListFilters = {
  search?: string
}

export function parseBoardingInstructionsListFilters(
  params: Record<string, string | string[] | undefined>
): BoardingInstructionsListFilters {
  const search =
    typeof params.boarding_instructions_q === "string"
      ? params.boarding_instructions_q.trim()
      : undefined

  return {
    search: search || undefined,
  }
}