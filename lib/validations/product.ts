import { z } from "zod"

export const productBaseSchema = z.object({
  supplier_id: z
    .string()
    .uuid("Invalid supplier id")
    .optional()
    .nullable(),

  sku: z
    .string()
    .max(100, "SKU must be 100 characters or less")
    .optional()
    .nullable(),

  name: z
    .string()
    .min(1, "Name is required")
    .max(150, "Name must be 150 characters or less"),

  price: z
    .number()
    .min(0, "Price cannot be negative"),

  stock_qty: z
    .number()
    .int("Stock quantity must be a whole number")
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