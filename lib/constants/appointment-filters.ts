import type { AppointmentStatus } from "@/lib/supabase/types"

export type AppointmentListFilters = {
  search?: string
  status?: AppointmentStatus | "all"
  from?: string
  to?: string
  employee?: string
  service?: string
}

export const DEFAULT_APPOINTMENT_FILTERS: Required<
  Pick<AppointmentListFilters, "status">
> = {
  status: "all",
}

type SearchParams = Record<
  string,
  string | string[] | undefined
>

export function parseAppointmentFilters(
  params: SearchParams
): AppointmentListFilters {
  const getValue = (key: string) => {
    const value = params[key]

    if (Array.isArray(value)) {
      return value[0]
    }

    return value
  }

  return {
    search: getValue("q") ?? "",
    status: (getValue("status") as AppointmentStatus) ?? "all",
    from: getValue("from") ?? "",
    to: getValue("to") ?? "",
    employee: getValue("employee") ?? "",
    service: getValue("service") ?? "",
  }
}