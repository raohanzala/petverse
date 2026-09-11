import { DaycareSchedulesManager } from "./daycare-schedules-manager"
import { DaycareScheduleRow, PetRow } from "@/lib/supabase/types"

const DAYS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
]

type SchedulesTabProps = {
  schedules: DaycareScheduleRow[]
  pets: PetRow[]
}

function formatTime(value: string) {
  const [hours, minutes] = value.split(":").map(Number)

  const date = new Date()
  date.setHours(hours, minutes, 0, 0)

  return date.toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  })
}

export async function SchedulesTab({schedules, pets}: SchedulesTabProps) {

  return (
    <DaycareSchedulesManager
      schedules={schedules}
      pets={pets}
    />
  )
}