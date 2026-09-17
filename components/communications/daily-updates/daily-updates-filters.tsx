"use client"

import { SearchIcon } from "lucide-react"

import {
  useCallback,
  useEffect,
  useState,
  useTransition,
} from "react"

import {
  usePathname,
  useRouter,
  useSearchParams,
} from "next/navigation"

import type {
  DailyUpdateDeliveryFilter,
} from "@/lib/constants/daily-update-filters"

import {
  DAILY_UPDATE_DELIVERY_LABELS,
} from "@/lib/constants/daily-update-filters"

import { Input } from "@/components/ui/input"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import { cn } from "@/lib/utils"

type DailyUpdatesFiltersProps = {
  initialSearch?: string
  initialDelivery: DailyUpdateDeliveryFilter
  onLoadingChange?: (isLoading: boolean) => void
  className?: string
}

export function DailyUpdatesFilters({
  initialSearch = "",
  initialDelivery,
  onLoadingChange,
  className,
}: DailyUpdatesFiltersProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const [isPending, startTransition] =
    useTransition()

  const [search, setSearch] =
    useState(initialSearch)

  useEffect(() => {
    onLoadingChange?.(isPending)
  }, [isPending, onLoadingChange])

  const updateParams = useCallback(
    (updates: {
      q?: string | null
      delivery?: DailyUpdateDeliveryFilter
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

      if (updates.delivery !== undefined) {
        if (updates.delivery === "all") {
          params.delete("delivery")
        } else {
          params.set(
            "delivery",
            updates.delivery
          )
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
    [
      pathname,
      router,
      searchParams,
    ]
  )

  const urlSearch =
    searchParams.get("q") ?? ""

  useEffect(() => {
    if (search === urlSearch) return

    const timer = window.setTimeout(() => {
      updateParams({ q: search })
    }, 350)

    return () => window.clearTimeout(timer)
  }, [
    search,
    urlSearch,
    updateParams,
  ])

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
          placeholder="Search pets or owners…"
          value={search}
          onChange={(event) =>
            setSearch(event.target.value)
          }
          className="h-9 bg-white pl-9 shadow-none"
          aria-label="Search daily updates"
        />
      </div>

      <Select
        value={initialDelivery}
        onValueChange={(value) => {
          if (!value) return

          updateParams({
            delivery:
              value as DailyUpdateDeliveryFilter,
          })
        }}
      >
        <SelectTrigger className="h-9 w-[180px]">
          <SelectValue>
            {initialDelivery === "all"
              ? DAILY_UPDATE_DELIVERY_LABELS.all
              : `Delivery: ${
                  DAILY_UPDATE_DELIVERY_LABELS[
                    initialDelivery
                  ]
                }`}
          </SelectValue>
        </SelectTrigger>

        <SelectContent>
          <SelectItem value="all">
            {
              DAILY_UPDATE_DELIVERY_LABELS.all
            }
          </SelectItem>

          <SelectItem value="sent">
            {
              DAILY_UPDATE_DELIVERY_LABELS.sent
            }
          </SelectItem>

          <SelectItem value="pending">
            {
              DAILY_UPDATE_DELIVERY_LABELS.pending
            }
          </SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
}