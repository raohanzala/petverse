import { z } from "zod"

export const roomTransferBaseSchema = z.object({
  reservation_id: z.string().uuid("Invalid reservation id"),

  from_resource_id: z
    .string()
    .uuid("Invalid source resource id")
    .nullable()
    .optional(),

  to_resource_id: z.string().uuid("Invalid destination resource id"),

  transferred_at: z.string().datetime(
    "Invalid transfer date and time"
  ),

  notes: z
    .string()
    .max(
      1000,
      "Notes must be 1000 characters or less"
    )
    .optional()
    .nullable(),
})

export const createRoomTransferSchema =
  roomTransferBaseSchema

export const updateRoomTransferSchema =
  roomTransferBaseSchema.partial().extend({
    id: z.string().uuid("Invalid room transfer id"),
  })

export type CreateRoomTransferInput =
  z.infer<typeof createRoomTransferSchema>

export type UpdateRoomTransferInput =
  z.infer<typeof updateRoomTransferSchema>

export const deleteRoomTransferSchema = z.object({
  id: z.string().uuid("Invalid room transfer id"),
})