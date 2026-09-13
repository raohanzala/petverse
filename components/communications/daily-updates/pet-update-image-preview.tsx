"use client"

import Image from "next/image"
import { Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

import type { PetUpdateImageRow } from "@/lib/supabase/types"

type PetUpdateImagePreviewProps = {
  image: PetUpdateImageRow
  onDelete: (id: string) => void
  disabled?: boolean
}

export function PetUpdateImagePreview({
  image,
  onDelete,
  disabled = false,
}: PetUpdateImagePreviewProps) {
  return (
    <Card className="group relative overflow-hidden">
      <div className="relative aspect-square w-full">
        <Image
          src={image.file_url}
          alt="Daily update photo"
          fill
          sizes="(max-width: 640px) 50vw, 160px"
          className="object-cover"
        />

        <div className="absolute right-2 top-2">
          <Button
            type="button"
            variant="destructive"
            size="icon-sm"
            onClick={() => onDelete(image.id)}
            disabled={disabled}
            aria-label="Delete photo"
          >
            <Trash2 />
          </Button>
        </div>
      </div>
    </Card>
  )
}