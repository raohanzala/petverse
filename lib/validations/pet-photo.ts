import { z } from "zod"

export const petPhotoBaseSchema = z.object({
  pet_id: z
    .string()
    .uuid("Invalid pet id"),

  file_url: z
    .string()
    .min(1, "File URL is required")
    .max(2000, "File URL must be 2000 characters or less"),

  caption: z
    .string()
    .max(500, "Caption must be 500 characters or less")
    .optional()
    .nullable(),
})

export const createPetPhotoSchema =
  petPhotoBaseSchema

export const updatePetPhotoSchema =
  petPhotoBaseSchema.partial().extend({
    id: z.string().uuid("Invalid photo id"),
  })

export type CreatePetPhotoInput =
  z.infer<typeof createPetPhotoSchema>

export type UpdatePetPhotoInput =
  z.infer<typeof updatePetPhotoSchema>

export const deletePetPhotoSchema = z.object({
  id: z.string().uuid("Invalid photo id"),
})