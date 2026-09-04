import { z } from "zod"

export const employeeBaseSchema = z.object({
  user_id: z
    .string()
    .uuid("Invalid user id")
    .optional()
    .nullable(),

  display_name: z
    .string()
    .min(1, "Display name is required")
    .max(100, "Display name must be 100 characters or less"),

  initials: z
    .string()
    .max(10, "Initials must be 10 characters or less")
    .optional()
    .nullable(),

  avatar_url: z
    .string()
    .url("Avatar URL must be a valid URL")
    .max(500, "Avatar URL must be 500 characters or less")
    .optional()
    .nullable(),

  role: z.enum([
    "admin",
    "manager",
    "groomer",
    "veterinarian",
    "boarding_attendant",
  ]),

  job_title: z
    .string()
    .max(100, "Job title must be 100 characters or less")
    .optional()
    .nullable(),

  color: z
    .string()
    .max(50, "Color must be 50 characters or less")
    .optional()
    .nullable(),

  is_active: z.boolean(),
})

export const createEmployeeSchema = employeeBaseSchema

export const updateEmployeeSchema =
  employeeBaseSchema.partial().extend({
    id: z.string().uuid("Invalid employee id"),
  })

export type CreateEmployeeInput = z.infer<
  typeof createEmployeeSchema
>

export type UpdateEmployeeInput = z.infer<
  typeof updateEmployeeSchema
>

export const deleteEmployeeSchema = z.object({
  id: z.string().uuid("Invalid employee id"),
})