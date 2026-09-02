import { Suspense } from "react"

import { ServiceCategoriesManager } from "@/components/catalog/service-categories-manager"
import { PageLoader } from "@/components/shared/page-loader"
import { parseServiceCategoryListFilters } from "@/lib/constants/service-category-filters"
import { listServiceCategories } from "@/lib/supabase/queries/service-categories"

type ServiceCategoriesPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export default async function ServiceCategoriesPage({
  searchParams,
}: ServiceCategoriesPageProps) {
  const params = await searchParams
  const filters = parseServiceCategoryListFilters(params)
  const categories = await listServiceCategories(filters)

  return (
    <Suspense fallback={<PageLoader label="Loading categories…" />}>
      <ServiceCategoriesManager
        categories={categories}
        filters={filters}
      />
    </Suspense>
  )
}
