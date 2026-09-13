import { z } from "zod"

const campaignBlackoutPeriodObjectSchema = z.object({
  campaign_id: z.string().uuid("Invalid campaign id"),

  starts_at: z.string().min(1, "Start date and time are required"),

  ends_at: z.string().min(1, "End date and time are required"),
})

export const campaignBlackoutPeriodBaseSchema =
  campaignBlackoutPeriodObjectSchema.refine(
    (data) =>
      new Date(data.ends_at).getTime() >
      new Date(data.starts_at).getTime(),
    {
      message: "End date and time must be after the start date and time",
      path: ["ends_at"],
    },
  )

export const createCampaignBlackoutPeriodSchema =
  campaignBlackoutPeriodBaseSchema

export const updateCampaignBlackoutPeriodSchema =
  campaignBlackoutPeriodObjectSchema
    .partial()
    .extend({
      id: z.string().uuid("Invalid blackout period id"),
    })
    .refine(
      (data) => {
        // Only validate the date relationship when both values exist
        if (!data.starts_at || !data.ends_at) {
          return true
        }

        return (
          new Date(data.ends_at).getTime() >
          new Date(data.starts_at).getTime()
        )
      },
      {
        message: "End date and time must be after the start date and time",
        path: ["ends_at"],
      },
    )

export const deleteCampaignBlackoutPeriodSchema = z.object({
  id: z.string().uuid("Invalid blackout period id"),
})

export type CreateCampaignBlackoutPeriodInput =
  z.input<typeof createCampaignBlackoutPeriodSchema>

export type UpdateCampaignBlackoutPeriodInput =
  z.input<typeof updateCampaignBlackoutPeriodSchema>