import Link from "next/link"
import { notFound } from "next/navigation"
import {
  ArrowLeft,
  CreditCard,
  FileText,
  UserRound,
} from "lucide-react"

import { createClient } from "@/lib/supabase/server"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

type InvoicePageProps = {
  params: Promise<{
    id: string
  }>
}

function formatDate(value: string | null) {
  if (!value) return "—"

  return new Date(value).toLocaleDateString([], {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

function formatMoney(
  currency: string,
  value: number
) {
  return `${currency} ${Number(value).toFixed(2)}`
}

function getStatusBadge(
  status: "draft" | "open" | "paid" | "void"
) {
  if (status === "paid") {
    return <Badge variant="completed">Paid</Badge>
  }

  if (status === "open") {
    return <Badge variant="default">Open</Badge>
  }

  if (status === "void") {
    return (
      <Badge variant="destructive">
        Void
      </Badge>
    )
  }

  return <Badge variant="secondary">Draft</Badge>
}

function DetailItem({
  label,
  value,
}: {
  label: string
  value: React.ReactNode
}) {
  return (
    <div className="space-y-1">
      <p className="text-xs text-muted-foreground">
        {label}
      </p>

      <p className="text-sm font-medium">
        {value || "—"}
      </p>
    </div>
  )
}

export default async function InvoicePage({
  params,
}: InvoicePageProps) {
  const { id } = await params

  const supabase = await createClient()

  const { data: invoice, error } = await supabase
    .from("invoices")
    .select(`
      id,
      owner_id,
      appointment_id,
      number,
      status,
      subtotal,
      tax,
      total,
      currency,
      issued_at,
      paid_at,
      voided_at,
      notes,
      created_at,
      updated_at,

      owner:owners (
        id,
        name,
        phone,
        email
      ),

      appointment:appointments (
        pet:pets (
          id,
          name,
          species
        )
      ),

      invoice_line_items (
        id,
        description,
        quantity,
        unit_price,
        total
      )
    `)
    .eq("id", id)
    .maybeSingle()

  if (error) {
    throw new Error(error.message)
  }

  if (!invoice) {
    notFound()
  }

  const owner = Array.isArray(invoice.owner)
    ? invoice.owner[0] ?? null
    : invoice.owner

  const appointment = Array.isArray(invoice.appointment)
    ? invoice.appointment[0] ?? null
    : invoice.appointment

  const pet = appointment?.pet
    ? Array.isArray(appointment.pet)
      ? appointment.pet[0] ?? null
      : appointment.pet
    : null

  const lineItems = invoice.invoice_line_items ?? []

  return (
    <div className="space-y-6">
      {/* Back */}
      <Button
        variant="ghost"
        size="sm"
        render={
          <Link href="/admin/sales/billing">
            <ArrowLeft />
            Back to Invoices
          </Link>
        }
      />

      {/* Invoice Header */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-2xl font-semibold tracking-tight">
                  {invoice.number
                    ? `#${invoice.number}`
                    : "Invoice"}
                </h1>

                {getStatusBadge(invoice.status)}
              </div>

              <p className="mt-2 text-sm text-muted-foreground">
                {formatDate(
                  invoice.issued_at ??
                    invoice.created_at
                )}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bill To */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserRound className="size-5" />
            Bill To
          </CardTitle>
        </CardHeader>

        <CardContent>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <DetailItem
              label="Owner"
              value={owner?.name ?? "-"}
            />

            <DetailItem
              label="Phone"
              value={owner?.phone ?? "-"}
            />

            <DetailItem
              label="Email"
              value={owner?.email ?? "-"}
            />

            <DetailItem
              label="Pet"
              value={pet?.name ?? "-"}
            />
          </div>
        </CardContent>
      </Card>

      {/* Invoice Items */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="size-5" />
            Invoice Details
          </CardTitle>
        </CardHeader>

        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left">
                  <th className="pb-3 font-medium">
                    Description
                  </th>

                  <th className="pb-3 text-right font-medium">
                    Qty
                  </th>

                  <th className="pb-3 text-right font-medium">
                    Unit Price
                  </th>

                  <th className="pb-3 text-right font-medium">
                    Total
                  </th>
                </tr>
              </thead>

              <tbody>
                {lineItems.map((item) => (
                  <tr
                    key={item.id}
                    className="border-b last:border-0"
                  >
                    <td className="py-4">
                      {item.description}
                    </td>

                    <td className="py-4 text-right">
                      {item.quantity}
                    </td>

                    <td className="py-4 text-right">
                      {formatMoney(
                        invoice.currency,
                        item.unit_price
                      )}
                    </td>

                    <td className="py-4 text-right font-medium">
                      {formatMoney(
                        invoice.currency,
                        item.total
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-6 ml-auto w-full max-w-sm space-y-3 border-t pt-4">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">
                Subtotal
              </span>

              <span>
                {formatMoney(
                  invoice.currency,
                  invoice.subtotal
                )}
              </span>
            </div>

            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">
                Tax
              </span>

              <span>
                {formatMoney(
                  invoice.currency,
                  invoice.tax
                )}
              </span>
            </div>

            <div className="flex justify-between border-t pt-3 text-base font-semibold">
              <span>Total</span>

              <span>
                {formatMoney(
                  invoice.currency,
                  invoice.total
                )}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="size-5" />
            Payment
          </CardTitle>
        </CardHeader>

        <CardContent>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <DetailItem
              label="Method"
              value="-"
            />

            <DetailItem
              label="Status"
              value={getStatusBadge(
                invoice.status
              )}
            />

            <DetailItem
              label="Paid"
              value={formatDate(
                invoice.paid_at
              )}
            />
          </div>
        </CardContent>
      </Card>

      {/* Notes */}
      {invoice.notes ? (
        <Card>
          <CardHeader>
            <CardTitle>Notes</CardTitle>
          </CardHeader>

          <CardContent>
            <div className="rounded-lg border bg-muted/30 p-4">
              <p className="whitespace-pre-wrap text-sm leading-6">
                {invoice.notes}
              </p>
            </div>
          </CardContent>
        </Card>
      ) : null}
    </div>
  )
}