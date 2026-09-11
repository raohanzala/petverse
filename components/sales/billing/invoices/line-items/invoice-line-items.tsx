"use client"

import { useMemo, useState } from "react"
import { PlusIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

import { InvoiceLineItemForm } from "./invoice-line-item-form"
import { InvoiceLineItemRow } from "./invoice-line-item-row"

import type { InvoiceLineItemFormValues } from "@/lib/validations/invoice-line-item"

type InvoiceLineItemsProps = {
  value: InvoiceLineItemFormValues[]
  onChange: (items: InvoiceLineItemFormValues[]) => void
}

export function InvoiceLineItems({
  value,
  onChange,
}: InvoiceLineItemsProps) {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingItem, setEditingItem] =
    useState<InvoiceLineItemFormValues | null>(null)

  const subtotal = useMemo(
    () =>
      value.reduce(
        (sum, item) => sum + item.quantity * item.unit_price,
        0
      ),
    [value]
  )

  function openCreate() {
    setEditingItem(null)
    setDialogOpen(true)
  }

  function openEdit(item: InvoiceLineItemFormValues) {
    setEditingItem(item)
    setDialogOpen(true)
  }

  function handleSave(item: InvoiceLineItemFormValues) {
    const normalizedItem = {
      ...item,
      total: Number(
        (item.quantity * item.unit_price).toFixed(2)
      ),
    }

    if (editingItem?.id) {
      onChange(
        value.map((existing) =>
          existing.id === editingItem.id
            ? normalizedItem
            : existing
        )
      )
    } else {
      onChange([
        ...value,
        {
          ...normalizedItem,
          id: crypto.randomUUID(),
        },
      ])
    }

    setDialogOpen(false)
    setEditingItem(null)
  }

  function handleDelete(id?: string) {
    if (!id) return

    onChange(
      value.filter((item) => item.id !== id)
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-medium">Invoice items</h3>
          <p className="text-sm text-muted-foreground">
            Add the services or charges included in this invoice.
          </p>
        </div>

        <Dialog
          open={dialogOpen}
          onOpenChange={(open) => {
            setDialogOpen(open)

            if (!open) {
              setEditingItem(null)
            }
          }}
        >
          <DialogTrigger
            render={
              <Button
                type="button"
                size="sm"
                onClick={openCreate}
              />
            }
          >
            <PlusIcon />
            Add item
          </DialogTrigger>

          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>
                {editingItem
                  ? "Edit invoice item"
                  : "Add invoice item"}
              </DialogTitle>
            </DialogHeader>

            <InvoiceLineItemForm
              item={editingItem}
              onSubmit={handleSave}
              onCancel={() => setDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-lg border">
        {value.length === 0 ? (
          <div className="flex flex-col items-center justify-center px-6 py-10 text-center">
            <p className="font-medium">
              No invoice items
            </p>

            <p className="mt-1 text-sm text-muted-foreground">
              Add at least one item to calculate the invoice subtotal.
            </p>

            <Button
              type="button"
              variant="outline"
              size="sm"
              className="mt-4"
              onClick={openCreate}
            >
              <PlusIcon />
              Add first item
            </Button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-[1fr_80px_120px_120px_auto] gap-4 border-b bg-muted/40 px-4 py-2 text-xs font-medium text-muted-foreground">
              <span>Description</span>
              <span>Qty</span>
              <span>Unit price</span>
              <span>Total</span>
              <span />
            </div>

            <div className="px-4">
              {value.map((item) => (
                <InvoiceLineItemRow
                  key={item.id}
                  item={item}
                  onEdit={() => openEdit(item)}
                  onDelete={() => handleDelete(item.id)}
                />
              ))}
            </div>
          </>
        )}
      </div>

      <div className="flex justify-end">
        <div className="w-full max-w-xs space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">
              Subtotal
            </span>

            <span className="font-medium">
              ${subtotal.toFixed(2)}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}