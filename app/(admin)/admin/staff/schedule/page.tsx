import { Suspense } from "react"

import { EmployeeSchedulesManager } from "@/components/staff/employee-schedules-manager"
import { PageLoader } from "@/components/shared/page-loader"
import {
  listEmployeeSchedules,
} from "@/lib/supabase/queries/employee-schedules"
import {
  listActiveEmployees,
} from "@/lib/supabase/queries/employees"

export default async function EmployeeSchedulesPage() {
  const [schedules, employees] = await Promise.all([
    listEmployeeSchedules(),
    listActiveEmployees(),
  ])

  return (
    <Suspense fallback={<PageLoader label="Loading schedules…" />}>
      <EmployeeSchedulesManager
        schedules={schedules}
        employees={employees}
      />
    </Suspense>
  )
}