export type DaycarePackageStatusFilter =
  | "all"
  | "active"
  | "inactive"

export type DaycarePackageListFilters = {
  search: string
  status: DaycarePackageStatusFilter
}

export type DaycareWalletStatusFilter =
  | "all"
  | "active"
  | "expired"
  | "exhausted"

export type DaycareWalletListFilters = {
  search: string
  status: DaycareWalletStatusFilter
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

  return typeof value === "string" ? value : undefined
}

export function parseDaycarePackageFilters(
  searchParams: SearchParams
): DaycarePackageListFilters {
  const search = getParam(searchParams, "q")?.trim() ?? ""
  const statusParam = getParam(searchParams, "status")

  const status: DaycarePackageStatusFilter =
    statusParam === "active" || statusParam === "inactive"
      ? statusParam
      : "all"

  return {
    search,
    status,
  }
}

export function parseDaycareWalletFilters(
  searchParams: SearchParams
): DaycareWalletListFilters {
  const search = getParam(searchParams, "q")?.trim() ?? ""
  const statusParam = getParam(searchParams, "status")

  const status: DaycareWalletStatusFilter =
    statusParam === "active" ||
    statusParam === "expired" ||
    statusParam === "exhausted"
      ? statusParam
      : "all"

  return {
    search,
    status,
  }
}