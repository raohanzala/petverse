"use client"

import { SearchIcon } from "lucide-react"
import {
  usePathname,
  useRouter,
  useSearchParams,
} from "next/navigation"
import {
  useCallback,
  useEffect,
  useState,
  useTransition,
} from "react"
import { format } from "date-fns"

import type {
  AppointmentStatus,
  EmployeeRow,
  ServiceRow,
} from "@/lib/supabase/types"

import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { DatePicker } from "@/components/ui/date-picker"
import { cn } from "@/lib/utils"

type AppointmentStatusFilter =
  | AppointmentStatus
  | "all"

type AppointmentsFiltersProps = {
  initialSearch?: string
  initialStatus: AppointmentStatusFilter
  initialFrom?: string
  initialTo?: string
  initialEmployee?: string
  initialService?: string
  employees: EmployeeRow[]
  services: ServiceRow[]
  onLoadingChange?: (isLoading: boolean) => void
  className?: string
}

const APPOINTMENT_STATUS_LABELS: Record<
  AppointmentStatusFilter,
  string
> = {
  all: "All statuses",
  requested: "Requested",
  confirmed: "Confirmed",
  arrived: "Arrived",
  in_service: "In service",
  completed: "Completed",
  cancelled: "Cancelled",
  no_show: "No show",
}

export function AppointmentsFilters({
  initialSearch = "",
  initialStatus,
  initialFrom = "",
  initialTo = "",
  initialEmployee = "",
  initialService = "",
  employees,
  services,
  onLoadingChange,
  className,
}: AppointmentsFiltersProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const [isPending, startTransition] = useTransition()
  const [search, setSearch] = useState(initialSearch)

  useEffect(() => {
    onLoadingChange?.(isPending)
  }, [isPending, onLoadingChange])

  const updateParams = useCallback(
    (updates: {
      q?: string | null
      status?: AppointmentStatusFilter
      from?: string | null
      to?: string | null
      employee?: string | null
      service?: string | null
    }) => {
      const params = new URLSearchParams(
        searchParams.toString()
      )

      if (updates.q !== undefined) {
        const value = updates.q?.trim()

        if (value) {
          params.set("q", value)
        } else {
          params.delete("q")
        }
      }

      if (updates.status !== undefined) {
        if (updates.status === "all") {
          params.delete("status")
        } else {
          params.set("status", updates.status)
        }
      }

      if (updates.from !== undefined) {
        if (updates.from) {
          params.set("from", updates.from)
        } else {
          params.delete("from")
        }
      }

      if (updates.to !== undefined) {
        if (updates.to) {
          params.set("to", updates.to)
        } else {
          params.delete("to")
        }
      }

      if (updates.employee !== undefined) {
        if (updates.employee) {
          params.set("employee", updates.employee)
        } else {
          params.delete("employee")
        }
      }

      if (updates.service !== undefined) {
        if (updates.service) {
          params.set("service", updates.service)
        } else {
          params.delete("service")
        }
      }

      const query = params.toString()

      startTransition(() => {
        router.replace(
          query
            ? `${pathname}?${query}`
            : pathname
        )
      })
    },
    [pathname, router, searchParams]
  )

  const urlSearch = searchParams.get("q") ?? ""

  useEffect(() => {
    if (search === urlSearch) return

    const timer = window.setTimeout(() => {
      updateParams({ q: search })
    }, 350)

    return () => window.clearTimeout(timer)
  }, [search, urlSearch, updateParams])

  const fromDate = initialFrom
    ? new Date(`${initialFrom}T00:00:00`)
    : undefined

  const toDate = initialTo
    ? new Date(`${initialTo}T00:00:00`)
    : undefined

  return (
    <div
      className={cn(
        "flex flex-1 flex-wrap items-center gap-2",
        className
      )}
    >
      {/* Search */}
      <div className="relative w-full max-w-sm">
        <SearchIcon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />

        <Input
          placeholder="Search appointments…"
          value={search}
          onChange={(event) =>
            setSearch(event.target.value)
          }
          className="h-9 bg-white pl-9 shadow-none"
          aria-label="Search appointments"
        />
      </div>

      {/* From date */}
      <DatePicker
        date={fromDate}
        onDateChange={(date) => {
          updateParams({
            from: date
              ? format(date, "yyyy-MM-dd")
              : null,
          })
        }}
        placeholder="From date"
      />

      {/* To date */}
      <DatePicker
        date={toDate}
        onDateChange={(date) => {
          updateParams({
            to: date
              ? format(date, "yyyy-MM-dd")
              : null,
          })
        }}
        placeholder="To date"
      />

      {/* Team member */}
      <Select
        value={initialEmployee || "all"}
        onValueChange={(value) => {
          updateParams({
            employee:
              value === "all" ? null : value,
          })
        }}
      >
        <SelectTrigger className="h-9 w-[170px]">
          <SelectValue>
            {initialEmployee
              ? employees.find(
                  (employee) =>
                    employee.id ===
                    initialEmployee
                )?.display_name ??
                "Team member"
              : "Team member"}
          </SelectValue>
        </SelectTrigger>

        <SelectContent>
          <SelectItem value="all">
            All team members
          </SelectItem>

          {employees.map((employee) => (
            <SelectItem
              key={employee.id}
              value={employee.id}
            >
              {employee.display_name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Service */}
      <Select
        value={initialService || "all"}
        onValueChange={(value) => {
          updateParams({
            service:
              value === "all" ? null : value,
          })
        }}
      >
        <SelectTrigger className="h-9 w-[170px]">
          <SelectValue>
            {initialService
              ? services.find(
                  (service) =>
                    service.id === initialService
                )?.name ?? "Service"
              : "Service"}
          </SelectValue>
        </SelectTrigger>

        <SelectContent>
          <SelectItem value="all">
            All services
          </SelectItem>

          {services.map((service) => (
            <SelectItem
              key={service.id}
              value={service.id}
            >
              {service.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Status */}
      <Select
        value={initialStatus}
        onValueChange={(value) => {
          if (!value) return

          updateParams({
            status:
              value as AppointmentStatusFilter,
          })
        }}
      >
        <SelectTrigger className="h-9 w-[160px]">
          <SelectValue>
            {initialStatus === "all"
              ? APPOINTMENT_STATUS_LABELS.all
              : `Status: ${
                  APPOINTMENT_STATUS_LABELS[
                    initialStatus
                  ]
                }`}
          </SelectValue>
        </SelectTrigger>

        <SelectContent>
          <SelectItem value="all">
            All statuses
          </SelectItem>

          <SelectItem value="requested">
            Requested
          </SelectItem>

          <SelectItem value="confirmed">
            Confirmed
          </SelectItem>

          <SelectItem value="arrived">
            Arrived
          </SelectItem>

          <SelectItem value="in_service">
            In service
          </SelectItem>

          <SelectItem value="completed">
            Completed
          </SelectItem>

          <SelectItem value="cancelled">
            Cancelled
          </SelectItem>

          <SelectItem value="no_show">
            No show
          </SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
}