import { z } from "zod"

export const invoiceStatusSchema = z.enum([
  "draft",
  "open",
  "paid",
  "void",
])

export const invoiceLineItemInputSchema = z.object({
  id: z.string().uuid().optional(),
  appointment_id: z
    .string()
    .uuid("Invalid appointment id")
    .optional()
    .nullable(),
  product_id: z
    .string()
    .uuid("Invalid product id")
    .optional()
    .nullable(),
  description: z
    .string()
    .trim()
    .min(1, "Description is required")
    .max(500, "Description is too long"),
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
    .min(0, "Total cannot be negative"),
})

export const invoiceBaseSchema = z.object({
  owner_id: z.string().uuid("Invalid owner id"),

  appointment_id: z
    .string()
    .uuid("Invalid appointment id")
    .optional()
    .nullable(),

  number: z
    .number()
    .int("Invoice number must be a whole number")
    .positive("Invoice number must be positive")
    .optional()
    .nullable(),

  status: invoiceStatusSchema,

  subtotal: z
    .number()
    .min(0, "Subtotal cannot be negative"),

  tax: z
    .number()
    .min(0, "Tax cannot be negative"),

  total: z
    .number()
    .min(0, "Total cannot be negative"),

  currency: z
    .string()
    .min(1, "Currency is required")
    .max(10, "Currency must be 10 characters or less"),

  issued_at: z.string().datetime().optional().nullable(),

  paid_at: z.string().datetime().optional().nullable(),

  voided_at: z.string().datetime().optional().nullable(),

  notes: z
    .string()
    .max(1000, "Notes must be 1000 characters or less")
    .optional()
    .nullable(),

  line_items: z
    .array(invoiceLineItemInputSchema)
    .default([]),
})

export const createInvoiceSchema = invoiceBaseSchema

export const updateInvoiceSchema = invoiceBaseSchema.partial().extend({
  id: z.string().uuid("Invalid invoice id"),
})

export type CreateInvoiceInput = z.input<
  typeof createInvoiceSchema
>

export type CreateInvoiceOutput = z.output<
  typeof createInvoiceSchema
>

export type UpdateInvoiceInput = z.infer<
  typeof updateInvoiceSchema
>

export const deleteInvoiceSchema = z.object({
  id: z.string().uuid("Invalid invoice id"),
})