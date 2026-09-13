import { z } from "zod"

export const vaccineTypeBaseSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(100, "Name must be 100 characters or less"),

  species: z
    .string()
    .max(50, "Species must be 50 characters or less")
    .optional()
    .nullable(),

  interval_months: z
    .number()
    .int("Interval must be a whole number")
    .min(1, "Interval must be greater than 0")
    .optional()
    .nullable(),

  is_active: z.boolean(),
})

export const createVaccineTypeSchema =
  vaccineTypeBaseSchema

export const updateVaccineTypeSchema =
  vaccineTypeBaseSchema.partial().extend({
    id: z.string().uuid("Invalid vaccine type id"),
  })

export type CreateVaccineTypeInput =
  z.infer<typeof createVaccineTypeSchema>

export type UpdateVaccineTypeInput =
  z.infer<typeof updateVaccineTypeSchema>

export const deleteVaccineTypeSchema =
  z.object({
    id: z.string().uuid("Invalid vaccine type id"),
  })