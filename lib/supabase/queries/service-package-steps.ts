import { createClient } from "@/lib/supabase/server"
import type { ServicePackageStepListFilters } from "@/lib/constants/service-package-step-filters"
import type { ServicePackageStepListRow } from "@/lib/supabase/types"
import { getSupabaseErrorMessage } from "@/lib/supabase/errors"

const SERVICE_PACKAGE_STEP_COLUMNS = `
  id,
  package_id,
  service_id,
  step_order,
  parallel_group,
  override_duration_minutes,
  override_price,
  package:service_packages (
    id,
    name
  ),
  service:services (
    id,
    name
  )
` as const

function escapeIlikePattern(value: string) {
  return value.replace(/[%_\\]/g, "\\$&")
}

function normalizePackageStep(row: any): ServicePackageStepListRow {
  return {
    ...row,
    package: Array.isArray(row.package) ? row.package[0] : row.package,
    service: Array.isArray(row.service) ? row.service[0] : row.service,
  }
}

/** Admin list — supports server-side search, package and service filters */
export async function listServicePackageSteps(
  filters: ServicePackageStepListFilters = {}
): Promise<ServicePackageStepListRow[]> {
  const supabase = await createClient()

  const {
    search,
    packageId,
    serviceId,
  } = filters

  let query = supabase
    .from("service_package_steps")
    .select(SERVICE_PACKAGE_STEP_COLUMNS)

  if (packageId !== undefined) {
    query = query.eq("package_id", packageId)
  }

  if (serviceId) {
    query = query.eq("service_id", serviceId)
  }

  /*
   * Search related package/service names.
   *
   * Because search is across two related tables, we first
   * find matching package/service IDs and then filter the
   * package_steps table using those IDs.
   */
  if (search) {
    const pattern = `%${escapeIlikePattern(search)}%`

    const [
      { data: matchingPackages, error: packageError },
      { data: matchingServices, error: serviceError },
    ] = await Promise.all([
      supabase
        .from("service_packages")
        .select("id")
        .ilike("name", pattern),

      supabase
        .from("services")
        .select("id")
        .ilike("name", pattern),
    ])

    if (packageError) {
      throw new Error(
        getSupabaseErrorMessage(
          packageError,
          "Failed to search packages"
        )
      )
    }

    if (serviceError) {
      throw new Error(
        getSupabaseErrorMessage(
          serviceError,
          "Failed to search services"
        )
      )
    }

    const packageIds = (matchingPackages ?? []).map(
      (pkg) => pkg.id
    )

    const serviceIds = (matchingServices ?? []).map(
      (service) => service.id
    )

    if (packageIds.length === 0 && serviceIds.length === 0) {
      return []
    }

    if (packageIds.length > 0 && serviceIds.length > 0) {
      query = query.or(
        `package_id.in.(${packageIds.join(",")}),service_id.in.(${serviceIds.join(",")})`
      )
    } else if (packageIds.length > 0) {
      query = query.in("package_id", packageIds)
    } else {
      query = query.in("service_id", serviceIds)
    }
  }

  const { data, error } = await query
    .order("package_id", { ascending: true })
    .order("step_order", { ascending: true })
    .order("parallel_group", {
      ascending: true,
      nullsFirst: true,
    })

  if (error) {
    throw new Error(
      getSupabaseErrorMessage(
        error,
        "Failed to load package steps"
      )
    )
  }

  return (data ?? []).map(normalizePackageStep)
}

/** Get package steps for a specific package */
export async function listServicePackageStepsByPackageId(
  packageId: number
): Promise<ServicePackageStepListRow[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("service_package_steps")
    .select(SERVICE_PACKAGE_STEP_COLUMNS)
    .eq("package_id", packageId)
    .order("step_order", { ascending: true })
    .order("parallel_group", {
      ascending: true,
      nullsFirst: true,
    })

  if (error) {
    throw new Error(
      getSupabaseErrorMessage(
        error,
        "Failed to load package steps"
      )
    )
  }

  return (data ?? []).map(normalizePackageStep)
}

/** Get package steps for a specific service */
export async function listServicePackageStepsByServiceId(
  serviceId: string
): Promise<ServicePackageStepListRow[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("service_package_steps")
    .select(SERVICE_PACKAGE_STEP_COLUMNS)
    .eq("service_id", serviceId)
    .order("package_id", { ascending: true })
    .order("step_order", { ascending: true })

  if (error) {
    throw new Error(
      getSupabaseErrorMessage(
        error,
        "Failed to load package steps"
      )
    )
  }

  return (data ?? []).map(normalizePackageStep)
}

/** Get one package step by ID */
export async function getServicePackageStepById(
  id: string
): Promise<ServicePackageStepListRow | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("service_package_steps")
    .select(SERVICE_PACKAGE_STEP_COLUMNS)
    .eq("id", id)
    .maybeSingle()

  if (error) {
    throw new Error(
      getSupabaseErrorMessage(
        error,
        "Failed to load package step"
      )
    )
  }

  return data as ServicePackageStepListRow | null
}