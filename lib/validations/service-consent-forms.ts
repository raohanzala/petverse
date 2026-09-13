import { z } from "zod"

export const serviceConsentFormBaseSchema =
  z.object({
    service_id: z.string().uuid(
      "Invalid service id"
    ),
    template_id: z.string().uuid(
      "Invalid template id"
    ),
  })

export const createServiceConsentFormSchema =
  serviceConsentFormBaseSchema

export type CreateServiceConsentFormInput =
  z.infer<
    typeof createServiceConsentFormSchema
  >

export const deleteServiceConsentFormSchema =
  serviceConsentFormBaseSchema

export type DeleteServiceConsentFormInput =
  z.infer<
    typeof deleteServiceConsentFormSchema
  >