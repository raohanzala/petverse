import { Suspense } from "react"
import { DailyUpdatesManager } from "@/components/communications/daily-updates/daily-updates-manager"
import { PageLoader } from "@/components/shared/page-loader"
import {
  parseDailyUpdateListFilters,
} from "@/lib/constants/daily-update-filters"
import {
  listDailyUpdateAppointments,
  listDailyUpdateEmployees,
  listDailyUpdatePets,
  listDailyUpdates,
} from "@/lib/supabase/queries/daily-updates"

type DailyUpdatesPageProps = {
  searchParams: Promise<
    Record<string, string | string[] | undefined>
  >
}

export default async function DailyUpdatesPage({
  searchParams,
}: DailyUpdatesPageProps) {
  const params = await searchParams

  const filters =
    parseDailyUpdateListFilters(params)

  const [
    updates,
    pets,
    appointments,
    employees,
  ] = await Promise.all([
    listDailyUpdates(filters),
    listDailyUpdatePets(),
    listDailyUpdateAppointments(),
    listDailyUpdateEmployees(),
  ])

  return (
    <Suspense
      fallback={
        <PageLoader label="Loading daily updates…" />
      }
    >
      <DailyUpdatesManager
        updates={updates}
        filters={filters}
        pets={pets}
        appointments={appointments}
        employees={employees}
      />
    </Suspense>
  )
}