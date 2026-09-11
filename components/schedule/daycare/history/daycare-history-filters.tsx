"use client"

import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { format, parse } from "date-fns"
import type { DateRange } from "react-day-picker"

import { DatePickerWithRange } from "@/components/ui/date-picker-with-range"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

type DaycareHistoryFiltersProps = {
  pets: {
    id: string
    name: string
  }[]
}

export function DaycareHistoryFilters({
  pets,
}: DaycareHistoryFiltersProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const from = searchParams.get("from") ?? ""
  const to = searchParams.get("to") ?? ""
  const petId = searchParams.get("pet") ?? "all"
  const status = searchParams.get("status") ?? "all"

  const dateRange: DateRange | undefined =
    from || to
      ? {
        from: from
          ? parse(from, "yyyy-MM-dd", new Date())
          : undefined,
        to: to
          ? parse(to, "yyyy-MM-dd", new Date())
          : undefined,
      }
      : undefined

  function updateFilter(key: string, value: string) {
    const params = new URLSearchParams(searchParams)

    if (!value || value === "all") {
      params.delete(key)
    } else {
      params.set(key, value)
    }

    params.set("tab", "history")

    router.push(`${pathname}?${params.toString()}`)
  }

  function updateDateRange(range: DateRange | undefined) {
    const params = new URLSearchParams(searchParams)

    if (range?.from) {
      params.set(
        "from",
        format(range.from, "yyyy-MM-dd")
      )
    } else {
      params.delete("from")
    }

    if (range?.to) {
      params.set(
        "to",
        format(range.to, "yyyy-MM-dd")
      )
    } else {
      params.delete("to")
    }

    params.set("tab", "history")

    router.push(`${pathname}?${params.toString()}`)
  }

  return (
    <div className="flex gap-4">
      {/* Date Range */}
      <DatePickerWithRange
        date={dateRange}
        onDateChange={updateDateRange}
      />

      {/* Pet */}
      <div className="space-y-2">
        <Select
          value={petId}
          onValueChange={(value) => {
            if (!value) return

            updateFilter("pet", value)
          }}
        >
          <SelectTrigger className="h-9 w-[180px]">
            <SelectValue>
              {petId !== "all"
                ? pets.find(
                  (pet) => pet.id === petId
                )?.name ?? "All pets"
                : "All pets"}
            </SelectValue>
          </SelectTrigger>

          <SelectContent>
            <SelectItem value="all">
              All pets
            </SelectItem>

            {pets.map((pet) => (
              <SelectItem
                key={pet.id}
                value={pet.id}
              >
                {pet.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Status */}
      <div className="space-y-2">
        <Select
          value={status}
          onValueChange={(value) => {
            if (!value) return

            updateFilter("status", value)
          }}
        >
          <SelectTrigger className="h-9 w-[170px]">
            <SelectValue>
              {status === "checked_out"
                ? "Checked Out"
                : status === "cancelled"
                  ? "Cancelled"
                  : "All statuses"}
            </SelectValue>
          </SelectTrigger>

          <SelectContent>
            <SelectItem value="all">
              All statuses
            </SelectItem>

            <SelectItem value="checked_out">
              Checked Out
            </SelectItem>

            <SelectItem value="cancelled">
              Cancelled
            </SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}