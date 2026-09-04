import { ServicesManager } from "@/components/catalog/services-manager"
import { parseServiceListFilters } from "@/lib/constants/service-filters"
import { listServiceCategories } from "@/lib/supabase/queries/service-categories"
import { listServices } from "@/lib/supabase/queries/services"

type ServicesPageProps = {
  searchParams: Promise<
    Record<string, string | string[] | undefined>
  >
}

export default async function ServicesPage({
  searchParams,
}: ServicesPageProps) {
  const params = await searchParams

  const filters = parseServiceListFilters(params)

  const [services, categories] = await Promise.all([
    listServices(filters),
    listServiceCategories(),
  ])

  return (
    <ServicesManager
      services={services}
      categories={categories}
      filters={filters}
    />
  )
}