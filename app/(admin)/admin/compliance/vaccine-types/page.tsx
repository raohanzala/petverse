import { Suspense } from "react"

import { VaccineTypesManager } from "@/components/compliance/vaccine-types/vaccine-types-manager"
import { PageLoader } from "@/components/shared/page-loader"
import { parseVaccineTypeListFilters } from "@/lib/constants/vaccine-types-filters"
import { listVaccineTypes } from "@/lib/supabase/queries/vaccine-types"

type VaccineTypesPageProps = {
  searchParams: Promise<
    Record<string, string | string[] | undefined>
  >
}

export default async function VaccineTypesPage({
  searchParams,
}: VaccineTypesPageProps) {
  const params = await searchParams

  const filters =
    parseVaccineTypeListFilters(params)

  const vaccineTypes =
    await listVaccineTypes(filters)

  return (
    <Suspense
      fallback={
        <PageLoader label="Loading vaccine types…" />
      }
    >
      <VaccineTypesManager
        vaccineTypes={vaccineTypes}
        filters={filters}
      />
    </Suspense>
  )
}