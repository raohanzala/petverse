"use client"

import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { Plus } from "lucide-react"
import { toast } from "sonner"

import { getEmployeeScheduleColumns } from "./employee-schedules-columns"
import { EmployeeScheduleFormDialog } from "./employee-schedule-form-dialog"
import { DataTable } from "@/components/shared/data-table"
import { PageHeader } from "@/components/shared/page-header"
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
import { Button } from "@/components/ui/button"
import { deleteEmployeeSchedule } from "@/lib/supabase/mutations/employee-schedules"
import type {
  EmployeeRow,
  EmployeeScheduleRow,
} from "@/lib/supabase/types"

type EmployeeSchedulesManagerProps = {
  schedules: EmployeeScheduleRow[]
  employees: EmployeeRow[]
}

export function EmployeeSchedulesManager({
  schedules,
  employees,
}: EmployeeSchedulesManagerProps) {
  const router = useRouter()
  const [formOpen, setFormOpen] = useState(false)
  const [editingSchedule, setEditingSchedule] =
    useState<EmployeeScheduleRow | null>(null)
  const [deletingSchedule, setDeletingSchedule] =
    useState<EmployeeScheduleRow | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  function refreshList() {
    router.refresh()
  }

  function openCreate() {
    setEditingSchedule(null)
    setFormOpen(true)
  }

  function openEdit(schedule: EmployeeScheduleRow) {
    setEditingSchedule(schedule)
    setFormOpen(true)
  }

  async function confirmDelete() {
    if (!deletingSchedule) return

    setIsDeleting(true)

    const result = await deleteEmployeeSchedule(
      deletingSchedule.id
    )

    setIsDeleting(false)

    if (!result.success) {
      toast.error(result.error)
      return
    }

    toast.success("Schedule deleted")
    setDeletingSchedule(null)
    refreshList()
  }

  const columns = useMemo(
    () =>
      getEmployeeScheduleColumns({
        onEdit: openEdit,
        onDelete: setDeletingSchedule,
      }),
    []
  )

  const emptyMessage =
    "No employee schedules yet. Create a schedule to get started."

  return (
    <div className="space-y-6">
      <PageHeader
        title="Employee schedules"
        description="Manage the working days and hours for your team members."
        actions={
          <Button onClick={openCreate}>
            <Plus />
            New schedule
          </Button>
        }
      />

      <DataTable
        columns={columns}
        data={schedules}
        pageSize={10}
        enableColumnVisibility
        emptyMessage={emptyMessage}
      />

      <EmployeeScheduleFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        schedule={editingSchedule}
        employees={employees}
        onSuccess={refreshList}
      />

      <AlertDialog
        open={Boolean(deletingSchedule)}
        onOpenChange={(open) => {
          if (!open) setDeletingSchedule(null)
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Delete schedule?
            </AlertDialogTitle>

            <AlertDialogDescription>
              This will permanently delete the schedule for{" "}
              <strong>
                {deletingSchedule?.employee.display_name}
              </strong>
              .
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
    </div>
  )
}