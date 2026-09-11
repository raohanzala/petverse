import { z } from "zod"

export const daycareScheduleBaseSchema = z.object({
  pet_id: z.string().uuid("Invalid pet id"),

  day_of_week: z
    .number()
    .int("Day of week must be a whole number")
    .min(0, "Day of week must be between 0 and 6")
    .max(6, "Day of week must be between 0 and 6"),

  start_time: z
    .string()
    .regex(
      /^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/,
      "Invalid start time"
    ),

  end_time: z
    .string()
    .regex(
      /^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/,
      "Invalid end time"
    ),

  is_active: z.boolean(),
})

export const createDaycareScheduleSchema =
  daycareScheduleBaseSchema.refine(
    (data) => data.end_time > data.start_time,
    {
      message: "End time must be after start time",
      path: ["end_time"],
    }
  )

export const updateDaycareScheduleSchema =
  daycareScheduleBaseSchema
    .partial()
    .extend({
      id: z.string().uuid("Invalid schedule id"),
    })
    .refine(
      (data) => {
        if (
          data.start_time === undefined ||
          data.end_time === undefined
        ) {
          return true
        }

        return data.end_time > data.start_time
      },
      {
        message: "End time must be after start time",
        path: ["end_time"],
      }
    )

export type CreateDaycareScheduleInput = z.infer<
  typeof createDaycareScheduleSchema
>

export type UpdateDaycareScheduleInput = z.infer<
  typeof updateDaycareScheduleSchema
>

export const deleteDaycareScheduleSchema = z.object({
  id: z.string().uuid("Invalid schedule id"),
})