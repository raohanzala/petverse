import { z } from "zod"

const boardingWaitlistObjectSchema = z.object({
  pet_id: z.string().uuid("Invalid pet id"),

  owner_id: z.string().uuid("Invalid owner id"),

  desired_from: z
    .string()
    .min(1, "Start date and time are required"),

  desired_to: z
    .string()
    .min(1, "End date and time are required"),

  notes: z
    .string()
    .max(
      1000,
      "Notes must be 1000 characters or less"
    )
    .optional()
    .nullable(),
})

export const boardingWaitlistBaseSchema =
  boardingWaitlistObjectSchema.refine(
    (data) =>
      new Date(data.desired_to).getTime() >
      new Date(data.desired_from).getTime(),
    {
      message:
        "End date and time must be after the start date and time",
      path: ["desired_to"],
    }
  )

export const createBoardingWaitlistSchema =
  boardingWaitlistBaseSchema

export const updateBoardingWaitlistSchema =
  boardingWaitlistObjectSchema
    .partial()
    .extend({
      id: z.string().uuid("Invalid waitlist id"),
    })

export type CreateBoardingWaitlistInput =
  z.infer<typeof createBoardingWaitlistSchema>

export type UpdateBoardingWaitlistInput =
  z.infer<typeof updateBoardingWaitlistSchema>

export const deleteBoardingWaitlistSchema =
  z.object({
    id: z.string().uuid("Invalid waitlist id"),
  })