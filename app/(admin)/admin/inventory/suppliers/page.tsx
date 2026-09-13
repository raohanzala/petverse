import { Suspense } from "react"

import { SuppliersManager } from "@/components/inventory/suppliers/suppliers-manager"
import { PageLoader } from "@/components/shared/page-loader"
import { parseSupplierListFilters } from "@/lib/constants/supplier-filters"
import { listSuppliers } from "@/lib/supabase/queries/suppliers"

type SuppliersPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export default async function SuppliersPage({
  searchParams,
}: SuppliersPageProps) {
  const params = await searchParams
  const filters = parseSupplierListFilters(params)
  const suppliers = await listSuppliers(filters)

  return (
    <Suspense fallback={<PageLoader label="Loading suppliers…" />}>
      <SuppliersManager
        suppliers={suppliers}
        filters={filters}
      />
    </Suspense>
  )
}