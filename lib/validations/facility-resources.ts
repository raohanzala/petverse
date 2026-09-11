import { z } from "zod"

export const facilityResourceTypeSchema = z.enum([
  "kennel",
  "suite",
  "playroom",
  "other",
])

export const facilityResourceBaseSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(100, "Name must be 100 characters or less"),

  type: facilityResourceTypeSchema,

  column_label: z
    .string()
    .max(20, "Column label must be 20 characters or less")
    .optional()
    .nullable(),

  row_number: z
    .number()
    .int("Row number must be a whole number")
    .min(1, "Row number must be at least 1")
    .optional()
    .nullable(),

  capacity: z
    .number()
    .int("Capacity must be a whole number")
    .min(1, "Capacity must be at least 1"),

  is_active: z.boolean(),
})

export const createFacilityResourceSchema =
  facilityResourceBaseSchema

export const updateFacilityResourceSchema =
  facilityResourceBaseSchema.partial().extend({
    id: z.string().uuid("Invalid resource id"),
  })

export type CreateFacilityResourceInput = z.infer<
  typeof createFacilityResourceSchema
>

export type UpdateFacilityResourceInput = z.infer<
  typeof updateFacilityResourceSchema
>

export const deleteFacilityResourceSchema = z.object({
  id: z.string().uuid("Invalid resource id"),
})