import { z } from "zod"

export const depositBaseSchema = z.object({
  owner_id: z.string().uuid("Invalid owner id"),

  appointment_id: z
    .string()
    .uuid("Invalid appointment id")
    .optional()
    .nullable(),

  invoice_id: z
    .string()
    .uuid("Invalid invoice id")
    .optional()
    .nullable(),

  amount: z
    .number()
    .positive("Amount must be greater than 0")
    .max(
      99999999.99,
      "Amount is too high"
    ),

  paid_at: z
    .string()
    .datetime("Invalid payment date")
    .optional()
    .nullable(),

  provider_ref: z
    .string()
    .trim()
    .max(
      255,
      "Provider reference must be 255 characters or less"
    )
    .optional()
    .nullable(),
})

export const createDepositSchema =
  depositBaseSchema

export const updateDepositSchema =
  depositBaseSchema.partial().extend({
    id: z.string().uuid("Invalid deposit id"),
  })

export type CreateDepositInput =
  z.infer<typeof createDepositSchema>

export type UpdateDepositInput =
  z.infer<typeof updateDepositSchema>

export const deleteDepositSchema = z.object({
  id: z.string().uuid("Invalid deposit id"),
})