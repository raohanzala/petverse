"use client"

import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "@/components/ui/toast"

import { getTodayDaycareColumns } from "./today-daycare-columns"
import { TodayDaycareFilters } from "./today-daycare-filters"

import { DataTable } from "@/components/shared/data-table"
import { PageHeader } from "@/components/shared/page-header"

import type { DaycareTodayListFilters } from "@/lib/constants/daycare-today-filters"
import type { DaycareTransactionRow } from "@/lib/supabase/types"

import {
  cancelDaycareSession,
  checkInDaycareSession,
  checkOutDaycareSession,
} from "@/lib/supabase/mutations/daycare-session-actions"

type TodayDaycareManagerProps = {
  transactions: DaycareTransactionRow[]
  filters: DaycareTodayListFilters
}

export function TodayDaycareManager({
  transactions,
  filters,
}: TodayDaycareManagerProps) {
  const router = useRouter()

  const [isFiltering, setIsFiltering] =
    useState(false)

  const [isActionLoading, setIsActionLoading] =
    useState(false)

  async function handleCheckIn(
    transaction: DaycareTransactionRow
  ) {
    setIsActionLoading(true)

    const result =
      await checkInDaycareSession(
        transaction.id
      )

    setIsActionLoading(false)

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
        "Daycare session checked in",
      priority: "high",
    })

    router.refresh()
  }

  async function handleCheckOut(
    transaction: DaycareTransactionRow
  ) {
    setIsActionLoading(true)

    const result =
      await checkOutDaycareSession(
        transaction.id
      )

    setIsActionLoading(false)

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
        "Daycare session checked out",
      priority: "high",
    })

    router.refresh()
  }

  async function handleCancel(
    transaction: DaycareTransactionRow
  ) {
    setIsActionLoading(true)

    const result =
      await cancelDaycareSession(
        transaction.id
      )

    setIsActionLoading(false)

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
        "Daycare session cancelled",
      priority: "high",
    })

    router.refresh()
  }

  const columns = useMemo(
    () =>
      getTodayDaycareColumns({
        onCheckIn: handleCheckIn,
        onCheckOut: handleCheckOut,
        onCancel: handleCancel,
        isActionLoading,
      }),
    [isActionLoading]
  )

  const emptyMessage =
    filters.search ||
    filters.status !== "all"
      ? "No daycare sessions match your filters."
      : "No daycare sessions scheduled for today."

  return (
    <div className="space-y-6">
      <PageHeader
        title="Today"
        description="Manage today's daycare sessions, check-ins, check-outs, and cancellations."
      />

      <DataTable
        columns={columns}
        data={transactions}
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
    </div>
  )
}

function ServerFiltersToolbar({
  filters,
  onLoadingChange,
}: {
  filters: DaycareTodayListFilters
  onLoadingChange: (loading: boolean) => void
}) {
  return (
    <TodayDaycareFilters
      initialSearch={filters.search}
      initialStatus={filters.status}
      onLoadingChange={onLoadingChange}
    />
  )
}