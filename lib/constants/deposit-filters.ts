export type DepositListFilters = {
  search?: string
}

export function parseDepositListFilters(
  params: Record<string, string | string[] | undefined>
): DepositListFilters {
  const search =
    typeof params.deposit_q === "string"
      ? params.deposit_q.trim()
      : undefined

  return {
    search: search || undefined,
  }
}