export const SERVICE_PACKAGE_STEP_MODES = [
  "sequential",
  "parallel",
] as const

export type ServicePackageStepMode =
  (typeof SERVICE_PACKAGE_STEP_MODES)[number]

export const SERVICE_PACKAGE_STATUS_FILTERS = [
  "all",
  "active",
  "inactive",
] as const

export type ServicePackageStatusFilter =
  (typeof SERVICE_PACKAGE_STATUS_FILTERS)[number]

export type ServicePackageListFilters = {
  search?: string
  stepMode?: ServicePackageStepMode | "all"
  status?: ServicePackageStatusFilter
}

export function parseServicePackageListFilters(
  params: Record<string, string | string[] | undefined>
): ServicePackageListFilters {
  const rawStepMode =
    typeof params.stepMode === "string"
      ? params.stepMode
      : "all"

  const stepMode =
    SERVICE_PACKAGE_STEP_MODES.includes(
      rawStepMode as ServicePackageStepMode
    )
      ? (rawStepMode as ServicePackageStepMode)
      : "all"

  const rawStatus =
    typeof params.status === "string"
      ? params.status
      : "all"

  const status =
    SERVICE_PACKAGE_STATUS_FILTERS.includes(
      rawStatus as ServicePackageStatusFilter
    )
      ? (rawStatus as ServicePackageStatusFilter)
      : "all"

  const search =
    typeof params.q === "string"
      ? params.q.trim()
      : undefined

  return {
    search: search || undefined,
    stepMode,
    status,
  }
}