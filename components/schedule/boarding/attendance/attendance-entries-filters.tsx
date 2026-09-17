"use client"

import { SearchIcon } from "lucide-react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useCallback, useEffect, useState, useTransition } from "react"

import type { AttendanceEntryTypeFilter } from "@/lib/constants/attendance-entries-filters"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"

const ATTENDANCE_TYPE_LABELS: Record<
  AttendanceEntryTypeFilter,
  string
> = {
  all: "All Entries",
  check_in: "Check In",
  check_out: "Check Out",
  note: "Note",
  incident: "Incidents",
}

type AttendanceEntriesFiltersProps = {
  initialSearch?: string
  initialType: AttendanceEntryTypeFilter
  onLoadingChange?: (isLoading: boolean) => void
  className?: string
}

export function AttendanceEntriesFilters({
  initialSearch = "",
  initialType,
  onLoadingChange,
  className,
}: AttendanceEntriesFiltersProps) {
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
      type?: AttendanceEntryTypeFilter
    }) => {
      const params = new URLSearchParams(searchParams.toString())

      if (updates.q !== undefined) {
        const value = updates.q?.trim()

        if (value) {
          params.set("q", value)
        } else {
          params.delete("q")
        }
      }

      if (updates.type !== undefined) {
        if (updates.type === "all") {
          params.delete("type")
        } else {
          params.set("type", updates.type)
        }
      }

      const query = params.toString()

      startTransition(() => {
        router.replace(query ? `${pathname}?${query}` : pathname)
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
          placeholder="Search attendance entries…"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          className="h-9 bg-white pl-9 shadow-none"
          aria-label="Search attendance entries"
        />
      </div>

      <Select
        value={initialType}
        onValueChange={(value) => {
          if (!value) return

          updateParams({
            type: value as AttendanceEntryTypeFilter,
          })
        }}
      >
        <SelectTrigger className="h-9 w-[160px]">
          <SelectValue>
            {initialType === "all"
              ? ATTENDANCE_TYPE_LABELS.all
              : `Type: ${ATTENDANCE_TYPE_LABELS[initialType]}`}
          </SelectValue>
        </SelectTrigger>

        <SelectContent>
          <SelectItem value="all">
            {ATTENDANCE_TYPE_LABELS.all}
          </SelectItem>

          <SelectItem value="check_in">
            {ATTENDANCE_TYPE_LABELS.check_in}
          </SelectItem>

          <SelectItem value="check_out">
            {ATTENDANCE_TYPE_LABELS.check_out}
          </SelectItem>

          <SelectItem value="note">
            {ATTENDANCE_TYPE_LABELS.note}
          </SelectItem>

          <SelectItem value="incident">
            {ATTENDANCE_TYPE_LABELS.incident}
          </SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
}