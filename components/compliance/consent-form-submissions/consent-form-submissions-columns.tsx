"use client"

import {
  MoreHorizontal,
  PencilIcon,
  Trash2Icon,
} from "lucide-react"

import {
  DataTableColumnHeader,
  type AdminColumnDef,
} from "@/components/shared/data-table"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import type {
  ConsentFormSubmissionWithRelations,
} from "@/lib/supabase/types"

type ConsentFormSubmissionColumnActions = {
  onEdit: (
    submission: ConsentFormSubmissionWithRelations
  ) => void

  onDelete: (
    submission: ConsentFormSubmissionWithRelations
  ) => void
}

export function getConsentFormSubmissionColumns({
  onEdit,
  onDelete,
}: ConsentFormSubmissionColumnActions): AdminColumnDef<ConsentFormSubmissionWithRelations>[] {
  return [
    {
      accessorKey: "template_id",
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title="Template"
        />
      ),
      cell: ({ row }) => (
        <div>
          <p className="font-medium text-foreground">
            {row.original.template?.name ??
              "Unknown template"}
          </p>

          {row.original.template ? (
            <p className="text-xs text-muted-foreground">
              v{row.original.template.version}
            </p>
          ) : null}
        </div>
      ),
    },

    {
      accessorKey: "owner_id",
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title="Owner"
        />
      ),
      cell: ({ row }) => (
        <div>
          <p className="font-medium text-foreground">
            {row.original.owner?.name ??
              "Unknown owner"}
          </p>

          {row.original.owner?.phone ? (
            <p className="text-xs text-muted-foreground">
              {row.original.owner.phone}
            </p>
          ) : null}
        </div>
      ),
    },

    {
      accessorKey: "pet_id",
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title="Pet"
        />
      ),
      cell: ({ row }) =>
        row.original.pet ? (
          <div>
            <p className="font-medium text-foreground">
              {row.original.pet.name}
            </p>
            <p className="text-xs capitalize text-muted-foreground">
              {row.original.pet.species}
            </p>
          </div>
        ) : (
          <span className="text-muted-foreground">
            —
          </span>
        ),
    },

    {
      accessorKey: "appointment_id",
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title="Appointment"
        />
      ),
      cell: ({ row }) =>
        row.original.appointment ? (
          <span>
            {new Date(
              row.original.appointment.starts_at
            ).toLocaleString()}
          </span>
        ) : (
          <span className="text-muted-foreground">
            —
          </span>
        ),
    },

    {
      accessorKey: "signed_at",
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title="Signed"
        />
      ),
      cell: ({ row }) => (
        <span>
          {new Date(
            row.original.signed_at
          ).toLocaleString()}
        </span>
      ),
    },

    {
      id: "signature",
      header: "Signature",
      enableSorting: false,
      cell: ({ row }) =>
        row.original.signature_data ? (
          <span className="text-sm text-foreground">
            Captured
          </span>
        ) : (
          <span className="text-muted-foreground">
            Not provided
          </span>
        ),
    },

    {
      id: "actions",
      header: "Actions",
      enableHiding: false,
      enableSorting: false,

      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label={`Actions for ${
                  row.original.template?.name ??
                  "submission"
                }`}
              />
            }
          >
            <MoreHorizontal />
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end">
            <DropdownMenuGroup>
              <DropdownMenuItem
                onClick={() =>
                  onEdit(row.original)
                }
              >
                <PencilIcon />
                Edit
              </DropdownMenuItem>

              <DropdownMenuItem
                variant="destructive"
                onClick={() =>
                  onDelete(row.original)
                }
              >
                <Trash2Icon />
                Delete
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ]
}