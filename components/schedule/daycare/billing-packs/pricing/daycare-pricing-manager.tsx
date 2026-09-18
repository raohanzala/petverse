"use client"

import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { Plus } from "lucide-react"

import { getDaycarePricingColumns } from "./daycare-pricing-columns"
import { DaycarePricingFilters } from "./daycare-pricing-filters"
import { DaycarePricingFormDialog } from "./daycare-pricing-form-dialog"
import { DataTable } from "@/components/shared/data-table"
import { PageHeader } from "@/components/shared/page-header"
import { Button } from "@/components/ui/button"
import type { DaycarePricingRow } from "@/lib/supabase/types"

type DaycarePricingManagerProps = {
  pricing: DaycarePricingRow | null
}

export function DaycarePricingManager({
  pricing,
}: DaycarePricingManagerProps) {
  const router = useRouter()

  const [isFiltering, setIsFiltering] = useState(false)
  const [formOpen, setFormOpen] = useState(false)
  const [editingPricing, setEditingPricing] =
    useState<DaycarePricingRow | null>(null)

  function refreshList() {
    router.refresh()
  }

  function openCreate() {
    setEditingPricing(null)
    setFormOpen(true)
  }

  function openEdit(pricingRow: DaycarePricingRow) {
    setEditingPricing(pricingRow)
    setFormOpen(true)
  }

  const columns = useMemo(
    () =>
      getDaycarePricingColumns({
        onEdit: openEdit,
      }),
    []
  )

  const pricingData = pricing ? [pricing] : []

  return (
    <div className="space-y-6">

      <DataTable
        columns={columns}
        data={pricingData}
        pageSize={10}
        isLoading={isFiltering}
        enableColumnVisibility
        emptyMessage="No daycare pricing configured yet. Create your first pricing record."
        toolbar={
          <DaycarePricingFilters
            onLoadingChange={setIsFiltering}
          />
        }
      />

      <DaycarePricingFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        pricing={editingPricing}
        onSuccess={refreshList}
      />
    </div>
  )
}