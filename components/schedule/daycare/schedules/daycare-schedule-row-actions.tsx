"use client"

import { useState } from "react"
import { Pencil, Trash2 } from "lucide-react"

import type { DaycareScheduleRow, PetRow } from "@/lib/supabase/types"

import { Button } from "@/components/ui/button"
import { DaycareScheduleFormDialog } from "./daycare-schedule-form-dialog"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { toast } from "@/components/ui/toast"
import { deleteDaycareSchedule } from "@/lib/supabase/mutations/daycare-schedules"

type DaycareScheduleRowActionsProps = {
  schedule: DaycareScheduleRow
  pets: PetRow[]
  onSuccess: () => void
}

export function DaycareScheduleRowActions({
  schedule,
  pets,
  onSuccess
}: DaycareScheduleRowActionsProps) {
  const [editOpen, setEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  async function confirmDelete() {
    setIsDeleting(true)

    const result = await deleteDaycareSchedule(schedule.id)

    setIsDeleting(false)

    if (!result.success) {
      toast.add({
        type: "error",
        description: result.error,
        priority: "high",
      })
      return
    }

    toast.add({
      type: "success",
      description: "Daycare package deleted",
      priority: "high",
    })

    setDeleteOpen(false)
    onSuccess()
  }

  return (
    <>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setEditOpen(true)}
        >
          <Pencil className="size-4" />
          Edit
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => setDeleteOpen(true)}
        >
          <Trash2 className="size-4" />
          Delete
        </Button>
      </div>

      <DaycareScheduleFormDialog
        onSuccess={onSuccess}
        schedule={schedule}
        pets={pets}
        open={editOpen}
        onOpenChange={setEditOpen}
      />

      <AlertDialog
        open={deleteOpen}
        onOpenChange={(open) => {
          if (!open && !isDeleting) {
            setDeleteOpen(false)
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete daycare package?</AlertDialogTitle>

            <AlertDialogDescription>
              This will permanently delete{" "}
              <strong>{schedule.id}</strong>. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>
              Cancel
            </AlertDialogCancel>

            <AlertDialogAction
              variant="destructive"
              disabled={isDeleting}
              onClick={(event) => {
                event.preventDefault()
                void confirmDelete()
              }}
            >
              {isDeleting ? "Deleting…" : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}