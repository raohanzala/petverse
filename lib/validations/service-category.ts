import { z } from "zod"

const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

export const serviceCategorySlugSchema = z
  .string()
  .min(1, "Slug is required")
  .max(80, "Slug must be 80 characters or less")
  .regex(slugRegex, "Use lowercase letters, numbers, and hyphens only")

export const serviceCategoryBaseSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(100, "Name must be 100 characters or less"),
  slug: serviceCategorySlugSchema,
  description: z
    .string()
    .max(500, "Description must be 500 characters or less")
    .optional()
    .nullable(),
  sort_order: z
    .number()
    .int("Sort order must be a whole number")
    .min(0, "Sort order cannot be negative"),
  is_active: z.boolean(),
})

export const createServiceCategorySchema = serviceCategoryBaseSchema

export const updateServiceCategorySchema = serviceCategoryBaseSchema.partial().extend({
  id: z.string().uuid("Invalid category id"),
})

export type CreateServiceCategoryInput = z.infer<typeof createServiceCategorySchema>
export type UpdateServiceCategoryInput = z.infer<typeof updateServiceCategorySchema>

export const deleteServiceCategorySchema = z.object({
  id: z.string().uuid("Invalid category id"),
})
