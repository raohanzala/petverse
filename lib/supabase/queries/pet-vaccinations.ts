import { createClient } from "@/lib/supabase/server"
import type { PetVaccinationListFilters } from "@/lib/constants/pet-vaccinations-filters"
import type {
  PetVaccinationWithRelations,
} from "@/lib/supabase/types"
import { getSupabaseErrorMessage } from "@/lib/supabase/errors"

const PET_VACCINATION_COLUMNS = `
  id,
  pet_id,
  vaccine_type_id,
  administered_at,
  expires_at,
  notes,
  recorded_by,

  pet:pets!pet_vaccinations_pet_id_fkey (
    id,
    name
  ),

  vaccine_type:vaccine_types!pet_vaccinations_vaccine_type_id_fkey (
    id,
    name
  ),

  employee:employees!pet_vaccinations_recorded_by_fkey (
    id,
    display_name
  )
` as const

type PetVaccinationQueryRow = {
  id: string
  pet_id: string
  vaccine_type_id: string
  administered_at: string
  expires_at: string | null
  notes: string | null
  recorded_by: string | null

  pet: {
    id: string
    name: string
  } | null

  vaccine_type: {
    id: string
    name: string
  } | null

  employee: {
    id: string
    display_name: string
  } | null
}

function normalizePetVaccination(
  row: PetVaccinationQueryRow
): PetVaccinationWithRelations {
  return {
    id: row.id,
    pet_id: row.pet_id,
    vaccine_type_id: row.vaccine_type_id,
    administered_at: row.administered_at,
    expires_at: row.expires_at,
    notes: row.notes,
    recorded_by: row.recorded_by,
    pet: row.pet,
    vaccine_type: row.vaccine_type,
    employee: row.employee,
  }
}

function escapeIlikePattern(value: string) {
  return value.replace(/[%_\\]/g, "\\$&")
}

export async function listPetVaccinations(
  filters: PetVaccinationListFilters = {}
): Promise<PetVaccinationWithRelations[]> {
  const supabase = await createClient()
  const { search } = filters

  let query = supabase
    .from("pet_vaccinations")
    .select(PET_VACCINATION_COLUMNS)

  if (search) {
    const pattern = `%${escapeIlikePattern(search)}%`

    query = query.or(
      `notes.ilike.${pattern}`
    )
  }

  const { data, error } = await query
    .order("administered_at", {
      ascending: false,
    })

  if (error) {
    throw new Error(
      getSupabaseErrorMessage(
        error,
        "Failed to load pet vaccinations"
      )
    )
  }

  console.log(
    "PET VACCINATION DATA:",
    JSON.stringify(data, null, 2)
  )

  return (data ?? []).map((row) =>
    normalizePetVaccination(
      row as unknown as PetVaccinationQueryRow
    )
  )
}

export async function getPetVaccinationById(
  id: string
): Promise<PetVaccinationWithRelations | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("pet_vaccinations")
    .select(PET_VACCINATION_COLUMNS)
    .eq("id", id)
    .maybeSingle()

  if (error) {
    throw new Error(
      getSupabaseErrorMessage(
        error,
        "Failed to load pet vaccination"
      )
    )
  }

  if (!data) {
    return null
  }

  return normalizePetVaccination(
    data as unknown as PetVaccinationQueryRow
  )
}