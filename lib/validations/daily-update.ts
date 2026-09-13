import { z } from "zod"

export const dailyUpdateBaseSchema = z.object({
  pet_id: z.string().uuid("Invalid pet"),
  appointment_id: z.string().uuid("Invalid appointment").nullable(),
  author_id: z.string().uuid("Invalid author").nullable(),
  body: z
    .string()
    .trim()
    .min(1, "Update message is required"),
  sent_to_owner_at: z
    .string()
    .datetime({
      offset: true,
      message: "Invalid sent date and time",
    })
    .nullable(),
})

export const createDailyUpdateSchema =
  dailyUpdateBaseSchema

export const updateDailyUpdateSchema =
  dailyUpdateBaseSchema.partial().extend({
    id: z.string().uuid("Invalid daily update"),
  })

export const deleteDailyUpdateSchema = z.object({
  id: z.string().uuid("Invalid daily update"),
})

export type CreateDailyUpdateInput =
  z.infer<typeof createDailyUpdateSchema>

export type UpdateDailyUpdateInput =
  z.infer<typeof updateDailyUpdateSchema>