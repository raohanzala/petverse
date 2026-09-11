"use client"

import { PencilIcon, Trash2Icon } from "lucide-react"

import { Button } from "@/components/ui/button"
import type { InvoiceLineItemFormValues } from "@/lib/validations/invoice-line-item"

type InvoiceLineItemRowProps = {
  item: InvoiceLineItemFormValues
  onEdit: () => void
  onDelete: () => void
}

export function InvoiceLineItemRow({
  item,
  onEdit,
  onDelete,
}: InvoiceLineItemRowProps) {
  return (
    <div className="grid grid-cols-[1fr_80px_120px_120px_auto] items-center gap-4 border-b py-3 last:border-b-0">
      <div className="min-w-0">
        <p className="truncate font-medium">
          {item.description}
        </p>
      </div>

      <div className="text-sm text-muted-foreground">
        {item.quantity}
      </div>

      <div className="text-sm">
        ${item.unit_price.toFixed(2)}
      </div>

      <div className="font-medium">
        ${item.total.toFixed(2)}
      </div>

      <div className="flex justify-end gap-1">
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          onClick={onEdit}
          aria-label="Edit line item"
        >
          <PencilIcon />
        </Button>

        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          onClick={onDelete}
          aria-label="Delete line item"
        >
          <Trash2Icon />
        </Button>
      </div>
    </div>
  )
}