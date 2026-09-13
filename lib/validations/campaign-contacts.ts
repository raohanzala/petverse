import { z } from "zod"

export const campaignContactStatusSchema = z.enum([
  "pending",
  "sent",
  "delivered",
  "failed",
  "unsubscribed",
])

export const campaignContactBaseSchema = z.object({
  campaign_id: z.string().uuid("Invalid campaign id"),

  owner_id: z.string().uuid("Invalid owner id"),

  status: campaignContactStatusSchema,

  sent_at: z
    .string()
    .datetime({
      offset: true,
      message: "Invalid sent date and time",
    })
    .optional()
    .nullable(),
})

export const createCampaignContactSchema =
  campaignContactBaseSchema

export const updateCampaignContactSchema =
  campaignContactBaseSchema.partial().extend({
    id: z.string().uuid("Invalid campaign contact id"),
  })

export type CreateCampaignContactInput =
  z.infer<typeof createCampaignContactSchema>

export type UpdateCampaignContactInput =
  z.infer<typeof updateCampaignContactSchema>

export const deleteCampaignContactSchema =
  z.object({
    id: z.string().uuid("Invalid campaign contact id"),
  })