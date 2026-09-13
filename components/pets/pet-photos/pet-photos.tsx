"use client"

import { useEffect, useRef, useState } from "react"
import Image from "next/image"
import { ImagePlus, MoreHorizontal, Pencil, Trash2 } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

import type { PetPhotoRow } from "@/lib/supabase/types"

type PetPhotosProps = {
  petId: string
  initialPhotos?: PetPhotoRow[]
  disabled?: boolean
}

const MAX_FILE_SIZE = 5 * 1024 * 1024

const ACCEPTED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
]

export function PetPhotos({
  petId,
  initialPhotos = [],
  disabled = false,
}: PetPhotosProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [photos, setPhotos] =
    useState<PetPhotoRow[]>(initialPhotos)

  const [selectedFile, setSelectedFile] =
    useState<File | null>(null)

  const [previewUrl, setPreviewUrl] =
    useState<string | null>(null)

  const [caption, setCaption] = useState("")

  const [isUploadOpen, setIsUploadOpen] =
    useState(false)

  const [editingPhoto, setEditingPhoto] =
    useState<PetPhotoRow | null>(null)

  const [editingCaption, setEditingCaption] =
    useState("")

  const [photoToDelete, setPhotoToDelete] =
    useState<PetPhotoRow | null>(null)

  const [isSubmitting, setIsSubmitting] =
    useState(false)

  const [error, setError] =
    useState<string | null>(null)

  useEffect(() => {
    setPhotos(initialPhotos)
  }, [initialPhotos])

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl)
      }
    }
  }, [previewUrl])

  function resetUploadState() {
    setSelectedFile(null)
    setCaption("")
    setError(null)

    if (previewUrl) {
      URL.revokeObjectURL(previewUrl)
    }

    setPreviewUrl(null)

    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  function handleFileSelect(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const file = event.target.files?.[0]

    if (!file) return

    setError(null)

    if (!ACCEPTED_TYPES.includes(file.type)) {
      setError(
        "Only JPG, PNG, and WebP images are supported."
      )
      return
    }

    if (file.size > MAX_FILE_SIZE) {
      setError(
        "Image size must be 5MB or less."
      )
      return
    }

    if (previewUrl) {
      URL.revokeObjectURL(previewUrl)
    }

    setSelectedFile(file)
    setPreviewUrl(URL.createObjectURL(file))
  }

  function openUploadDialog() {
    resetUploadState()
    setIsUploadOpen(true)
  }

  function closeUploadDialog() {
    if (isSubmitting) return

    setIsUploadOpen(false)
    resetUploadState()
  }

  function openEditDialog(photo: PetPhotoRow) {
    setEditingPhoto(photo)
    setEditingCaption(photo.caption ?? "")
    setError(null)
  }

  function closeEditDialog() {
    if (isSubmitting) return

    setEditingPhoto(null)
    setEditingCaption("")
    setError(null)
  }

  async function handleUpload() {
    if (!selectedFile) {
      setError("Please select an image.")
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      /*
       * Connect this section to your pet-photos storage helper
       * and createPetPhoto server action.
       *
       * Example:
       *
       * const photo = await uploadPetPhoto(
       *   selectedFile,
       *   petId,
       *   caption.trim() || null
       * )
       *
       * setPhotos((current) => [photo, ...current])
       */

      toast.success("Photo uploaded successfully")

      closeUploadDialog()
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to upload photo"

      setError(message)
      toast.error(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleUpdateCaption() {
    if (!editingPhoto) return

    setIsSubmitting(true)
    setError(null)

    try {
      /*
       * Connect this section to your updatePetPhoto
       * server action.
       *
       * Example:
       *
       * const result = await updatePetPhoto({
       *   id: editingPhoto.id,
       *   caption: editingCaption.trim() || null,
       * })
       *
       * if (!result.success) {
       *   throw new Error(result.error)
       * }
       *
       * setPhotos((current) =>
       *   current.map((photo) =>
       *     photo.id === editingPhoto.id
       *       ? result.data
       *       : photo
       *   )
       * )
       */

      setPhotos((current) =>
        current.map((photo) =>
          photo.id === editingPhoto.id
            ? {
                ...photo,
                caption:
                  editingCaption.trim() || null,
              }
            : photo
        )
      )

      toast.success("Caption updated successfully")

      closeEditDialog()
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to update caption"

      setError(message)
      toast.error(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleDelete() {
    if (!photoToDelete) return

    setIsSubmitting(true)

    try {
      /*
       * Connect this section to your deletePetPhoto
       * server action and storage delete helper.
       *
       * Example:
       *
       * const result = await deletePetPhoto(
       *   photoToDelete.id
       * )
       *
       * if (!result.success) {
       *   throw new Error(result.error)
       * }
       */

      setPhotos((current) =>
        current.filter(
          (photo) =>
            photo.id !== photoToDelete.id
        )
      )

      toast.success("Photo deleted successfully")

      setPhotoToDelete(null)
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to delete photo"
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-start justify-between gap-4">
          <div>
            <CardTitle>Photos</CardTitle>

            <CardDescription>
              Manage photos saved to this pet's profile.
            </CardDescription>
          </div>

          <Button
            type="button"
            size="sm"
            onClick={openUploadDialog}
            disabled={disabled}
          >
            <ImagePlus />
            Add photo
          </Button>
        </CardHeader>

        <CardContent>
          {photos.length === 0 ? (
            <div className="flex min-h-[220px] flex-col items-center justify-center rounded-lg border border-dashed bg-muted/20 px-6 text-center">
              <div className="mb-3 flex size-10 items-center justify-center rounded-full bg-muted">
                <ImagePlus className="size-5 text-muted-foreground" />
              </div>

              <p className="text-sm font-medium">
                No photos yet
              </p>

              <p className="mt-1 max-w-sm text-sm text-muted-foreground">
                Add photos to keep a visual record of
                this pet.
              </p>

              <Button
                type="button"
                variant="outline"
                size="sm"
                className="mt-4"
                onClick={openUploadDialog}
                disabled={disabled}
              >
                <ImagePlus />
                Add first photo
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {photos.map((photo) => (
                <div
                  key={photo.id}
                  className="group overflow-hidden rounded-xl border bg-card"
                >
                  <div className="relative aspect-square overflow-hidden bg-muted">
                    <Image
                      src={photo.file_url}
                      alt={
                        photo.caption ||
                        "Pet photo"
                      }
                      fill
                      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 240px"
                      className="object-cover transition-transform duration-200 group-hover:scale-[1.02]"
                    />

                    <div className="absolute right-2 top-2 opacity-0 transition-opacity group-hover:opacity-100">
                      <div className="flex items-center gap-1 rounded-md bg-background/90 p-1 shadow-sm backdrop-blur">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-sm"
                          aria-label="Edit caption"
                          onClick={() =>
                            openEditDialog(photo)
                          }
                        >
                          <Pencil />
                        </Button>

                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-sm"
                          aria-label="Delete photo"
                          onClick={() =>
                            setPhotoToDelete(photo)
                          }
                        >
                          <Trash2 />
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start justify-between gap-2 p-3">
                    <div className="min-w-0">
                      {photo.caption ? (
                        <p className="line-clamp-2 text-sm text-foreground">
                          {photo.caption}
                        </p>
                      ) : (
                        <p className="text-sm text-muted-foreground">
                          No caption
                        </p>
                      )}

                      <p className="mt-1 text-xs text-muted-foreground">
                        {new Date(
                          photo.created_at
                        ).toLocaleDateString()}
                      </p>
                    </div>

                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      className="shrink-0"
                      aria-label={`Actions for ${
                        photo.caption ||
                        "pet photo"
                      }`}
                      onClick={() =>
                        openEditDialog(photo)
                      }
                    >
                      <MoreHorizontal />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Upload */}
      <Dialog
        open={isUploadOpen}
        onOpenChange={(open) => {
          if (!open) {
            closeUploadDialog()
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add pet photo</DialogTitle>

            <DialogDescription>
              Upload a photo to this pet's permanent
              profile gallery.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-5">
            <Field>
              <FieldLabel htmlFor="pet-photo">
                Photo
              </FieldLabel>

              <Input
                ref={fileInputRef}
                id="pet-photo"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleFileSelect}
                disabled={isSubmitting}
              />

              <FieldDescription>
                JPG, PNG, or WebP. Maximum 5MB.
              </FieldDescription>

              {error && (
                <FieldError>{error}</FieldError>
              )}
            </Field>

            {previewUrl && (
              <div className="relative overflow-hidden rounded-xl border bg-muted">
                <div className="relative aspect-video w-full">
                  <Image
                    src={previewUrl}
                    alt="Selected pet photo"
                    fill
                    className="object-cover"
                  />
                </div>
              </div>
            )}

            <Field>
              <FieldLabel htmlFor="pet-photo-caption">
                Caption
              </FieldLabel>

              <Textarea
                id="pet-photo-caption"
                value={caption}
                onChange={(event) =>
                  setCaption(event.target.value)
                }
                placeholder="Add an optional caption..."
                rows={3}
                disabled={isSubmitting}
              />
            </Field>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={closeUploadDialog}
              disabled={isSubmitting}
            >
              Cancel
            </Button>

            <Button
              type="button"
              onClick={handleUpload}
              disabled={
                isSubmitting || !selectedFile
              }
            >
              {isSubmitting
                ? "Uploading..."
                : "Upload photo"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit caption */}
      <Dialog
        open={Boolean(editingPhoto)}
        onOpenChange={(open) => {
          if (!open) {
            closeEditDialog()
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit photo</DialogTitle>

            <DialogDescription>
              Update the caption for this pet photo.
            </DialogDescription>
          </DialogHeader>

          <Field>
            <FieldLabel htmlFor="edit-pet-photo-caption">
              Caption
            </FieldLabel>

            <Textarea
              id="edit-pet-photo-caption"
              value={editingCaption}
              onChange={(event) =>
                setEditingCaption(event.target.value)
              }
              placeholder="Add an optional caption..."
              rows={4}
              disabled={isSubmitting}
            />

            {error && (
              <FieldError>{error}</FieldError>
            )}
          </Field>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={closeEditDialog}
              disabled={isSubmitting}
            >
              Cancel
            </Button>

            <Button
              type="button"
              onClick={handleUpdateCaption}
              disabled={isSubmitting}
            >
              {isSubmitting
                ? "Saving..."
                : "Save changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete */}
      <AlertDialog
        open={Boolean(photoToDelete)}
        onOpenChange={(open) => {
          if (!open && !isSubmitting) {
            setPhotoToDelete(null)
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Delete this photo?
            </AlertDialogTitle>

            <AlertDialogDescription>
              This photo will be permanently removed
              from the pet profile. This action cannot
              be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel
              disabled={isSubmitting}
            >
              Cancel
            </AlertDialogCancel>

            <AlertDialogAction
              variant="destructive"
              onClick={handleDelete}
              disabled={isSubmitting}
            >
              {isSubmitting
                ? "Deleting..."
                : "Delete photo"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}