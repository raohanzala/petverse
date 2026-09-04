import { Suspense } from "react"

import { PetsManager } from "@/components/clients/pets-manager"
import { PageLoader } from "@/components/shared/page-loader"
import { parsePetListFilters } from "@/lib/constants/pet-filters"
import {
  listPets,
} from "@/lib/supabase/queries/pets"
import { listOwnersForSelection } from "@/lib/supabase/queries/owners"

type PetsPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export default async function PetsPage({
  searchParams,
}: PetsPageProps) {
  const params = await searchParams

  const filters = parsePetListFilters(params)

  const [pets, owners] = await Promise.all([
    listPets(filters),
    listOwnersForSelection(),
  ])

  return (
    <Suspense fallback={<PageLoader label="Loading pets…" />}>
      <PetsManager
        pets={pets}
        owners={owners}
        filters={filters}
      />
    </Suspense>
  )
}