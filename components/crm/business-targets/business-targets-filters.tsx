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

import {
  BUSINESS_TARGET_PERIOD_FILTERS,
  BUSINESS_TARGET_PERIOD_LABELS,
  type BusinessTargetPeriodFilter,
} from "@/lib/constants/business-target-filters"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"

type BusinessTargetsFiltersProps = {
  initialSearch?: string
  initialPeriod: BusinessTargetPeriodFilter
  onLoadingChange?: (isLoading: boolean) => void
  className?: string
}

export function BusinessTargetsFilters({
  initialSearch = "",
  initialPeriod,
  onLoadingChange,
  className,
}: BusinessTargetsFiltersProps) {
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
      period?: BusinessTargetPeriodFilter
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

      if (updates.period !== undefined) {
        if (updates.period === "all") {
          params.delete("period")
        } else {
          params.set("period", updates.period)
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
          placeholder="Search metrics…"
          value={search}
          onChange={(event) =>
            setSearch(event.target.value)
          }
          className="h-9 bg-white pl-9 shadow-none"
          aria-label="Search business targets"
        />
      </div>

      <Select
        value={initialPeriod}
        onValueChange={(value) => {
          if (!value) return

          updateParams({
            period: value as BusinessTargetPeriodFilter,
          })
        }}
      >
        <SelectTrigger className="h-9 w-[180px]">
          <SelectValue>
            {initialPeriod === "all"
              ? BUSINESS_TARGET_PERIOD_LABELS.all
              : `Period: ${BUSINESS_TARGET_PERIOD_LABELS[initialPeriod]}`}
          </SelectValue>
        </SelectTrigger>

        <SelectContent>
          {BUSINESS_TARGET_PERIOD_FILTERS.map(
            (period) => (
              <SelectItem
                key={period}
                value={period}
              >
                {BUSINESS_TARGET_PERIOD_LABELS[period]}
              </SelectItem>
            )
          )}
        </SelectContent>
      </Select>
    </div>
  )
}