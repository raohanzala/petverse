import { z } from "zod"

const appointmentFields = {
  owner_id: z.string().uuid("Invalid owner id"),

  pet_id: z.string().uuid("Invalid pet id"),

  service_id: z
    .string()
    .uuid("Invalid service id")
    .optional()
    .nullable(),

  package_id: z
    .string()
    .uuid("Invalid package id")
    .optional()
    .nullable(),

  employee_id: z
    .string()
    .uuid("Invalid employee id")
    .optional()
    .nullable(),

  preferred_employee_id: z
    .string()
    .uuid("Invalid preferred employee id")
    .optional()
    .nullable(),

  status: z.enum([
    "requested",
    "confirmed",
    "arrived",
    "in_service",
    "completed",
    "cancelled",
    "no_show",
  ]),

  source: z.enum(["online", "admin", "phone"]),

  starts_at: z.string().min(1, "Start time is required"),

  ends_at: z.string().min(1, "End time is required"),

  duration_minutes: z
    .number()
    .int("Duration must be a whole number")
    .positive("Duration must be greater than 0"),

  price: z.number().min(0, "Price cannot be negative"),

  group_id: z
    .string()
    .uuid("Invalid group id")
    .optional()
    .nullable(),

  step_order: z
    .number()
    .int("Step order must be a whole number")
    .min(1, "Step order must be at least 1")
    .optional()
    .nullable(),

  notes: z
    .string()
    .max(1000, "Notes must be 1000 characters or less")
    .optional()
    .nullable(),

  cancelled_at: z.string().optional().nullable(),

  cancel_reason: z
    .string()
    .max(500, "Cancel reason must be 500 characters or less")
    .optional()
    .nullable(),
}

const appointmentObjectSchema = z.object(appointmentFields)

export const appointmentBaseSchema = appointmentObjectSchema.refine(
  (data) =>
    (data.service_id !== null && data.service_id !== undefined) ||
    (data.package_id !== null && data.package_id !== undefined),
  {
    message: "Select a service or package",
    path: ["service_id"],
  }
)

export const createAppointmentSchema = appointmentBaseSchema

export const updateAppointmentSchema =
  appointmentObjectSchema.partial().extend({
    id: z.string().uuid("Invalid appointment id"),
  })

export type CreateAppointmentInput =
  z.infer<typeof createAppointmentSchema>

export type UpdateAppointmentInput =
  z.infer<typeof updateAppointmentSchema>

export const deleteAppointmentSchema = z.object({
  id: z.string().uuid("Invalid appointment id"),
})