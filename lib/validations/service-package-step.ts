import { z } from "zod"

export const servicePackageStepBaseSchema = z.object({
  package_id: z
    .number()
    .int("Package id must be a whole number")
    .positive("Invalid package id"),

  service_id: z
    .string()
    .uuid("Invalid service id"),

  step_order: z
    .number()
    .int("Step order must be a whole number")
    .min(1, "Step order must be at least 1"),

  parallel_group: z
    .number()
    .int("Parallel group must be a whole number")
    .positive("Parallel group must be greater than 0")
    .optional()
    .nullable(),

  override_duration_minutes: z
    .number()
    .int("Override duration must be a whole number")
    .positive("Override duration must be greater than 0")
    .optional()
    .nullable(),

  override_price: z
    .number()
    .min(0, "Override price cannot be negative")
    .optional()
    .nullable(),
})

export const createServicePackageStepSchema =
  servicePackageStepBaseSchema

export const updateServicePackageStepSchema =
  servicePackageStepBaseSchema.partial().extend({
    id: z.string().uuid("Invalid package step id"),
  })

export type CreateServicePackageStepInput =
  z.infer<typeof createServicePackageStepSchema>

export type UpdateServicePackageStepInput =
  z.infer<typeof updateServicePackageStepSchema>

export const deleteServicePackageStepSchema = z.object({
  id: z.string().uuid("Invalid package step id"),
})