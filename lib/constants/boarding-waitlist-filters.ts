export type BoardingWaitlistListFilters = {
  search?: string
}

export function parseBoardingWaitlistListFilters(
  params: Record<string, string | string[] | undefined>
): BoardingWaitlistListFilters {
  const search =
    typeof params.boarding_waitlist_q === "string"
      ? params.boarding_waitlist_q.trim()
      : undefined

  return {
    search: search || undefined,
  }
}