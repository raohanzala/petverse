export type DaycareTodayStatusFilter =
  | "all"
  | "scheduled"
  | "checked_in"
  | "checked_out"
  | "cancelled"

export type DaycareTodayListFilters = {
  search: string
  status: DaycareTodayStatusFilter
}

type SearchParams = Record<
  string,
  string | string[] | undefined
>

function getParam(
  searchParams: SearchParams,
  key: string
) {
  const value = searchParams[key]

  return typeof value === "string"
    ? value
    : undefined
}

export function parseDaycareTodayFilters(
  searchParams: SearchParams
): DaycareTodayListFilters {
  const search =
    getParam(searchParams, "q")?.trim() ?? ""

  const statusParam =
    getParam(searchParams, "status")

  const status: DaycareTodayStatusFilter =
    statusParam === "scheduled" ||
    statusParam === "checked_in" ||
    statusParam === "checked_out" ||
    statusParam === "cancelled"
      ? statusParam
      : "all"

  return {
    search,
    status,
  }
}