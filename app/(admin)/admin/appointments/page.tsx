import { Suspense } from "react"

import { AppointmentsManager } from "@/components/appointments/appointments-manager"
import { PageLoader } from "@/components/shared/page-loader"
import { parseAppointmentListFilters } from "@/lib/constants/appointment-filters"
import { listAppointments } from "@/lib/supabase/queries/appointments"
import { listOwnersForSelection } from "@/lib/supabase/queries/owners"
import { listActivePets } from "@/lib/supabase/queries/pets"
import { listActiveEmployees } from "@/lib/supabase/queries/employees"
import { listActiveServices } from "@/lib/supabase/queries/services"
import { listActiveServicePackages } from "@/lib/supabase/queries/service-packages"

type AppointmentsPageProps = {
  searchParams: Promise<
    Record<string, string | string[] | undefined>
  >
}

export default async function AppointmentsPage({
  searchParams,
}: AppointmentsPageProps) {
  const params = await searchParams

  const filters = parseAppointmentListFilters(params)

  const [
    appointments,
    owners,
    pets,
    services,
    packages,
    employees,
  ] = await Promise.all([
    listAppointments(filters),
    listOwnersForSelection(),
    listActivePets(),
    listActiveServices(),
    listActiveServicePackages(),
    listActiveEmployees(),
  ])

  return (
    <Suspense
      fallback={
        <PageLoader label="Loading appointments…" />
      }
    >
      <AppointmentsManager
        appointments={appointments}
        owners={owners}
        pets={pets}
        services={services}
        packages={packages}
        employees={employees}
        filters={filters}
      />
    </Suspense>
  )
}