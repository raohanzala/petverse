import { z } from "zod"

export const campaignStatusSchema = z.enum([
  "draft",
  "scheduled",
  "running",
  "completed",
  "cancelled",
])

export const outboundCampaignBaseSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(100, "Name must be 100 characters or less"),

  channel: z
    .string()
    .min(1, "Channel is required")
    .max(50, "Channel must be 50 characters or less"),

  status: campaignStatusSchema,

  scheduled_at: z
    .string()
    .datetime({
      offset: true,
      message: "Invalid scheduled date and time",
    })
    .optional()
    .nullable(),
})

export const createOutboundCampaignSchema =
  outboundCampaignBaseSchema

export const updateOutboundCampaignSchema =
  outboundCampaignBaseSchema.partial().extend({
    id: z.string().uuid("Invalid campaign id"),
  })

export type CreateOutboundCampaignInput =
  z.infer<typeof createOutboundCampaignSchema>

export type UpdateOutboundCampaignInput =
  z.infer<typeof updateOutboundCampaignSchema>

export const deleteOutboundCampaignSchema =
  z.object({
    id: z.string().uuid("Invalid campaign id"),
  })