import { Suspense } from "react"

import { EmployeesManager } from "@/components/staff/employees-manager"
import { PageLoader } from "@/components/shared/page-loader"
import { parseEmployeeListFilters } from "@/lib/constants/employee-filters"
import { listEmployees } from "@/lib/supabase/queries/employees"

type EmployeesPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export default async function EmployeesPage({
  searchParams,
}: EmployeesPageProps) {
  const params = await searchParams
  const filters = parseEmployeeListFilters(params)
  const employees = await listEmployees(filters)

  return (
    <Suspense fallback={<PageLoader label="Loading employees…" />}>
      <EmployeesManager
        employees={employees}
        filters={filters}
      />
    </Suspense>
  )
}