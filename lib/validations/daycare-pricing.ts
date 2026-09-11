import { z } from "zod"

export const daycarePricingBaseSchema = z.object({
  full_day_price: z
    .number()
    .min(0, "Full day price cannot be negative"),

  half_day_price: z
    .number()
    .min(0, "Half day price cannot be negative"),
})

export const createDaycarePricingSchema = daycarePricingBaseSchema

export const updateDaycarePricingSchema = daycarePricingBaseSchema
  .partial()
  .extend({
    id: z.string().uuid("Invalid pricing id"),
  })

export type CreateDaycarePricingInput = z.infer<
  typeof createDaycarePricingSchema
>

export type UpdateDaycarePricingInput = z.infer<
  typeof updateDaycarePricingSchema
>