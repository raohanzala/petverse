import { z } from "zod"

export const conversationStageSchema = z.enum([
  "inquiry",
  "engaged",
  "quoted",
  "booked",
  "visited",
  "closed_lost",
  "closed_won",
])

export const conversationBaseSchema = z.object({
  owner_id: z
    .string()
    .uuid("Invalid owner id")
    .nullable()
    .optional(),

  channel: z
    .string()
    .min(1, "Channel is required")
    .max(50, "Channel must be 50 characters or less"),

  external_id: z
    .string()
    .max(255, "External id must be 255 characters or less")
    .nullable()
    .optional(),

  stage: conversationStageSchema,

  closed_lost_reason: z
    .string()
    .max(
      500,
      "Closed lost reason must be 500 characters or less"
    )
    .nullable()
    .optional(),

  quoted_amount: z
    .number()
    .min(0, "Quoted amount cannot be negative")
    .nullable()
    .optional(),

  lost_revenue: z
    .number()
    .min(0, "Lost revenue cannot be negative")
    .nullable()
    .optional(),

  assigned_employee_id: z
    .string()
    .uuid("Invalid employee id")
    .nullable()
    .optional(),

  first_staff_response_at: z
    .string()
    .datetime({
      offset: true,
      message: "Invalid response date and time",
    })
    .nullable()
    .optional(),

  ai_handled: z.boolean(),
})

export const createConversationSchema =
  conversationBaseSchema

export const updateConversationSchema =
  conversationBaseSchema.partial().extend({
    id: z.string().uuid("Invalid conversation id"),
  })

export type CreateConversationInput = z.infer<
  typeof createConversationSchema
>

export type UpdateConversationInput = z.infer<
  typeof updateConversationSchema
>

export const deleteConversationSchema = z.object({
  id: z.string().uuid("Invalid conversation id"),
})
