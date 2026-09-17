import { z } from "zod"

export const productBaseSchema = z.object({
  supplier_id: z.string().uuid().nullable(),

  sku: z.string().optional(),

  name: z
    .string()
    .min(1, "Product name is required"),

  brand: z.string().optional(),

  category: z.string().optional(),

  retail_price: z
    .number()
    .min(0, "Retail price cannot be negative"),

  cost_price: z
    .number()
    .min(0, "Cost price cannot be negative"),

  stock_qty: z
    .number()
    .int()
    .min(0, "Stock quantity cannot be negative"),

  is_active: z.boolean(),
})

export const createProductSchema =
  productBaseSchema

export const updateProductSchema =
  productBaseSchema.partial().extend({
    id: z.string().uuid("Invalid product id"),
  })

export type CreateProductInput =
  z.infer<typeof createProductSchema>

export type UpdateProductInput =
  z.infer<typeof updateProductSchema>

export const deleteProductSchema = z.object({
  id: z.string().uuid("Invalid product id"),
})