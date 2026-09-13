"use client"

import { useState } from "react"

import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"

const MAX_FILE_SIZE = 5 * 1024 * 1024

const ACCEPTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
] as const

type PetUpdateImageUploadProps = {
  onFilesSelect: (files: File[]) => void
  disabled?: boolean
}

export function PetUpdateImageUpload({
  onFilesSelect,
  disabled = false,
}: PetUpdateImageUploadProps) {
  const [error, setError] =
    useState<string | null>(null)

  function handleFileChange(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const files = Array.from(
      event.target.files ?? []
    )

    setError(null)

    if (files.length === 0) {
      onFilesSelect([])
      return
    }

    const invalidType = files.find(
      (file) =>
        !ACCEPTED_IMAGE_TYPES.includes(
          file.type as (typeof ACCEPTED_IMAGE_TYPES)[number]
        )
    )

    if (invalidType) {
      setError(
        "Please select only JPG, PNG, or WebP images."
      )
      event.target.value = ""
      onFilesSelect([])
      return
    }

    const oversizedFile = files.find(
      (file) => file.size > MAX_FILE_SIZE
    )

    if (oversizedFile) {
      setError(
        "Each image must be 5 MB or smaller."
      )
      event.target.value = ""
      onFilesSelect([])
      return
    }

    onFilesSelect(files)

    event.target.value = ""
  }

  return (
    <Field>
      <FieldLabel htmlFor="pet-update-images">
        Add photos
      </FieldLabel>

      <Input
        id="pet-update-images"
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple
        onChange={handleFileChange}
        disabled={disabled}
      />

      {error ? (
        <FieldError>
          {error}
        </FieldError>
      ) : (
        <FieldDescription>
          Select one or more JPG, PNG, or WebP
          images. Maximum 5 MB per image.
        </FieldDescription>
      )}
    </Field>
  )
}