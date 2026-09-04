export const SERVICE_PACKAGE_STEP_STATUS_FILTERS = [
  "all",
] as const

export type ServicePackageStepStatusFilter =
  (typeof SERVICE_PACKAGE_STEP_STATUS_FILTERS)[number]

export type ServicePackageStepListFilters = {
  search?: string
  packageId?: number
  serviceId?: string
}

export function parseServicePackageStepListFilters(
  params: Record<string, string | string[] | undefined>
): ServicePackageStepListFilters {
  const search =
    typeof params.q === "string"
      ? params.q.trim()
      : undefined

  const rawPackageId =
    typeof params.packageId === "string"
      ? params.packageId
      : undefined

  const packageId =
    rawPackageId && /^\d+$/.test(rawPackageId)
      ? Number(rawPackageId)
      : undefined

  const serviceId =
    typeof params.serviceId === "string"
      ? params.serviceId
      : undefined

  return {
    search: search || undefined,
    packageId,
    serviceId,
  }
}