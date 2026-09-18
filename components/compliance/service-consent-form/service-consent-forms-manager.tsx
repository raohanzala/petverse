"use client"

import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { Plus } from "lucide-react"
import { toast } from "@/components/ui/toast"

import { ServiceConsentFormDialog } from "./service-consent-form-dialog"
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
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type {
    ServiceConsentFormListFilters,
} from "@/lib/constants/service-consent-form-filters"
import { deleteServiceConsentForm } from "@/lib/supabase/mutations/service-consent-forms"
import type {
    ServiceConsentFormServiceOption,
    ServiceConsentFormTemplateOption,
    ServiceConsentFormWithTemplate,
} from "@/lib/supabase/types"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

type ServiceConsentFormsManagerProps = {
    assignments: ServiceConsentFormWithTemplate[]
    services: ServiceConsentFormServiceOption[]
    templates: ServiceConsentFormTemplateOption[]
    selectedServiceId: string
}

export function ServiceConsentFormsManager({
    assignments,
    services,
    templates,
    selectedServiceId,
}: ServiceConsentFormsManagerProps) {
    const router = useRouter()

    const [formOpen, setFormOpen] =
        useState(false)

    const [deletingAssignment, setDeletingAssignment] =
        useState<ServiceConsentFormWithTemplate | null>(
            null
        )

    const [isDeleting, setIsDeleting] =
        useState(false)

    function refreshList() {
        router.refresh()
    }

    function openCreate() {
        setFormOpen(true)
    }

    async function confirmDelete() {
        if (!deletingAssignment) return

        setIsDeleting(true)

        const result =
            await deleteServiceConsentForm({
                service_id:
                    deletingAssignment.service_id,
                template_id:
                    deletingAssignment.template_id,
            })

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
            description:
                "Consent form template removed",
            priority: "high",
        })

        setDeletingAssignment(null)
        refreshList()
    }

    const selectedService =
        services.find(
            (service) =>
                service.id === selectedServiceId
        )

    const columns = useMemo(
        () => [
            {
                accessorKey: "template_id",
                header: "Consent form",
                cell: ({
                    row,
                }: {
                    row: {
                        original: ServiceConsentFormWithTemplate
                    }
                }) => (
                    <div>
                        <p className="font-medium text-foreground">
                            {row.original.template?.name ??
                                "Unknown template"}
                        </p>

                        {row.original.template ? (
                            <p className="text-xs text-muted-foreground">
                                Version{" "}
                                {row.original.template.version}
                            </p>
                        ) : null}
                    </div>
                ),
            },

            {
                accessorKey: "template",
                header: "Status",
                cell: ({
                    row,
                }: {
                    row: {
                        original: ServiceConsentFormWithTemplate
                    }
                }) =>
                    row.original.template?.is_active ? (
                        <Badge variant="completed">
                            Active
                        </Badge>
                    ) : (
                        <Badge variant="secondary">
                            Inactive
                        </Badge>
                    ),
            },

            {
                id: "actions",
                header: "Actions",
                enableHiding: false,
                enableSorting: false,
                cell: ({
                    row,
                }: {
                    row: {
                        original: ServiceConsentFormWithTemplate
                    }
                }) => (
                    <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:text-destructive"
                        onClick={() =>
                            setDeletingAssignment(
                                row.original
                            )
                        }
                    >
                        Remove
                    </Button>
                ),
            },
        ],
        []
    )

    const assignedTemplateIds =
        assignments.map(
            (assignment) =>
                assignment.template_id
        )

    const emptyMessage =
        selectedServiceId
            ? "No consent form templates are assigned to this service yet."
            : "Select a service to manage its consent forms."

    return (
        <div className="space-y-6">
            <PageHeader
                title="Service consent forms"
                description="Assign consent form templates to services. Assigned templates can be presented to clients when those services are booked."
                actions={
                    <Button
                        onClick={openCreate}
                        disabled={!selectedServiceId}
                    >
                        <Plus />
                        Assign template
                    </Button>
                }
            />

            <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-medium text-foreground">
                    Service:
                </span>

                <Select
                    value={selectedServiceId}
                    onValueChange={(value) => {
                        if (!value) return

                        const params = new URLSearchParams(
                            window.location.search
                        )

                        params.set("service", value)

                        router.replace(
                            `/admin/compliance/service-consent-forms?${params.toString()}`
                        )
                    }}
                >
                    <SelectTrigger className="h-9 w-[240px]">
                        <SelectValue>
                            {selectedService?.name ??
                                "Select a service"}
                        </SelectValue>
                    </SelectTrigger>

                    <SelectContent>
                        {services.map((service) => (
                            <SelectItem
                                key={service.id}
                                value={service.id}
                            >
                                {service.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <DataTable
                columns={columns}
                data={assignments}
                pageSize={10}
                enableColumnVisibility
                emptyMessage={emptyMessage}
            />

            <ServiceConsentFormDialog
                open={formOpen}
                onOpenChange={setFormOpen}
                services={services}
                templates={templates}
                selectedServiceId={
                    selectedServiceId
                }
                assignedTemplateIds={
                    assignedTemplateIds
                }
                onSuccess={refreshList}
            />

            <AlertDialog
                open={Boolean(deletingAssignment)}
                onOpenChange={(open) => {
                    if (!open) {
                        setDeletingAssignment(null)
                    }
                }}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            Remove consent form?
                        </AlertDialogTitle>

                        <AlertDialogDescription>
                            This will remove{" "}
                            <strong>
                                {
                                    deletingAssignment?.template
                                        ?.name
                                }
                            </strong>{" "}
                            from{" "}
                            <strong>
                                {selectedService?.name ??
                                    "this service"}
                            </strong>
                            . The consent form template itself
                            will not be deleted.
                        </AlertDialogDescription>
                    </AlertDialogHeader>

                    <AlertDialogFooter>
                        <AlertDialogCancel
                            disabled={isDeleting}
                        >
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
                            {isDeleting
                                ? "Removing…"
                                : "Remove"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}