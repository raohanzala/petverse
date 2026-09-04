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

import type { AppointmentStatus } from "@/lib/supabase/types"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"

type AppointmentStatusFilter = AppointmentStatus | "all"

type AppointmentsFiltersProps = {
  initialSearch?: string
  initialStatus: AppointmentStatusFilter
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
  onLoadingChange,
  className,
}: AppointmentsFiltersProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const [isPending, startTransition] = useTransition()
  const [search, setSearch] = useState(initialSearch)

  useEffect(() => {
    setSearch(initialSearch)
  }, [initialSearch])

  useEffect(() => {
    onLoadingChange?.(isPending)
  }, [isPending, onLoadingChange])

  const updateParams = useCallback(
    (updates: {
      q?: string | null
      status?: AppointmentStatusFilter
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

      const query = params.toString()

      startTransition(() => {
        router.replace(
          query ? `${pathname}?${query}` : pathname
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

  return (
    <div
      className={cn(
        "flex flex-1 flex-wrap items-center gap-2",
        className
      )}
    >
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

      <Select
        value={initialStatus}
        onValueChange={(value) => {
          if (!value) return

          updateParams({
            status: value as AppointmentStatusFilter,
          })
        }}
      >
        <SelectTrigger className="h-9 w-[160px]">
          <SelectValue>
            {initialStatus === "all"
              ? APPOINTMENT_STATUS_LABELS.all
              : `Status: ${APPOINTMENT_STATUS_LABELS[initialStatus]}`}
          </SelectValue>
        </SelectTrigger>

        <SelectContent>
          <SelectItem value="all">
            {APPOINTMENT_STATUS_LABELS.all}
          </SelectItem>

          <SelectItem value="requested">
            {APPOINTMENT_STATUS_LABELS.requested}
          </SelectItem>

          <SelectItem value="confirmed">
            {APPOINTMENT_STATUS_LABELS.confirmed}
          </SelectItem>

          <SelectItem value="arrived">
            {APPOINTMENT_STATUS_LABELS.arrived}
          </SelectItem>

          <SelectItem value="in_service">
            {APPOINTMENT_STATUS_LABELS.in_service}
          </SelectItem>

          <SelectItem value="completed">
            {APPOINTMENT_STATUS_LABELS.completed}
          </SelectItem>

          <SelectItem value="cancelled">
            {APPOINTMENT_STATUS_LABELS.cancelled}
          </SelectItem>

          <SelectItem value="no_show">
            {APPOINTMENT_STATUS_LABELS.no_show}
          </SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
}