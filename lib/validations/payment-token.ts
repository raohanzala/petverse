import { z } from "zod"

export const paymentTokenBaseSchema = z.object({
  invoice_id: z.string().uuid("Invalid invoice id"),

  expires_at: z
    .string()
    .datetime("Invalid expiration date"),

  used_at: z
    .string()
    .datetime("Invalid used date")
    .optional()
    .nullable(),
})

export const createPaymentTokenSchema =
  paymentTokenBaseSchema

export const updatePaymentTokenSchema =
  paymentTokenBaseSchema.partial().extend({
    id: z.string().uuid("Invalid payment link id"),
  })

export type CreatePaymentTokenInput =
  z.infer<typeof createPaymentTokenSchema>

export type UpdatePaymentTokenInput =
  z.infer<typeof updatePaymentTokenSchema>

export const deletePaymentTokenSchema =
  z.object({
    id: z.string().uuid("Invalid payment link id"),
  })