import { z } from "zod"

export const messageTemplateBaseSchema =
  z.object({
    name: z
      .string()
      .min(1, "Name is required")
      .max(
        100,
        "Name must be 100 characters or less"
      ),

    channel: z
      .string()
      .min(1, "Channel is required")
      .max(
        50,
        "Channel must be 50 characters or less"
      ),

    body: z
      .string()
      .min(1, "Message body is required"),

    is_active: z.boolean(),
  })

export const createMessageTemplateSchema =
  messageTemplateBaseSchema

export const updateMessageTemplateSchema =
  messageTemplateBaseSchema.partial().extend({
    id: z.string().uuid("Invalid template id"),
  })

export type CreateMessageTemplateInput =
  z.infer<typeof createMessageTemplateSchema>

export type UpdateMessageTemplateInput =
  z.infer<typeof updateMessageTemplateSchema>

export const deleteMessageTemplateSchema =
  z.object({
    id: z.string().uuid("Invalid template id"),
  })