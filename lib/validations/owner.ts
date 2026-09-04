import { z } from "zod"

export const ownerBaseSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(100, "Name must be 100 characters or less"),

  phone: z
    .string()
    .min(1, "Phone is required")
    .max(30, "Phone must be 30 characters or less"),

  email: z
    .string()
    .email("Invalid email address")
    .max(255, "Email must be 255 characters or less")
    .optional()
    .nullable(),

  preferred_contact: z
    .string()
    .max(50, "Preferred contact must be 50 characters or less")
    .optional()
    .nullable(),
})

export const createOwnerSchema = ownerBaseSchema

export const updateOwnerSchema =
  ownerBaseSchema.partial().extend({
    id: z.string().uuid("Invalid owner id"),
  })

export type CreateOwnerInput = z.infer<
  typeof createOwnerSchema
>

export type UpdateOwnerInput = z.infer<
  typeof updateOwnerSchema
>

export const deleteOwnerSchema = z.object({
  id: z.string().uuid("Invalid owner id"),
})