import { Suspense } from "react"

import { ReminderLogManager } from "@/components/communications/reminder-log/reminder-log-manager"
import { PageLoader } from "@/components/shared/page-loader"
import { parseReminderLogListFilters } from "@/lib/constants/reminder-log-filters"
import { listReminderLogs } from "@/lib/supabase/queries/reminder-log"

type ReminderLogsPageProps = {
  searchParams: Promise<
    Record<string, string | string[] | undefined>
  >
}

export default async function ReminderLogsPage({
  searchParams,
}: ReminderLogsPageProps) {
  const params = await searchParams

  const filters =
    parseReminderLogListFilters(params)

  const logs = await listReminderLogs(filters)

  return (
    <Suspense
      fallback={
        <PageLoader label="Loading reminder logs…" />
      }
    >
      <ReminderLogManager
        logs={logs}
        filters={filters}
      />
    </Suspense>
  )
}