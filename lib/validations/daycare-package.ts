import { z } from "zod"

export const daycarePackageBaseSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(100, "Name must be 100 characters or less"),

  visit_count: z
    .number()
    .int("Visit count must be a whole number")
    .min(1, "Visit count must be at least 1"),

  price: z
    .number()
    .min(0, "Price cannot be negative")
    .max(99999999.99, "Price is too high"),

  valid_days: z
    .number()
    .int("Valid days must be a whole number")
    .min(1, "Valid days must be at least 1")
    .max(3650, "Valid days is too high")
    .nullable()
    .optional(),

  is_active: z.boolean(),
})

export const createDaycarePackageSchema =
  daycarePackageBaseSchema

export const updateDaycarePackageSchema =
  daycarePackageBaseSchema.partial().extend({
    id: z.string().uuid("Invalid package id"),
  })

export type CreateDaycarePackageInput = z.infer<
  typeof createDaycarePackageSchema
>

export type UpdateDaycarePackageInput = z.infer<
  typeof updateDaycarePackageSchema
>

export const deleteDaycarePackageSchema = z.object({
  id: z.string().uuid("Invalid package id"),
})