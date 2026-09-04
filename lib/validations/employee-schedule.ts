import { z } from "zod"

export const employeeScheduleBaseSchema = z.object({
  employee_id: z
    .string()
    .uuid("Invalid employee id"),

  day_of_week: z
    .number()
    .int("Day of week must be a whole number")
    .min(0, "Day of week must be between 0 and 6")
    .max(6, "Day of week must be between 0 and 6"),

  start_time: z
    .string()
    .min(1, "Start time is required"),

  end_time: z
    .string()
    .min(1, "End time is required"),
})

export const createEmployeeScheduleSchema =
  employeeScheduleBaseSchema

export const updateEmployeeScheduleSchema =
  employeeScheduleBaseSchema.partial().extend({
    id: z.string().uuid("Invalid schedule id"),
  })

export type CreateEmployeeScheduleInput = z.infer<
  typeof createEmployeeScheduleSchema
>

export type UpdateEmployeeScheduleInput = z.infer<
  typeof updateEmployeeScheduleSchema
>

export const deleteEmployeeScheduleSchema = z.object({
  id: z.string().uuid("Invalid schedule id"),
})