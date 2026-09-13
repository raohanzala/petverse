import { z } from "zod"

export const petUpdateImageBaseSchema = z.object({
  daily_update_id: z
    .string()
    .uuid("Invalid daily update id")
    .optional()
    .nullable(),

  pet_id: z
    .string()
    .uuid("Invalid pet id"),

  file_url: z
    .string()
    .min(1, "File URL is required")
    .max(2000, "File URL must be 2000 characters or less"),

  sorted_at: z
    .string()
    .datetime({
      offset: true,
      message: "Invalid sorted date and time",
    })
    .optional()
    .nullable(),
})

export const createPetUpdateImageSchema =
  petUpdateImageBaseSchema

export const updatePetUpdateImageSchema =
  petUpdateImageBaseSchema.partial().extend({
    id: z.string().uuid("Invalid image id"),
  })

export type CreatePetUpdateImageInput =
  z.infer<typeof createPetUpdateImageSchema>

export type UpdatePetUpdateImageInput =
  z.infer<typeof updatePetUpdateImageSchema>

export const deletePetUpdateImageSchema = z.object({
  id: z.string().uuid("Invalid image id"),
})

export const reorderPetUpdateImagesSchema = z.object({
  images: z
    .array(
      z.object({
        id: z.string().uuid("Invalid image id"),
      })
    )
    .min(1, "At least one image is required"),
})

export type ReorderPetUpdateImagesInput =
  z.infer<typeof reorderPetUpdateImagesSchema>