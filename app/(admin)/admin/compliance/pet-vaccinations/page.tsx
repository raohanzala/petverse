import { Suspense } from "react"

import { PetVaccinationsManager } from "@/components/compliance/pet-vaccinations/pet-vaccinations-manager"
import { PageLoader } from "@/components/shared/page-loader"
import { parsePetVaccinationListFilters } from "@/lib/constants/pet-vaccinations-filters"
import { listEmployees } from "@/lib/supabase/queries/employees"
import { listPets } from "@/lib/supabase/queries/pets"
import { listPetVaccinations } from "@/lib/supabase/queries/pet-vaccinations"
import { listVaccineTypes } from "@/lib/supabase/queries/vaccine-types"

type PetVaccinationsPageProps = {
    searchParams: Promise<
        Record<string, string | string[] | undefined>
    >
}

export default async function PetVaccinationsPage({
    searchParams,
}: PetVaccinationsPageProps) {
    const params = await searchParams

    const filters = parsePetVaccinationListFilters(params)

    const [vaccinations, pets, employees, vaccinationTypes] =
        await Promise.all([
            listPetVaccinations(filters),
            listPets(),
            listEmployees(),
            listVaccineTypes(),
        ])

    return (
        <Suspense
            fallback={
                <PageLoader label="Loading pet vaccinations…" />
            }
        >
            <PetVaccinationsManager
                pets={pets}
                employees={employees}
                vaccinationTypes={vaccinationTypes}
                vaccinations={vaccinations}
                filters={filters}
            />
        </Suspense>
    )
}