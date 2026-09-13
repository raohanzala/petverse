import { z } from "zod"

export const consentFormSubmissionBaseSchema =
  z.object({
    template_id: z.string().uuid(
      "Invalid consent form template id"
    ),

    appointment_id: z
      .string()
      .uuid("Invalid appointment id")
      .nullable()
      .optional(),

    owner_id: z.string().uuid(
      "Invalid owner id"
    ),

    pet_id: z
      .string()
      .uuid("Invalid pet id")
      .nullable()
      .optional(),

    signed_at: z.string().datetime({
      offset: true,
      message: "Invalid signed date and time",
    }),

    signature_data: z
      .record(z.string(), z.unknown())
      .nullable()
      .optional(),
  })

export const createConsentFormSubmissionSchema =
  consentFormSubmissionBaseSchema

export const updateConsentFormSubmissionSchema =
  consentFormSubmissionBaseSchema.partial().extend({
    id: z.string().uuid(
      "Invalid consent form submission id"
    ),
  })

export type CreateConsentFormSubmissionInput =
  z.infer<
    typeof createConsentFormSubmissionSchema
  >

export type UpdateConsentFormSubmissionInput =
  z.infer<
    typeof updateConsentFormSubmissionSchema
  >

export const deleteConsentFormSubmissionSchema =
  z.object({
    id: z.string().uuid(
      "Invalid consent form submission id"
    ),
  })