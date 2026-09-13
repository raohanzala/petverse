import { z } from "zod"

export const consentFormTemplateBaseSchema =
  z.object({
    name: z
      .string()
      .min(1, "Name is required")
      .max(
        255,
        "Name must be 255 characters or less"
      ),

    body_html: z
      .string()
      .min(1, "Template body is required"),

    version: z
      .number()
      .int("Version must be a whole number")
      .min(1, "Version must be at least 1"),

    is_active: z.boolean(),
  })

export const createConsentFormTemplateSchema =
  consentFormTemplateBaseSchema

export const updateConsentFormTemplateSchema =
  consentFormTemplateBaseSchema.partial().extend({
    id: z.string().uuid(
      "Invalid consent form template id"
    ),
  })

export type CreateConsentFormTemplateInput =
  z.infer<
    typeof createConsentFormTemplateSchema
  >

export type UpdateConsentFormTemplateInput =
  z.infer<
    typeof updateConsentFormTemplateSchema
  >

export const deleteConsentFormTemplateSchema =
  z.object({
    id: z.string().uuid(
      "Invalid consent form template id"
    ),
  })