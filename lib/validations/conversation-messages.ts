import { z } from "zod"

export const messageDirectionSchema = z.enum([
  "inbound",
  "outbound",
])

export const conversationMessageBaseSchema = z.object({
  conversation_id: z
    .string()
    .uuid("Invalid conversation id"),

  direction: messageDirectionSchema,

  body: z
    .string()
    .min(1, "Message body is required"),

  sent_at: z
    .string()
    .datetime({
      offset: true,
      message: "Invalid sent date and time",
    })
    .optional(),

  external_id: z
    .string()
    .max(
      255,
      "External id must be 255 characters or less"
    )
    .optional()
    .nullable(),
})

export const createConversationMessageSchema =
  conversationMessageBaseSchema

export const updateConversationMessageSchema =
  conversationMessageBaseSchema.partial().extend({
    id: z.string().uuid("Invalid message id"),
  })

export type CreateConversationMessageInput = z.infer<
  typeof createConversationMessageSchema
>

export type UpdateConversationMessageInput = z.infer<
  typeof updateConversationMessageSchema
>

export const deleteConversationMessageSchema = z.object({
  id: z.string().uuid("Invalid message id"),
})