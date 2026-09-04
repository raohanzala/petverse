import { z } from "zod"

export const petBaseSchema = z.object({
  owner_id: z
    .string()
    .uuid("Invalid owner id"),

  name: z
    .string()
    .min(1, "Name is required")
    .max(100, "Name must be 100 characters or less"),

  species: z
    .string()
    .min(1, "Species is required")
    .max(50, "Species must be 50 characters or less"),

  breed: z
    .string()
    .max(100, "Breed must be 100 characters or less")
    .optional()
    .nullable(),

  birth_date: z
    .string()
    .optional()
    .nullable(),

  weight_kg: z
    .number()
    .min(0, "Weight cannot be negative")
    .max(9999.99, "Weight is too large")
    .optional()
    .nullable(),

  color: z
    .string()
    .max(100, "Color must be 100 characters or less")
    .optional()
    .nullable(),

  notes: z
    .string()
    .max(1000, "Notes must be 1000 characters or less")
    .optional()
    .nullable(),

  is_active: z.boolean(),
})

export const createPetSchema = petBaseSchema

export const updatePetSchema =
  petBaseSchema.partial().extend({
    id: z.string().uuid("Invalid pet id"),
  })

export type CreatePetInput = z.infer<
  typeof createPetSchema
>

export type UpdatePetInput = z.infer<
  typeof updatePetSchema
>

export const deletePetSchema = z.object({
  id: z.string().uuid("Invalid pet id"),
})