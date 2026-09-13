import { z } from "zod"

export const petVaccinationBaseSchema = z.object({
    pet_id: z.string().uuid("Invalid pet id"),

    vaccine_type_id: z.string().uuid(
        "Invalid vaccine type id"
    ),

    administered_at: z
        .string()
        .regex(
            /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/,
            "Invalid administered date and time",
        ),

    expires_at: z
        .string()
        .regex(
            /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/,
            "Invalid expiration date and time",
        )
        .nullable()
        .optional(),

    notes: z
        .string()
        .max(
            1000,
            "Notes must be 1000 characters or less"
        )
        .optional()
        .nullable(),

    recorded_by: z
        .string()
        .uuid("Invalid employee id")
        .nullable()
        .optional(),
})

export const createPetVaccinationSchema =
    petVaccinationBaseSchema

export const updatePetVaccinationSchema =
    petVaccinationBaseSchema.partial().extend({
        id: z.string().uuid(
            "Invalid vaccination id"
        ),
    })

export type CreatePetVaccinationInput =
    z.infer<typeof createPetVaccinationSchema>

export type UpdatePetVaccinationInput =
    z.infer<typeof updatePetVaccinationSchema>

export const deletePetVaccinationSchema =
    z.object({
        id: z.string().uuid(
            "Invalid vaccination id"
        ),
    })