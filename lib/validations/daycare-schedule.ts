import { z } from "zod"

export const daycareScheduleBaseSchema = z.object({
  pet_id: z.string().uuid("Invalid pet id"),

  owner_id: z.string().uuid("Invalid owner id"),

  resource_id: z.string().uuid().nullable(),

  days_of_week: z
    .array(z.number().int().min(0).max(6))
    .min(1, "Select at least one day"),

  starts_at: z.string().min(
    1,
    "Start date and time is required"
  ),

  ends_at: z.string().min(
    1,
    "End date and time is required"
  ),

  is_active: z.boolean(),
})

export const createDaycareScheduleSchema =
  daycareScheduleBaseSchema.refine(
    (data) => {
      return new Date(data.ends_at) > new Date(data.starts_at)
    },
    {
      message:
        "End date and time must be after start date and time",
      path: ["ends_at"],
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
          data.starts_at === undefined ||
          data.ends_at === undefined
        ) {
          return true
        }

        return (
          new Date(data.ends_at) >
          new Date(data.starts_at)
        )
      },
      {
        message: "End date and time must be after start date and time",
        path: ["ends_at"],
      }
    )

export type CreateDaycareScheduleInput =
  z.infer<typeof createDaycareScheduleSchema>

export type UpdateDaycareScheduleInput =
  z.infer<typeof updateDaycareScheduleSchema>

export const deleteDaycareScheduleSchema = z.object({
  id: z.string().uuid("Invalid schedule id"),
})