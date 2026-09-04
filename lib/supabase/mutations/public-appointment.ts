"use server"

import { revalidatePath } from "next/cache"

import {
  getSupabaseErrorMessage,
  mutationError,
  mutationSuccess,
  type MutationResult,
} from "@/lib/supabase/errors"
import { createAdminClient } from '@/lib/supabase/admin'

type CreatePublicAppointmentInput = {
  customer: {
    name: string
    email: string
    phone: string
  }
  pet: {
    name: string
    type: string
  }
  service_id: string
  preferred_employee_id: string | null
  starts_at: string
  ends_at: string
  duration_minutes: number
  price: number
}

type PublicAppointmentResult = {
  appointment_id: string
}

export async function createPublicAppointment(
  input: CreatePublicAppointmentInput
): Promise<MutationResult<PublicAppointmentResult>> {
  const supabase = createAdminClient()

  const customerName = input.customer.name.trim()
  const customerEmail = input.customer.email.trim() || null
  const customerPhone = input.customer.phone.trim()

  const petName = input.pet.name.trim()
  const petType = input.pet.type.trim()

  if (!customerName || !customerPhone) {
    return mutationError("Customer name and phone are required")
  }

  if (!petName || !petType) {
    return mutationError("Pet name and type are required")
  }

  // 1. Find existing owner by phone
  const { data: existingOwner, error: ownerLookupError } =
    await supabase
      .from("owners")
      .select("id")
      .eq("phone", customerPhone)
      .maybeSingle()

  if (ownerLookupError) {
    return mutationError(
      getSupabaseErrorMessage(
        ownerLookupError,
        "Failed to find customer"
      )
    )
  }

  let ownerId = existingOwner?.id

  // 2. Create owner if they don't exist
  if (!ownerId) {
    const { data: newOwner, error: ownerCreateError } =
      await supabase
        .from("owners")
        .insert({
          name: customerName,
          phone: customerPhone,
          email: customerEmail,
          preferred_contact: "phone",
        })
        .select("id")
        .single()

    if (ownerCreateError) {
      return mutationError(
        getSupabaseErrorMessage(
          ownerCreateError,
          "Failed to create customer"
        )
      )
    }

    ownerId = newOwner.id
  }

  // 3. Create the pet
  const { data: newPet, error: petError } = await supabase
    .from("pets")
    .insert({
      owner_id: ownerId,
      name: petName,
      species: petType,
      is_active: true,
    })
    .select("id")
    .single()

  if (petError) {
    return mutationError(
      getSupabaseErrorMessage(
        petError,
        "Failed to create pet"
      )
    )
  }

  // 4. Create appointment
  const { data: appointment, error: appointmentError } =
    await supabase
      .from("appointments")
      .insert({
        owner_id: ownerId,
        pet_id: newPet.id,
        service_id: input.service_id,
        package_id: null,
        employee_id: null,
        preferred_employee_id:
          input.preferred_employee_id ?? null,
        status: "requested",
        source: "online",
        starts_at: input.starts_at,
        ends_at: input.ends_at,
        duration_minutes: input.duration_minutes,
        price: input.price,
        group_id: null,
        step_order: null,
        notes: null,
        cancelled_at: null,
        cancel_reason: null,
      })
      .select("id")
      .single()

  if (appointmentError) {
    return mutationError(
      getSupabaseErrorMessage(
        appointmentError,
        "Failed to create appointment"
      )
    )
  }

  revalidatePath("/book")
  revalidatePath("/admin/appointments")
  revalidatePath("/admin/pets")
  revalidatePath("/admin/owners")

  return mutationSuccess({
    appointment_id: appointment.id,
  })
}