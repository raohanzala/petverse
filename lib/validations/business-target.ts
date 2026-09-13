import { z } from "zod"

export const businessTargetBaseSchema = z
  .object({
    metric_key: z
      .string()
      .trim()
      .min(1, "Metric is required")
      .max(100, "Metric must be 100 characters or less"),

    target_value: z
      .number()
      .nonnegative("Target value must be 0 or greater"),

    period_start: z
      .string()
      .date("Invalid start date"),

    period_end: z
      .string()
      .date("Invalid end date"),

    notes: z
      .string()
      .trim()
      .max(1000, "Notes must be 1000 characters or less")
      .nullable()
      .optional(),
  })
  .refine(
    (data) => data.period_end >= data.period_start,
    {
      message: "Period end must be on or after period start",
      path: ["period_end"],
    }
  )

  const businessTargetFields = {
  metric_key: z.string().trim().min(1, "Metric is required"),

  target_value: z.coerce
    .number()
    .min(0, "Target value cannot be negative"),

  period_start: z.string().min(1, "Start date is required"),

  period_end: z.string().min(1, "End date is required"),

  notes: z.string().optional(),
}

export const createBusinessTargetSchema =
  businessTargetBaseSchema

export const updateBusinessTargetSchema = z
  .object({
    id: z.string().uuid("Invalid business target id"),
    ...businessTargetFields,
  })
  .refine(
    (data) => data.period_end >= data.period_start,
    {
      message: "End date must be on or after start date",
      path: ["period_end"],
    }
  )

export const deleteBusinessTargetSchema = z.object({
  id: z.string().uuid("Invalid business target id"),
})

export type CreateBusinessTargetInput =
  z.infer<typeof createBusinessTargetSchema>

export type UpdateBusinessTargetInput =
  z.infer<typeof updateBusinessTargetSchema>