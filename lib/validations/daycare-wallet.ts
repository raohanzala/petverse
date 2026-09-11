import { z } from "zod"

export const daycareWalletBaseSchema = z.object({
  owner_id: z.string().uuid("Invalid owner id"),

  pet_id: z
    .string()
    .uuid("Invalid pet id")
    .nullable()
    .optional(),

  package_id: z.string().uuid("Invalid package id"),

  visits_remaining: z
    .number()
    .int("Visits remaining must be a whole number")
    .min(0, "Visits remaining cannot be negative"),

  expires_at: z
    .string()
    .datetime("Invalid expiration date")
    .nullable()
    .optional(),
})

export const createDaycareWalletSchema =
  daycareWalletBaseSchema

export const updateDaycareWalletSchema =
  daycareWalletBaseSchema.partial().extend({
    id: z.string().uuid("Invalid wallet id"),
  })

export type CreateDaycareWalletInput = z.infer<
  typeof createDaycareWalletSchema
>

export type UpdateDaycareWalletInput = z.infer<
  typeof updateDaycareWalletSchema
>

export const deleteDaycareWalletSchema = z.object({
  id: z.string().uuid("Invalid wallet id"),
})