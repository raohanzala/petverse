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

import type { SupplierStatusFilter } from "@/lib/constants/supplier-filters"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { SUPPLIER_STATUS_LABELS } from "@/lib/constants/supplier-filters"

type SupplierFiltersProps = {
  initialSearch?: string
  initialStatus: SupplierStatusFilter
  onLoadingChange?: (isLoading: boolean) => void
  className?: string
}

export function SupplierFilters({
  initialSearch = "",
  initialStatus,
  onLoadingChange,
  className,
}: SupplierFiltersProps) {
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
      status?: SupplierStatusFilter
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
          placeholder="Search suppliers…"
          value={search}
          onChange={(event) =>
            setSearch(event.target.value)
          }
          className="h-9 bg-white pl-9 shadow-none"
          aria-label="Search suppliers"
        />
      </div>

      <Select
        value={initialStatus}
        onValueChange={(value) => {
          if (!value) return

          updateParams({
            status: value as SupplierStatusFilter,
          })
        }}
      >
        <SelectTrigger className="h-9 w-[160px]">
          <SelectValue>
            {initialStatus === "all"
              ? SUPPLIER_STATUS_LABELS.all
              : `Status: ${SUPPLIER_STATUS_LABELS[initialStatus]}`}
          </SelectValue>
        </SelectTrigger>

        <SelectContent>
          <SelectItem value="all">
            {SUPPLIER_STATUS_LABELS.all}
          </SelectItem>

          <SelectItem value="active">
            {SUPPLIER_STATUS_LABELS.active}
          </SelectItem>

          <SelectItem value="inactive">
            {SUPPLIER_STATUS_LABELS.inactive}
          </SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
}