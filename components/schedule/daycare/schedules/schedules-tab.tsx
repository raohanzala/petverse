import { DaycareSchedulesManager } from "./daycare-schedules-manager"
import { DaycareScheduleListRow, FacilityResourceRow, OwnerRow, PetRow } from "@/lib/supabase/types"

type SchedulesTabProps = {
  schedules: DaycareScheduleListRow[]
  pets: PetRow[]
  owners: OwnerRow[]
  resources: FacilityResourceRow[]
}

export async function SchedulesTab({ schedules, pets, owners, resources }: SchedulesTabProps) {

  return (
    <DaycareSchedulesManager
      owners={owners}
      resources={resources}
      schedules={schedules}
      pets={pets}
    />
  )
}