import { Suspense } from "react"

import { ServicePackageStepsManager } from "@/components/catalog/service-package-steps-manager"
import { PageLoader } from "@/components/shared/page-loader"
import { parseServicePackageStepListFilters } from "@/lib/constants/service-package-step-filters"
import { listServicePackageSteps } from "@/lib/supabase/queries/service-package-steps"
import { listActiveServicePackages } from "@/lib/supabase/queries/service-packages"
import { listActiveServices } from "@/lib/supabase/queries/services"

type ServicePackageStepsPageProps = {
  searchParams: Promise<
    Record<string, string | string[] | undefined>
  >
}

export default async function ServicePackageStepsPage({
  searchParams,
}: ServicePackageStepsPageProps) {
  const params = await searchParams

  const filters =
    parseServicePackageStepListFilters(params)

  const [steps, packages, services] =
    await Promise.all([
      listServicePackageSteps(filters),
      listActiveServicePackages(),
      listActiveServices(),
    ])

  return (
    <Suspense
      fallback={
        <PageLoader label="Loading package steps…" />
      }
    >
      <ServicePackageStepsManager
        steps={steps}
        filters={filters}
        packages={packages}
        services={services}
      />
    </Suspense>
  )
}