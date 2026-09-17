"use client"

import { DataTable, PageHeader } from "@/components/shared"
import { Button } from "@/components/ui/button"
import { toast } from "@/components/ui/toast"
import { deleteDaycareSchedule } from "@/lib/supabase/mutations/daycare-schedules"
import { DaycareScheduleListRow, DaycareScheduleRow, FacilityResourceRow, OwnerRow, PetRow } from "@/lib/supabase/types"
import { Plus } from "lucide-react"
import { useRouter } from "next/navigation"
import { useMemo, useState } from "react"
import { DaycareScheduleFormDialog } from "./daycare-schedule-form-dialog"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { getDaycareScheduleColumns } from "./daycare-schedules-columns"
import { DaycareSchedulePreviewDialog } from "./daycare-schedule-preview-dialog"

type DaycareSchedulesManagerProps = {
    schedules: DaycareScheduleListRow[]
    pets: PetRow[]
    owners: OwnerRow[]
    resources: FacilityResourceRow[]
}

export function DaycareSchedulesManager({
    schedules,
    pets,
    owners,
    resources
}: DaycareSchedulesManagerProps) {
    const router = useRouter()

    const [formOpen, setFormOpen] = useState(false)

    const [editingSchedule, setEditingSchedule] =
        useState<DaycareScheduleRow | null>(null)

    const [deletingSchedule, setDeletingSchedule] =
        useState<DaycareScheduleRow | null>(null)

    const [isDeleting, setIsDeleting] = useState(false)

    function refreshList() {
        router.refresh()
    }

    function openCreate() {
        setEditingSchedule(null)
        setFormOpen(true)
    }

    function openEdit(schedule: DaycareScheduleRow) {
        setEditingSchedule(schedule)
        setFormOpen(true)
    }

    async function confirmDelete() {
        if (!deletingSchedule) return

        setIsDeleting(true)

        const result = await deleteDaycareSchedule(
            deletingSchedule.id
        )

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
            description: "Daycare schedule deleted",
            priority: "high",
        })

        setDeletingSchedule(null)
        refreshList()
    }

    const [previewingSchedule, setPreviewingSchedule] =
        useState<DaycareScheduleListRow | null>(null)

    const columns = useMemo(
        () =>
            getDaycareScheduleColumns({
                onPreview: setPreviewingSchedule,
            }),
        []
    )

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <PageHeader title="Daycare Schedules" description="Manage recurring daycare schedules for pets." />

                <Button onClick={openCreate}>
                    <Plus />
                    New schedule
                </Button>
            </div>

            <DataTable
                columns={columns}
                data={schedules}
                pageSize={10}
                enableColumnVisibility
                emptyMessage="No daycare schedules yet."
            />

            <DaycareScheduleFormDialog
                owners={owners}
                resources={resources}
                open={formOpen}
                onOpenChange={setFormOpen}
                schedule={editingSchedule}
                pets={pets}
                onSuccess={refreshList}
            />

            <DaycareSchedulePreviewDialog
                open={Boolean(previewingSchedule)}
                onOpenChange={open => {
                    if(!open){
                        setPreviewingSchedule(null)
                    }
                }}
                schedule={previewingSchedule}
            />

            <AlertDialog
                open={Boolean(deletingSchedule)}
                onOpenChange={(open) => {
                    if (!open) {
                        setDeletingSchedule(null)
                    }
                }}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            Delete daycare schedule?
                        </AlertDialogTitle>

                        <AlertDialogDescription>
                            This will permanently delete this daycare schedule.
                            This action cannot be undone.
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