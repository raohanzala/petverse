import { createClient } from "@/lib/supabase/client"

import { createPetPhoto } from "@/lib/supabase/mutations/pet-photos"

const BUCKET_NAME = "pet-photos"

export async function uploadPetPhoto(
  file: File,
  petId: string
) {
  const supabase = createClient()

  const fileExtension =
    file.name.split(".").pop()?.toLowerCase() ?? "jpg"

  const fileName =
    `${crypto.randomUUID()}.${fileExtension}`

  const filePath =
    `${petId}/${fileName}`

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

  const result = await createPetPhoto({
    pet_id: petId,
    file_url: publicUrl,
    caption: null,
  })

  if (!result.success) {
    await supabase.storage
      .from(BUCKET_NAME)
      .remove([filePath])

    throw new Error(result.error)
  }

  return result.data
}