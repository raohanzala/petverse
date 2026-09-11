"use client"

import {
  Copy,
  ExternalLink,
  MoreHorizontal,
  Pencil,
  Trash2,
} from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { getPaymentLinkStatus } from "@/lib/constants/payment-link-status"
import type { PaymentLinkListRow } from "@/lib/supabase/types"

type PaymentLinksColumnsProps = {
  onEdit: (paymentLink: PaymentLinkListRow) => void
  onDelete: (paymentLink: PaymentLinkListRow) => void
}

function getPaymentLinkUrl(token: string) {
  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL ??
    window.location.origin

  return `${baseUrl}/pay/${token}`
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value))
}

function formatCurrency(
  amount: number,
  currency: string
) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(amount)
}

function StatusBadge({
  status,
}: {
  status: "active" | "used" | "expired"
}) {
  const config = {
    active: {
      label: "Active",
      className:
        "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
    },
    used: {
      label: "Used",
      className:
        "bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
    },
    expired: {
      label: "Expired",
      className:
        "bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300",
    },
  }

  const item = config[status]

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${item.className}`}
    >
      {item.label}
    </span>
  )
}

export function getPaymentLinksColumns({
  onEdit,
  onDelete,
}: PaymentLinksColumnsProps) {
  return [
    {
      accessorKey: "invoice",
      header: "Invoice",
      cell: ({
        row,
      }: {
        row: {
          original: PaymentLinkListRow
        }
      }) => {
        const paymentLink = row.original
        const invoice = paymentLink.invoice

        return (
          <div className="flex flex-col">
            <span className="font-medium">
              {invoice?.number
                ? `INV-${String(
                    invoice.number
                  ).padStart(4, "0")}`
                : "Invoice"}
            </span>

            <span className="text-xs text-muted-foreground">
              {invoice
                ? formatCurrency(
                    invoice.total,
                    invoice.currency
                  )
                : "Invoice unavailable"}
            </span>
          </div>
        )
      },
    },

    {
      accessorKey: "amount",
      header: "Amount",
      cell: ({
        row,
      }: {
        row: {
          original: PaymentLinkListRow
        }
      }) => {
        const invoice =
          row.original.invoice

        if (!invoice) {
          return "—"
        }

        return (
          <span className="font-medium">
            {formatCurrency(
              invoice.total,
              invoice.currency
            )}
          </span>
        )
      },
    },

    {
      accessorKey: "status",
      header: "Status",
      cell: ({
        row,
      }: {
        row: {
          original: PaymentLinkListRow
        }
      }) => {
        const status =
          getPaymentLinkStatus(
            row.original
          )

        return (
          <StatusBadge status={status} />
        )
      },
    },

    {
      accessorKey: "expires_at",
      header: "Expires",
      cell: ({
        row,
      }: {
        row: {
          original: PaymentLinkListRow
        }
      }) => {
        const paymentLink = row.original

        return (
          <span className="text-sm">
            {formatDate(
              paymentLink.expires_at
            )}
          </span>
        )
      },
    },

    {
      accessorKey: "created_at",
      header: "Created",
      cell: ({
        row,
      }: {
        row: {
          original: PaymentLinkListRow
        }
      }) => (
        <span className="text-sm text-muted-foreground">
          {formatDate(
            row.original.created_at
          )}
        </span>
      ),
    },

    {
      id: "actions",
      header: "",
      cell: ({
        row,
      }: {
        row: {
          original: PaymentLinkListRow
        }
      }) => {
        const paymentLink =
          row.original

        const status =
          getPaymentLinkStatus(
            paymentLink
          )

        const url =
          getPaymentLinkUrl(
            paymentLink.token
          )

        async function copyLink() {
          await navigator.clipboard.writeText(
            url
          )

          toast.success(
            "Payment link copied"
          )
        }

        function openLink() {
          window.open(
            url,
            "_blank",
            "noopener,noreferrer"
          )
        }

        return (
          <DropdownMenu>
            <DropdownMenuTrigger>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
              >
                <MoreHorizontal />
                <span className="sr-only">
                  Open actions
                </span>
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent
              align="end"
              className="w-44"
            >
              <DropdownMenuItem
                onClick={copyLink}
              >
                <Copy />
                Copy link
              </DropdownMenuItem>

              <DropdownMenuItem
                onClick={openLink}
              >
                <ExternalLink />
                View link
              </DropdownMenuItem>

              {status !== "used" && (
                <>
                  <DropdownMenuSeparator />

                  <DropdownMenuItem
                    onClick={() =>
                      onEdit(paymentLink)
                    }
                  >
                    <Pencil />
                    Edit expiration
                  </DropdownMenuItem>
                </>
              )}

              <DropdownMenuSeparator />

              <DropdownMenuItem
                variant="destructive"
                onClick={() =>
                  onDelete(paymentLink)
                }
              >
                <Trash2 />
                Delete link
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ]
}