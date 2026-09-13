import { z } from "zod"

export const supplierBaseSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(100, "Name must be 100 characters or less"),

  contact_name: z
    .string()
    .max(
      100,
      "Contact name must be 100 characters or less"
    )
    .optional()
    .nullable(),

  email: z
    .string()
    .email("Invalid email address")
    .max(
      255,
      "Email must be 255 characters or less"
    )
    .optional()
    .nullable(),

  phone: z
    .string()
    .max(
      30,
      "Phone must be 30 characters or less"
    )
    .optional()
    .nullable(),

  notes: z
    .string()
    .max(
      1000,
      "Notes must be 1000 characters or less"
    )
    .optional()
    .nullable(),

  is_active: z.boolean(),
})

export const createSupplierSchema =
  supplierBaseSchema

export const updateSupplierSchema =
  supplierBaseSchema.partial().extend({
    id: z.string().uuid("Invalid supplier id"),
  })

export type CreateSupplierInput =
  z.infer<typeof createSupplierSchema>

export type UpdateSupplierInput =
  z.infer<typeof updateSupplierSchema>

export const deleteSupplierSchema = z.object({
  id: z.string().uuid("Invalid supplier id"),
})