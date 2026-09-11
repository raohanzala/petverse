import { z } from "zod"

export const reservationStatusSchema = z.enum([
  "pending",
  "confirmed",
  "checked_in",
  "checked_out",
  "cancelled",
])

const reservationFieldsSchema = z.object({
  pet_id: z.string().uuid("Invalid pet id"),
  owner_id: z.string().uuid("Invalid owner id"),
  resource_id: z.string().uuid("Invalid resource id").optional().nullable(),
  service_id: z.string().uuid("Invalid service id").optional().nullable(),
  status: reservationStatusSchema,
  check_in_at: z.string().min(1, "Check-in time is required"),
  check_out_at: z.string().min(1, "Check-out time is required"),
  notes: z
    .string()
    .max(1000, "Notes must be 1000 characters or less")
    .optional()
    .nullable(),
})

export const createReservationSchema = reservationFieldsSchema.refine(
  (data) => new Date(data.check_out_at) > new Date(data.check_in_at),
  {
    message: "Check-out time must be after check-in time",
    path: ["check_out_at"],
  }
)

export const updateReservationSchema =
  reservationFieldsSchema.partial().extend({
    id: z.string().uuid("Invalid reservation id"),
  })

export type CreateReservationInput = z.infer<
  typeof createReservationSchema
>

export type UpdateReservationInput = z.infer<
  typeof updateReservationSchema
>

export const deleteReservationSchema = z.object({
  id: z.string().uuid("Invalid reservation id"),
})