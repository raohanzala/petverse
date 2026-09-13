import { z } from "zod"

export const ownerRetentionSettingsBaseSchema =
  z.object({
    owner_id: z.string().uuid("Invalid owner id"),

    lapsed_after_days: z
      .number()
      .int("Lapsed days must be a whole number")
      .positive(
        "Lapsed days must be greater than 0"
      ),

    reengagement_queued_at: z
      .string()
      .datetime({
        offset: true,
        message:
          "Invalid re-engagement queued date and time",
      })
      .nullable()
      .optional(),

    opt_out: z.boolean(),
  })

export const createOwnerRetentionSettingsSchema =
  ownerRetentionSettingsBaseSchema

export const updateOwnerRetentionSettingsSchema =
  ownerRetentionSettingsBaseSchema
    .partial()
    .extend({
      id: z.string().uuid(
        "Invalid retention settings id"
      ),
    })

export type CreateOwnerRetentionSettingsInput =
  z.infer<
    typeof createOwnerRetentionSettingsSchema
  >

export type UpdateOwnerRetentionSettingsInput =
  z.infer<
    typeof updateOwnerRetentionSettingsSchema
  >

export const deleteOwnerRetentionSettingsSchema =
  z.object({
    id: z.string().uuid(
      "Invalid retention settings id"
    ),
  })