import { z } from "zod"

export const businessSettingsBaseSchema = z.object({
    business_name: z
        .string()
        .min(1, "Business name is required")
        .max(150, "Business name must be 150 characters or less"),

    logo_url: z
        .string()
        .max(500, "Logo URL must be 500 characters or less")
        .refine(
            (value) => value === "" || z.url().safeParse(value).success,
            "Logo URL must be a valid URL"
        )
        .optional()
        .nullable(),

    timezone: z
        .string()
        .min(1, "Timezone is required")
        .max(100, "Timezone must be 100 characters or less"),

    currency: z
        .string()
        .min(1, "Currency is required")
        .max(10, "Currency must be 10 characters or less"),

    phone: z
        .string()
        .max(30, "Phone must be 30 characters or less")
        .optional()
        .nullable(),

    email: z
        .string()
        .email("Please enter a valid email address")
        .max(255, "Email must be 255 characters or less")
        .optional()
        .nullable(),

    address: z
        .string()
        .max(500, "Address must be 500 characters or less")
        .optional()
        .nullable(),

    hero_title: z
        .string()
        .max(200, "Hero title must be 200 characters or less")
        .optional()
        .nullable(),

    hero_subtitle: z
        .string()
        .max(500, "Hero subtitle must be 500 characters or less")
        .optional()
        .nullable(),
})

export const createBusinessSettingsSchema = businessSettingsBaseSchema

export const updateBusinessSettingsSchema =
    businessSettingsBaseSchema.partial().extend({
        id: z.string().uuid("Invalid business settings id"),
    })

export type CreateBusinessSettingsInput = z.infer<
    typeof createBusinessSettingsSchema
>

export type UpdateBusinessSettingsInput = z.infer<
    typeof updateBusinessSettingsSchema
>