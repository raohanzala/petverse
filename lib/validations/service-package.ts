import { z } from "zod"

export const servicePackageBaseSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(100, "Name must be 100 characters or less"),

  description: z
    .string()
    .max(500, "Description must be 500 characters or less")
    .optional()
    .nullable(),

  price: z
    .number()
    .min(0, "Price cannot be negative"),

  duration_minutes: z
    .number()
    .int("Duration must be a whole number")
    .positive("Duration must be greater than 0"),

  step_mode: z.enum(
    ["sequential", "parallel"],
    {
      message: "Invalid package step mode",
    }
  ),

  is_active: z.boolean(),
})

export const createServicePackageSchema =
  servicePackageBaseSchema

export const updateServicePackageSchema =
  servicePackageBaseSchema.partial().extend({
    id: z.number().int().positive("Invalid package id"),
  })

export type CreateServicePackageInput =
  z.infer<typeof createServicePackageSchema>

export type UpdateServicePackageInput =
  z.infer<typeof updateServicePackageSchema>

export const deleteServicePackageSchema = z.object({
  id: z.number().int().positive("Invalid package id"),
})