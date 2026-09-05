"use client"

import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { Plus } from "lucide-react"
import { toast } from "@/components/ui/toast"

import { getEmployeeColumns } from "@/components/staff/employees-columns"
import { EmployeesFilters } from "./employees-filters"
import { EmployeeFormDialog } from "@/components/staff/employee-form-dialog"
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
import type { EmployeeListFilters } from "@/lib/constants/employee-filters"
import { deleteEmployee } from "@/lib/supabase/mutations/employees"
import type { EmployeeRow } from "@/lib/supabase/types"

type EmployeesManagerProps = {
  employees: EmployeeRow[]
  filters: EmployeeListFilters
}

export function EmployeesManager({
  employees,
  filters,
}: EmployeesManagerProps) {
  const router = useRouter()
  const [isFiltering, setIsFiltering] = useState(false)
  const [formOpen, setFormOpen] = useState(false)
  const [editingEmployee, setEditingEmployee] =
    useState<EmployeeRow | null>(null)
  const [deletingEmployee, setDeletingEmployee] =
    useState<EmployeeRow | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  function refreshList() {
    router.refresh()
  }

  function openCreate() {
    setEditingEmployee(null)
    setFormOpen(true)
  }

  function openEdit(employee: EmployeeRow) {
    setEditingEmployee(employee)
    setFormOpen(true)
  }

  async function confirmDelete() {
    if (!deletingEmployee) return

    setIsDeleting(true)

    const result = await deleteEmployee(deletingEmployee.id)

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
      description: "Employee deleted",
      priority: "high",
    })
    setDeletingEmployee(null)
    refreshList()
  }

  const columns = useMemo(
    () =>
      getEmployeeColumns({
        onEdit: openEdit,
        onDelete: setDeletingEmployee,
      }),
    []
  )

  const emptyMessage =
    filters.search || filters.status !== "all"
      ? "No employees match your filters."
      : "No employees yet. Create your first one to get started."

  return (
    <div className="space-y-6">
      <PageHeader
        title="Employees"
        description="Manage your team members who provide services and handle appointments. Search and status filters run on the server via URL params."
        actions={
          <Button onClick={openCreate}>
            <Plus />
            New employee
          </Button>
        }
      />

      <DataTable
        columns={columns}
        data={employees}
        pageSize={10}
        isLoading={isFiltering}
        enableColumnVisibility
        emptyMessage={emptyMessage}
        toolbar={
          <ServerFiltersToolbar
            filters={filters}
            onLoadingChange={setIsFiltering}
          />
        }
      />

      <EmployeeFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        employee={editingEmployee}
        onSuccess={refreshList}
      />

      <AlertDialog
        open={Boolean(deletingEmployee)}
        onOpenChange={(open) => {
          if (!open) setDeletingEmployee(null)
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete employee?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete{" "}
              <strong>{deletingEmployee?.display_name}</strong>. Any existing
              appointment records associated with this employee may be affected
              depending on your database relationships.
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

function ServerFiltersToolbar({
  filters,
  onLoadingChange,
}: {
  filters: EmployeeListFilters
  onLoadingChange: (loading: boolean) => void
}) {
  return (
    <EmployeesFilters
      initialSearch={filters.search ?? ""}
      initialStatus={filters.status ?? "all"}
      onLoadingChange={onLoadingChange}
    />
  )
}