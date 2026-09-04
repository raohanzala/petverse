import { z } from "zod"

export const serviceBaseSchema = z.object({
  category_id: z
    .string()
    .uuid("Invalid category id")
    .optional()
    .nullable(),

  name: z
    .string()
    .min(1, "Name is required")
    .max(100, "Name must be 100 characters or less"),

  description: z
    .string()
    .max(500, "Description must be 500 characters or less")
    .optional()
    .nullable(),

  kind: z.enum(
    ["grooming", "veterinary", "boarding", "daycare", "other"],
    {
      message: "Invalid service kind",
    }
  ),

  duration_minutes: z
    .number()
    .int("Duration must be a whole number")
    .positive("Duration must be greater than 0"),

  price: z
    .number()
    .min(0, "Price cannot be negative"),

  is_active: z.boolean(),

  is_public: z.boolean(),
})

export const createServiceSchema = serviceBaseSchema

export const updateServiceSchema = serviceBaseSchema.partial().extend({
  id: z.string().uuid("Invalid service id"),
})

export type CreateServiceInput = z.infer<typeof createServiceSchema>
export type UpdateServiceInput = z.infer<typeof updateServiceSchema>

export const deleteServiceSchema = z.object({
  id: z.string().uuid("Invalid service id"),
})