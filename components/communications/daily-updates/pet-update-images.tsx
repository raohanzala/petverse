"use client"

import { useEffect, useMemo, useState } from "react"
import { Trash2 } from "lucide-react"

import {
  Field,
  FieldDescription,
  FieldLabel,
} from "@/components/ui/field"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

import { createClient } from "@/lib/supabase/client"
import type { PetUpdateImageRow } from "@/lib/supabase/types"

import {
  createPetUpdateImage,
  deletePetUpdateImage,
  getPetUpdateImages,
} from "@/lib/supabase/mutations/pet-update-images"
import { PetUpdateImagePreview } from "./pet-update-image-preview"
import { PetUpdateImageUpload } from "./pet-update-image-upload"

const BUCKET_NAME = "pet-update-images"

type PetUpdateImagesProps = {
  dailyUpdateId?: string | null
  petId: string
  pendingFiles: File[]
  onPendingFilesChange: (files: File[]) => void
  initialImages?: PetUpdateImageRow[]
  disabled?: boolean
}

export function PetUpdateImages({
  dailyUpdateId,
  petId,
  pendingFiles,
  onPendingFilesChange,
  initialImages = [],
  disabled = false,
}: PetUpdateImagesProps) {
  const [images, setImages] =
    useState<PetUpdateImageRow[]>(initialImages)

  const [isUploading, setIsUploading] =
    useState(false)

  const [deletingImageId, setDeletingImageId] =
    useState<string | null>(null)

  /*
   * Load existing images when editing
   * an already-created daily update.
   */
  useEffect(() => {
  if (!dailyUpdateId) {
    setImages([])
    return
  }

  const updateId = dailyUpdateId

  let cancelled = false

  async function loadImages() {
    try {
      const result =
        await getPetUpdateImages(updateId)

      if (cancelled) return

      if (!result.success) {
        throw new Error(result.error)
      }

      setImages(result.data)
    } catch (error) {
      console.error(
        "Failed to load pet update images:",
        error
      )
    }
  }

  loadImages()

  return () => {
    cancelled = true
  }
}, [dailyUpdateId])

  /*
   * Create temporary browser URLs
   * for pending local files.
   */
  const pendingPreviews = useMemo(() => {
    return pendingFiles.map((file) => ({
      file,
      url: URL.createObjectURL(file),
    }))
  }, [pendingFiles])

  /*
   * Clean up temporary browser URLs.
   */
  useEffect(() => {
    return () => {
      pendingPreviews.forEach(({ url }) => {
        URL.revokeObjectURL(url)
      })
    }
  }, [pendingPreviews])

  /*
   * If the Daily Update does not exist yet,
   * keep the selected files locally.
   *
   * If it already exists, upload immediately.
   */
  async function handleFileSelect(
    files: File[]
  ) {
    if (files.length === 0 || disabled) return

    if (!dailyUpdateId) {
      onPendingFilesChange([
        ...pendingFiles,
        ...files,
      ])

      return
    }

    setIsUploading(true)

    try {
      for (const file of files) {
        await uploadImage(file, dailyUpdateId)
      }
    } catch (error) {
      console.error(
        "Failed to upload pet update image:",
        error
      )
    } finally {
      setIsUploading(false)
    }
  }

  async function uploadImage(
    file: File,
    updateId: string
  ) {
    const supabase = createClient()

    const fileExtension =
      file.name.split(".").pop()?.toLowerCase() ?? "jpg"

    const fileName = `${crypto.randomUUID()}.${fileExtension}`

    const filePath =
      `daily-updates/${updateId}/${fileName}`

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
      daily_update_id: updateId,
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

    setImages((current) => [
      ...current,
      result.data,
    ])
  }

  function handlePendingDelete(index: number) {
    if (disabled) return

    onPendingFilesChange(
      pendingFiles.filter(
        (_, fileIndex) => fileIndex !== index
      )
    )
  }

  async function handleDelete(id: string) {
    if (disabled || deletingImageId) return

    const image = images.find(
      (item) => item.id === id
    )

    if (!image) return

    setDeletingImageId(id)

    try {
      const result =
        await deletePetUpdateImage(id)

      if (!result.success) {
        throw new Error(result.error)
      }

      setImages((current) =>
        current.filter(
          (item) => item.id !== id
        )
      )

      const filePath =
        getStorageFilePath(image.file_url)

      if (filePath) {
        const supabase = createClient()

        await supabase.storage
          .from(BUCKET_NAME)
          .remove([filePath])
      }
    } catch (error) {
      console.error(
        "Failed to delete pet update image:",
        error
      )
    } finally {
      setDeletingImageId(null)
    }
  }

  return (
    <Field>
      <PetUpdateImageUpload
        onFilesSelect={handleFileSelect}
        disabled={disabled || isUploading}
      />

      {isUploading ? (
        <FieldDescription>
          Uploading photos...
        </FieldDescription>
      ) : null}

      {pendingPreviews.length > 0 ? (
        <div className="space-y-2">

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {pendingPreviews.map(
              ({ file, url }, index) => (
                <Card
                  key={`${file.name}-${index}`}
                  className="group relative overflow-hidden"
                >
                  <div className="relative aspect-square w-full">
                    <img
                      src={url}
                      alt={file.name}
                      className="h-full w-full object-cover"
                    />

                    <div className="absolute right-2 top-2">
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon-sm"
                        onClick={() =>
                          handlePendingDelete(index)
                        }
                        disabled={disabled}
                        aria-label="Remove photo"
                      >
                        <Trash2 />
                      </Button>
                    </div>
                  </div>
                </Card>
              )
            )}
          </div>
        </div>
      ) : null}

      {images.length > 0 ? (
        <div className="space-y-2">
          <FieldDescription>
            Uploaded photos
          </FieldDescription>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {images.map((image) => (
              <PetUpdateImagePreview
                key={image.id}
                image={image}
                onDelete={handleDelete}
                disabled={
                  disabled ||
                  isUploading ||
                  deletingImageId === image.id
                }
              />
            ))}
          </div>
        </div>
      ) : null}

      {pendingPreviews.length === 0 &&
      images.length === 0 ? (
        <FieldDescription>
          Photos attached to this daily update
          will appear here.
        </FieldDescription>
      ) : null}
    </Field>
  )
}

function getStorageFilePath(
  fileUrl: string
) {
  const marker =
    `/storage/v1/object/public/${BUCKET_NAME}/`

  const markerIndex =
    fileUrl.indexOf(marker)

  if (markerIndex === -1) {
    return null
  }

  return decodeURIComponent(
    fileUrl.slice(
      markerIndex + marker.length
    )
  )
}