"use client"

import { CalendarX } from "lucide-react"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

type PetHasReservationsDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function PetHasReservationsDialog({
  open,
  onOpenChange,
}: PetHasReservationsDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogMedia>
            <CalendarX />
          </AlertDialogMedia>

          <AlertDialogTitle>
            Cannot delete pet
          </AlertDialogTitle>

          <AlertDialogDescription>
            This pet has existing reservations. You cannot delete a pet
            that has reservation history.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogAction
            type="button"
            onClick={() => onOpenChange(false)}
          >
            Got it
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}