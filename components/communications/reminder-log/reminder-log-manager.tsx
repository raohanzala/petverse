"use client"

import { useMemo, useState } from "react"

import { getReminderLogColumns } from "@/components/communications/reminder-log/reminder-log-columns"
import { ReminderLogFilters } from "@/components/communications/reminder-log/reminder-log-filters"
import { DataTable } from "@/components/shared/data-table"
import { PageHeader } from "@/components/shared/page-header"
import type { ReminderLogListFilters } from "@/lib/constants/reminder-log-filters"
import type { ReminderLogRow } from "@/lib/supabase/types"

type ReminderLogManagerProps = {
  logs: ReminderLogRow[]
  filters: ReminderLogListFilters
}

export function ReminderLogManager({
  logs,
  filters,
}: ReminderLogManagerProps) {
  const [isFiltering, setIsFiltering] = useState(false)

  const columns = useMemo(
    () => getReminderLogColumns(),
    []
  )

  const emptyMessage =
    filters.search ||
    filters.status !== "all" ||
    filters.channel !== "all"
      ? "No reminder logs match your filters."
      : "No reminder logs yet."

  return (
    <div className="space-y-6">
      <PageHeader
        title="Reminder logs"
        description="View the delivery history of automated customer reminders."
      />

      <DataTable
        columns={columns}
        data={logs}
        pageSize={10}
        isLoading={isFiltering}
        enableColumnVisibility
        emptyMessage={emptyMessage}
        toolbar={
          <ReminderLogFilters
            initialSearch={filters.search ?? ""}
            initialStatus={filters.status ?? "all"}
            initialChannel={filters.channel ?? "all"}
            onLoadingChange={setIsFiltering}
          />
        }
      />
    </div>
  )
}