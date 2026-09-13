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
  OwnerRetentionSettingsFilter,
} from "@/lib/constants/owner-retention-settings-filters"
import {
  OWNER_RETENTION_SETTINGS_FILTERS,
  OWNER_RETENTION_SETTINGS_LABELS,
} from "@/lib/constants/owner-retention-settings-filters"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"

type OwnerRetentionSettingsFiltersProps = {
  initialSearch?: string
  initialFilter: OwnerRetentionSettingsFilter
  onLoadingChange?: (
    isLoading: boolean
  ) => void
  className?: string
}

export function OwnerRetentionSettingsFilters({
  initialSearch = "",
  initialFilter,
  onLoadingChange,
  className,
}: OwnerRetentionSettingsFiltersProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams =
    useSearchParams()

  const [
    isPending,
    startTransition,
  ] = useTransition()

  const [search, setSearch] =
    useState(initialSearch)

  useEffect(() => {
    setSearch(initialSearch)
  }, [initialSearch])

  useEffect(() => {
    onLoadingChange?.(isPending)
  }, [
    isPending,
    onLoadingChange,
  ])

  const updateParams = useCallback(
    (updates: {
      q?: string | null
      filter?: OwnerRetentionSettingsFilter
    }) => {
      const params =
        new URLSearchParams(
          searchParams.toString()
        )

      if (updates.q !== undefined) {
        const value =
          updates.q?.trim()

        if (value) {
          params.set("q", value)
        } else {
          params.delete("q")
        }
      }

      if (
        updates.filter !==
        undefined
      ) {
        if (
          updates.filter === "all"
        ) {
          params.delete("filter")
        } else {
          params.set(
            "filter",
            updates.filter
          )
        }
      }

      const query =
        params.toString()

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
    if (search === urlSearch) {
      return
    }

    const timer =
      window.setTimeout(() => {
        updateParams({
          q: search,
        })
      }, 350)

    return () =>
      window.clearTimeout(timer)
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
          placeholder="Search owners…"
          value={search}
          onChange={(event) =>
            setSearch(
              event.target.value
            )
          }
          className="h-9 bg-white pl-9 shadow-none"
          aria-label="Search owners"
        />
      </div>

      <Select
        value={initialFilter}
        onValueChange={(value) => {
          if (!value) return

          updateParams({
            filter:
              value as OwnerRetentionSettingsFilter,
          })
        }}
      >
        <SelectTrigger className="h-9 w-[180px]">
          <SelectValue>
            {initialFilter === "all"
              ? OWNER_RETENTION_SETTINGS_LABELS.all
              : `Retention: ${
                  OWNER_RETENTION_SETTINGS_LABELS[
                    initialFilter
                  ]
                }`}
          </SelectValue>
        </SelectTrigger>

        <SelectContent>
          {OWNER_RETENTION_SETTINGS_FILTERS.map(
            (filter) => (
              <SelectItem
                key={filter}
                value={filter}
              >
                {
                  OWNER_RETENTION_SETTINGS_LABELS[
                    filter
                  ]
                }
              </SelectItem>
            )
          )}
        </SelectContent>
      </Select>
    </div>
  )
}