import { Suspense } from "react"

import { AttendanceEntriesManager } from "@/components/schedule/boarding/attendance/attendance-entries-manager"
import { PageLoader } from "@/components/shared/page-loader"
import { parseAttendanceEntryListFilters } from "@/lib/constants/attendance-entries-filters"
import { listAttendanceEntries } from "@/lib/supabase/queries/attendance-entries"
import { listReservations } from "@/lib/supabase/queries/reservations"

type AttendanceTabProps = {
  searchParams: Record<
    string,
    string | string[] | undefined
  >
}

export async function AttendanceTab({
  searchParams,
}: AttendanceTabProps) {
  const filters =
    parseAttendanceEntryListFilters(searchParams)

  const entries = await listAttendanceEntries(filters)
  const reservations = await listReservations()

  return (
    <Suspense
      fallback={
        <PageLoader label="Loading attendance entries…" />
      }
    >
      <AttendanceEntriesManager
        reservations={reservations}
        entries={entries}
        filters={filters}
      />
    </Suspense>
  )
}