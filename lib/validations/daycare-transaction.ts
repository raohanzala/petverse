import { z } from "zod"

export const daycareTransactionStatusSchema = z.enum([
  "scheduled",
  "checked_in",
  "checked_out",
  "cancelled",
])

export const daycareTransactionBaseSchema = z.object({
  pet_id: z.string().uuid("Invalid pet id"),

  owner_id: z.string().uuid("Invalid owner id"),

  wallet_id: z
    .string()
    .uuid("Invalid wallet id")
    .nullable()
    .optional(),

  status: daycareTransactionStatusSchema,

  scheduled_at: z
  .string()
  .datetime("Invalid scheduled date")
  .nullable()
  .optional(),

  check_in_at: z
    .string()
    .datetime("Invalid check-in date")
    .nullable()
    .optional(),

  check_out_at: z
    .string()
    .datetime("Invalid check-out date")
    .nullable()
    .optional(),

  amount: z
    .number()
    .min(0, "Amount cannot be negative")
    .max(99999999.99, "Amount is too high")
    .nullable()
    .optional(),

  notes: z
    .string()
    .max(1000, "Notes must be 1000 characters or less")
    .nullable()
    .optional(),
})

export const createDaycareTransactionSchema =
  daycareTransactionBaseSchema

export const updateDaycareTransactionSchema =
  daycareTransactionBaseSchema.partial().extend({
    id: z.string().uuid("Invalid transaction id"),
  })

export type CreateDaycareTransactionInput = z.infer<
  typeof createDaycareTransactionSchema
>

export type UpdateDaycareTransactionInput = z.infer<
  typeof updateDaycareTransactionSchema
>

export const deleteDaycareTransactionSchema = z.object({
  id: z.string().uuid("Invalid transaction id"),
})