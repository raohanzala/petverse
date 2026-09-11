import { z } from "zod"

export const boardingInstructionsBaseSchema = z.object({
  pet_id: z.string().uuid("Invalid pet id"),
  reservation_id: z
    .string()
    .uuid("Invalid reservation id")
    .nullable()
    .optional(),
  feeding_notes: z
    .string()
    .max(
      1000,
      "Feeding notes must be 1000 characters or less"
    )
    .nullable()
    .optional(),
  medication_notes: z
    .string()
    .max(
      1000,
      "Medication notes must be 1000 characters or less"
    )
    .nullable()
    .optional(),
  behavior_notes: z
    .string()
    .max(
      1000,
      "Behavior notes must be 1000 characters or less"
    )
    .nullable()
    .optional(),
})

export const createBoardingInstructionsSchema =
  boardingInstructionsBaseSchema

export const updateBoardingInstructionsSchema =
  boardingInstructionsBaseSchema.partial().extend({
    id: z.string().uuid("Invalid instructions id"),
  })

export type CreateBoardingInstructionsInput =
  z.infer<typeof createBoardingInstructionsSchema>

export type UpdateBoardingInstructionsInput =
  z.infer<typeof updateBoardingInstructionsSchema>

export const deleteBoardingInstructionsSchema = z.object({
  id: z.string().uuid("Invalid instructions id"),
})