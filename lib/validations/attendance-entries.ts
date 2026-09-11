import { z } from "zod"

const attendanceEntryObjectSchema = z.object({
  reservation_id: z.string().uuid("Invalid reservation"),

  type: z.enum([
    "check_in",
    "check_out",
    "note",
    "incident",
  ]),

  recorded_by: z
    .string()
    .uuid("Invalid employee")
    .nullable()
    .optional(),

  flags: z
    .array(z.string())
    .default([]),

  notes: z
    .string()
    .max(1000, "Notes must be 1000 characters or less")
    .nullable()
    .optional(),
})

export const createAttendanceEntrySchema =
  attendanceEntryObjectSchema

export const updateAttendanceEntrySchema =
  attendanceEntryObjectSchema.partial().extend({
    id: z.string().uuid("Invalid attendance entry id"),
  })

export const deleteAttendanceEntrySchema = z.object({
  id: z.string().uuid("Invalid attendance entry id"),
})

export type CreateAttendanceEntryInput =
  z.input<typeof createAttendanceEntrySchema>

export type UpdateAttendanceEntryInput =
  z.infer<typeof updateAttendanceEntrySchema>