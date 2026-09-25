import { createClient } from "@/lib/supabase/server"
import type { AppointmentListFilters } from "@/lib/constants/appointment-filters"
import type { AppointmentRow } from "@/lib/supabase/types"
import { getSupabaseErrorMessage } from "@/lib/supabase/errors"
import { getFeatureConfig } from "@/lib/features/get-feature-config"

const APPOINTMENT_COLUMNS = `
  id,
  owner_id,
  pet_id,
  service_id,
  package_id,
  employee_id,
  preferred_employee_id,
  status,
  source,
  starts_at,
  ends_at,
  duration_minutes,
  price,
  group_id,
  step_order,
  notes,
  cancelled_at,
  cancel_reason,
  created_at,
  updated_at,
  owner:owners (
    name,
    phone
  ),
  pet:pets (
    name,
    species
  ),
  service:services (
    name
  ),
  package:service_packages (
    name
  ),
  employee:employees!appointments_employee_id_fkey (
  display_name
),

preferred_employee:employees!appointments_preferred_employee_id_fkey (
  display_name
)
` as const

function escapeIlikePattern(value: string) {
  return value.replace(/[%_\\]/g, "\\$&")
}

type OwnerRelation = {
  name: string
  phone: string
}

type PetRelation = {
  name: string
  species: string
}

type ServiceRelation = {
  name: string
}

type PackageRelation = {
  name: string
}

type EmployeeRelation = {
  display_name: string
}

type RawRelation<T> = T | T[] | null

type RawAppointmentRow = Omit<
  AppointmentRow,
  | "owner"
  | "pet"
  | "service"
  | "package"
  | "employee"
  | "preferred_employee"
> & {
  owner: RawRelation<OwnerRelation>
  pet: RawRelation<PetRelation>
  service: RawRelation<ServiceRelation>
  package: RawRelation<PackageRelation>
  employee: RawRelation<EmployeeRelation>
  preferred_employee: RawRelation<EmployeeRelation>
}

function normalizeAppointment(
  row: RawAppointmentRow,
  petEnabled: boolean,
): AppointmentRow {
  const owner = Array.isArray(row.owner)
    ? row.owner[0]
    : row.owner

  const pet = Array.isArray(row.pet)
    ? row.pet[0]
    : row.pet

  const service = Array.isArray(row.service)
    ? row.service[0]
    : row.service

  const packageRelation = Array.isArray(row.package)
    ? row.package[0]
    : row.package

  const employee = Array.isArray(row.employee)
    ? row.employee[0]
    : row.employee

  const preferredEmployee = Array.isArray(
    row.preferred_employee,
  )
    ? row.preferred_employee[0]
    : row.preferred_employee

  if (!owner) {
    throw new Error(
      `Appointment ${row.id} is missing owner relation`,
    )
  }

  // if (petEnabled && !pet) {
  //   throw new Error(
  //     `Appointment ${row.id} is missing pet relation`,
  //   )
  // }

  if (row.service_id && !service) {
    throw new Error(
      `Appointment ${row.id} references a missing service`,
    )
  }

  if (row.package_id && !packageRelation) {
    throw new Error(
      `Appointment ${row.id} references a missing package`,
    )
  }

  if (row.employee_id && !employee) {
    throw new Error(
      `Appointment ${row.id} references a missing employee`,
    )
  }

  if (
    row.preferred_employee_id &&
    !preferredEmployee
  ) {
    throw new Error(
      `Appointment ${row.id} references a missing preferred employee`,
    )
  }

  return {
    ...row,
    owner,
    pet: pet ?? null,
    service: service ?? null,
    package: packageRelation ?? null,
    employee: employee ?? null,
    preferred_employee: preferredEmployee ?? null,
  }
}

/** Admin list — supports server-side search, date range, staff, service and status filters */
export async function listAppointments(
  filters: AppointmentListFilters = {}
): Promise<AppointmentRow[]> {
  const { petEnabled } = await getFeatureConfig()
  const supabase = await createClient()

  const {
    search,
    status = "all",
    from,
    to,
    employee,
    service,
  } = filters

  let query = supabase
    .from("appointments")
    .select(APPOINTMENT_COLUMNS)

  // Status
  if (status !== "all") {
    query = query.eq("status", status)
  }

  // Date range
  if (from) {
    query = query.gte(
      "starts_at",
      `${from}T00:00:00`
    )
  }

  if (to) {
    const nextDay = new Date(`${to}T00:00:00`)
    nextDay.setDate(nextDay.getDate() + 1)

    const nextDayString = nextDay
      .toISOString()
      .split("T")[0]

    query = query.lt(
      "starts_at",
      `${nextDayString}T00:00:00`
    )
  }

  // Team member
  if (employee) {
    query = query.eq("employee_id", employee)
  }

  // Service
  if (service) {
    query = query.eq("service_id", service)
  }

  // Search
  if (search) {
    const pattern = `%${escapeIlikePattern(search)}%`

    query = query.or(
      `notes.ilike.${pattern},cancel_reason.ilike.${pattern}`
    )
  }

  const { data, error } = await query
    .order("starts_at", { ascending: true })

  if (error) {
    throw new Error(
      getSupabaseErrorMessage(
        error,
        "Failed to load appointments"
      )
    )
  }

  return (data ?? []).map((row) =>
    normalizeAppointment(row, petEnabled)
  )
}

/** Upcoming appointments — active appointment statuses only */
export async function listUpcomingAppointments(): Promise<
  AppointmentRow[]
> {
  const { petEnabled } = await getFeatureConfig()
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("appointments")
    .select(APPOINTMENT_COLUMNS)
    .gte("starts_at", new Date().toISOString())
    .not("status", "in", "(cancelled,no_show,completed)")
    .order("starts_at", { ascending: true })

  if (error) {
    throw new Error(
      getSupabaseErrorMessage(
        error,
        "Failed to load upcoming appointments"
      )
    )
  }

  return (data ?? []).map((row) => normalizeAppointment(row, petEnabled))
}

export async function listAppointmentsByPetId(
  petId: string
): Promise<AppointmentRow[]> {
  const { petEnabled } = await getFeatureConfig()
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("appointments")
    .select(APPOINTMENT_COLUMNS)
    .eq("pet_id", petId)
    .order("starts_at", { ascending: false })

  if (error) {
    throw new Error(
      getSupabaseErrorMessage(
        error,
        "Failed to load pet appointments"
      )
    )
  }

  return (data ?? []).map((row) => normalizeAppointment(row, petEnabled))
}

export async function listAppointmentsByOwnerId(
  ownerId: string
): Promise<AppointmentRow[]> {
  const { petEnabled } = await getFeatureConfig()
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("appointments")
    .select(APPOINTMENT_COLUMNS)
    .eq("owner_id", ownerId)
    .order("starts_at", { ascending: false })

  if (error) {
    throw new Error(
      getSupabaseErrorMessage(
        error,
        "Failed to load owner appointments"
      )
    )
  }

  return (data ?? []).map((row) => normalizeAppointment(row, petEnabled))
}

export async function getAppointmentById(
  id: string
): Promise<AppointmentRow | null> {
  const { petEnabled } = await getFeatureConfig()
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("appointments")
    .select(APPOINTMENT_COLUMNS)
    .eq("id", id)
    .maybeSingle()

  if (error) {
    throw new Error(
      getSupabaseErrorMessage(
        error,
        "Failed to load appointment"
      )
    )
  }

  return data ? normalizeAppointment(data, petEnabled) : null
}
