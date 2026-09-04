import { createClient } from "@/lib/supabase/server"
import type { AppointmentListFilters } from "@/lib/constants/appointment-filters"
import type { AppointmentRow } from "@/lib/supabase/types"
import { getSupabaseErrorMessage } from "@/lib/supabase/errors"

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

/** Admin list — supports server-side search and status filter */
export async function listAppointments(
    filters: AppointmentListFilters = {}
): Promise<AppointmentRow[]> {
    const supabase = await createClient()
    const { search, status = "all" } = filters

    let query = supabase
        .from("appointments")
        .select(APPOINTMENT_COLUMNS)

    if (status !== "all") {
        query = query.eq("status", status)
    }

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

    return data ?? []
}

/** Upcoming appointments — active appointment statuses only */
export async function listUpcomingAppointments(): Promise<
    AppointmentRow[]
> {
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

    return data ?? []
}

export async function listAppointmentsByPetId(
    petId: string
): Promise<AppointmentRow[]> {
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

    return data ?? []
}

export async function listAppointmentsByOwnerId(
    ownerId: string
): Promise<AppointmentRow[]> {
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

    return data ?? []
}

export async function getAppointmentById(
    id: string
): Promise<AppointmentRow | null> {
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

    return data ?? []
}