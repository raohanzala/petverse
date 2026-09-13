import { createClient } from "@/lib/supabase/server"

import type {
  DailyUpdateListFilters,
} from "@/lib/constants/daily-update-filters"

import type {
  DailyUpdateAppointmentOption,
  DailyUpdateEmployeeOption,
  DailyUpdatePetOption,
  DailyUpdateWithRelations,
} from "@/lib/supabase/types"

import { getSupabaseErrorMessage } from "@/lib/supabase/errors"

const DAILY_UPDATE_COLUMNS = `
  id,
  pet_id,
  appointment_id,
  author_id,
  body,
  sent_to_owner_at,
  created_at,
  pet:pets (
    id,
    name,
    species,
    owner:owners (
      id,
      name,
      phone
    )
  ),
  appointment:appointments (
    id,
    starts_at,
    status
  ),
  author:employees (
    id,
    display_name,
    initials
  )
` as const

type QueryOwner = {
  id: string
  name: string
  phone: string
}

type QueryPet = {
  id: string
  name: string
  species: string
  owner: QueryOwner | QueryOwner[] | null
}

type QueryAppointment = {
  id: string
  starts_at: string
  status: DailyUpdateWithRelations["appointment"] extends infer T
    ? T extends { status: infer S }
      ? S
      : never
    : never
}

type QueryAuthor = {
  id: string
  display_name: string
  initials: string | null
}

type QueryRow = {
  id: string
  pet_id: string
  appointment_id: string | null
  author_id: string | null
  body: string
  sent_to_owner_at: string | null
  created_at: string
  pet: QueryPet | QueryPet[] | null
  appointment: QueryAppointment | QueryAppointment[] | null
  author: QueryAuthor | QueryAuthor[] | null
}

function normalizeRelation<T>(
  value: T | T[] | null
): T | null {
  return Array.isArray(value)
    ? value[0] ?? null
    : value
}

function normalizeDailyUpdateRow(
  row: QueryRow
): DailyUpdateWithRelations {
  const pet = normalizeRelation(row.pet)
  const appointment = normalizeRelation(row.appointment)
  const author = normalizeRelation(row.author)

  return {
    id: row.id,
    pet_id: row.pet_id,
    appointment_id: row.appointment_id,
    author_id: row.author_id,
    body: row.body,
    sent_to_owner_at: row.sent_to_owner_at,
    created_at: row.created_at,
    pet: pet
      ? {
          id: pet.id,
          name: pet.name,
          species: pet.species,
          owner: normalizeRelation(pet.owner),
        }
      : null,
    appointment: appointment
      ? {
          id: appointment.id,
          starts_at: appointment.starts_at,
          status: appointment.status as DailyUpdateWithRelations["appointment"] extends infer T
            ? T extends { status: infer S }
              ? S
              : never
            : never,
        }
      : null,
    author,
  }
}

function escapeIlikePattern(value: string) {
  return value.replace(/[%_\\]/g, "\\$&")
}

/**
 * Admin list — supports server-side search and delivery filter.
 */
export async function listDailyUpdates(
  filters: DailyUpdateListFilters = {}
): Promise<DailyUpdateWithRelations[]> {
  const supabase = await createClient()

  const {
    search,
    delivery = "all",
  } = filters

  let petIds: string[] | undefined

  if (search) {
    const pattern = `%${escapeIlikePattern(search)}%`

    const { data: pets, error: petError } = await supabase
      .from("pets")
      .select(`
        id,
        name,
        owner:owners (
          name,
          phone
        )
      `)
      .or(
        `name.ilike.${pattern},owner.name.ilike.${pattern},owner.phone.ilike.${pattern}`
      )

    if (petError) {
      throw new Error(
        getSupabaseErrorMessage(
          petError,
          "Failed to search pets"
        )
      )
    }

    petIds = (pets ?? []).map((pet) => pet.id)

    if (petIds.length === 0) {
      return []
    }
  }

  let query = supabase
    .from("daily_updates")
    .select(DAILY_UPDATE_COLUMNS)

  if (petIds) {
    query = query.in("pet_id", petIds)
  }

  if (delivery === "sent") {
    query = query.not("sent_to_owner_at", "is", null)
  } else if (delivery === "pending") {
    query = query.is("sent_to_owner_at", null)
  }

  const { data, error } = await query.order(
    "created_at",
    { ascending: false }
  )

  if (error) {
    throw new Error(
      getSupabaseErrorMessage(
        error,
        "Failed to load daily updates"
      )
    )
  }

  return (data ?? []).map((row) =>
    normalizeDailyUpdateRow(row as QueryRow)
  )
}

/**
 * Get one daily update by id.
 */
export async function getDailyUpdateById(
  id: string
): Promise<DailyUpdateWithRelations | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("daily_updates")
    .select(DAILY_UPDATE_COLUMNS)
    .eq("id", id)
    .maybeSingle()

  if (error) {
    throw new Error(
      getSupabaseErrorMessage(
        error,
        "Failed to load daily update"
      )
    )
  }

  return data
    ? normalizeDailyUpdateRow(data as QueryRow)
    : null
}

/**
 * Pet options for the daily update form.
 */
export async function listDailyUpdatePets(): Promise<
  DailyUpdatePetOption[]
> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("pets")
    .select(`
      id,
      name,
      species,
      owner_id,
      owner:owners (
        name,
        phone
      )
    `)
    .order("name", { ascending: true })

  if (error) {
    throw new Error(
      getSupabaseErrorMessage(
        error,
        "Failed to load pets"
      )
    )
  }

  return (data ?? []).map((pet) => ({
    id: pet.id,
    name: pet.name,
    species: pet.species,
    owner_id: pet.owner_id,
    owner: Array.isArray(pet.owner)
      ? pet.owner[0] ?? null
      : pet.owner ?? null,
  }))
}

/**
 * Appointment options for the daily update form.
 */
export async function listDailyUpdateAppointments(): Promise<
  DailyUpdateAppointmentOption[]
> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("appointments")
    .select(`
      id,
      pet_id,
      starts_at,
      status
    `)
    .order("starts_at", { ascending: false })

  if (error) {
    throw new Error(
      getSupabaseErrorMessage(
        error,
        "Failed to load appointments"
      )
    )
  }

  return (data ?? []) as DailyUpdateAppointmentOption[]
}

/**
 * Employee options for the daily update form.
 */
export async function listDailyUpdateEmployees(): Promise<
  DailyUpdateEmployeeOption[]
> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("employees")
    .select(`
      id,
      display_name,
      initials
    `)
    .order("display_name", { ascending: true })

  if (error) {
    throw new Error(
      getSupabaseErrorMessage(
        error,
        "Failed to load employees"
      )
    )
  }

  return data ?? []
}