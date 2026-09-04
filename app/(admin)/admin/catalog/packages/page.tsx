import { Suspense } from "react"

import { ServicePackagesManager } from "@/components/catalog/service-packages-manager"
import { PageLoader } from "@/components/shared/page-loader"
import { parseServicePackageListFilters } from "@/lib/constants/service-package-filters"
import { listServicePackages } from "@/lib/supabase/queries/service-packages"

type ServicePackagesPageProps = {
  searchParams: Promise<
    Record<string, string | string[] | undefined>
  >
}

export default async function ServicePackagesPage({
  searchParams,
}: ServicePackagesPageProps) {
  const params = await searchParams
  const filters = parseServicePackageListFilters(params)
  const packages = await listServicePackages(filters)

  return (
    <Suspense
      fallback={
        <PageLoader label="Loading packages…" />
      }
    >
      <ServicePackagesManager
        packages={packages}
        filters={filters}
      />
    </Suspense>
  )
}