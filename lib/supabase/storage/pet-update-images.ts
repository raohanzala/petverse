import { createClient } from "@/lib/supabase/client"

import {
    createPetUpdateImage,
} from "@/lib/supabase/mutations/pet-update-images"

const BUCKET_NAME = "pet-update-images"

export async function uploadPetUpdateImage(
    file: File,
    dailyUpdateId: string,
    petId: string
) {
    const supabase = createClient()
    const {
        data: { user },
        error,
    } = await supabase.auth.getUser()

    const fileExtension =
        file.name.split(".").pop()?.toLowerCase() ?? "jpg"

    const fileName =
        `${crypto.randomUUID()}.${fileExtension}`

    const filePath =
        `daily-updates/${dailyUpdateId}/${fileName}`

    const { error: uploadError } =
        await supabase.storage
            .from(BUCKET_NAME)
            .upload(filePath, file, {
                cacheControl: "3600",
                contentType: file.type,
                upsert: false,
            })

    if (uploadError) {
        throw new Error(uploadError.message)
    }

    const {
        data: { publicUrl },
    } = supabase.storage
        .from(BUCKET_NAME)
        .getPublicUrl(filePath)

    const result = await createPetUpdateImage({
        daily_update_id: dailyUpdateId,
        pet_id: petId,
        file_url: publicUrl,
        sorted_at: new Date().toISOString(),
    })

    if (!result.success) {
        await supabase.storage
            .from(BUCKET_NAME)
            .remove([filePath])

        throw new Error(result.error)
    }

    return result.data
}