import { z } from "zod"

export const invoiceLineItemSchema = z.object({
  id: z.string().uuid().optional(),
  appointment_id: z.string().uuid().optional().nullable(),
  product_id: z.string().uuid().optional().nullable(),
  description: z
    .string()
    .trim()
    .min(1, "Description is required")
    .max(500, "Description must be 500 characters or less"),
  quantity: z
    .number()
    .int("Quantity must be a whole number")
    .positive("Quantity must be greater than 0"),
  unit_price: z
    .number()
    .min(0, "Unit price cannot be negative")
    .max(99999999.99, "Unit price is too high"),
  total: z
    .number()
    .min(0, "Total cannot be negative")
    .max(9999999999.99, "Total is too high"),
})

export type InvoiceLineItemFormValues = z.infer<
  typeof invoiceLineItemSchema
>