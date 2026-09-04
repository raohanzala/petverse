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

import type {
  ServicePackageStatusFilter,
  ServicePackageStepMode,
} from "@/lib/constants/service-package-filters"
import { SERVICE_PACKAGE_STEP_MODES } from "@/lib/constants/service-package-filters"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { PACKAGE_STEP_MODES, STATUS_LABELS } from "@/lib/supabase/types"

type ServicePackagesFiltersProps = {
  initialSearch?: string
  initialStepMode: ServicePackageStepMode | "all"
  initialStatus: ServicePackageStatusFilter
  onLoadingChange?: (isLoading: boolean) => void
  className?: string
}

export function ServicePackagesFilters({
  initialSearch = "",
  initialStepMode,
  initialStatus,
  onLoadingChange,
  className,
}: ServicePackagesFiltersProps) {
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
      stepMode?: ServicePackageStepMode | "all"
      status?: ServicePackageStatusFilter
    }) => {
      const params = new URLSearchParams(searchParams.toString())

      if (updates.q !== undefined) {
        const value = updates.q?.trim()

        if (value) params.set("q", value)
        else params.delete("q")
      }

      if (updates.stepMode !== undefined) {
        if (updates.stepMode === "all") {
          params.delete("stepMode")
        } else {
          params.set("stepMode", updates.stepMode)
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
          placeholder="Search packages…"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          className="h-9 pl-9 shadow-none bg-white"
          aria-label="Search packages"
        />
      </div>

      <Select
        value={initialStepMode}
        onValueChange={(value) => {
          if (!value) return

          updateParams({
            stepMode: value as ServicePackageStepMode | "all",
          })
        }}
      >
        <SelectTrigger className="h-9 w-[160px]">
          <SelectValue>
            {initialStepMode === "all"
              ? PACKAGE_STEP_MODES.all
              : `Mode: ${PACKAGE_STEP_MODES[initialStepMode]}`}
          </SelectValue>
        </SelectTrigger>

        <SelectContent>
          <SelectItem value="all">
            {PACKAGE_STEP_MODES.all}
          </SelectItem>

          {SERVICE_PACKAGE_STEP_MODES.map((mode) => (
            <SelectItem
              key={mode}
              value={mode}
            >
              {mode === "sequential"
                ? `${PACKAGE_STEP_MODES.sequential}`
                : `${PACKAGE_STEP_MODES.parallel}`}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={initialStatus}
        onValueChange={(value) => {
          if (!value) return

          updateParams({
            status: value as ServicePackageStatusFilter,
          })
        }}
      >
        <SelectTrigger className="h-9 w-[160px]">
          <SelectValue>
            {initialStatus === "all"
              ? STATUS_LABELS.all
              : `Status: ${STATUS_LABELS[initialStatus]}`}
          </SelectValue>
        </SelectTrigger>

        <SelectContent>
          <SelectItem value="all">
            {STATUS_LABELS.all}
          </SelectItem>

          <SelectItem value="active">
            {STATUS_LABELS.active}
          </SelectItem>

          <SelectItem value="inactive">
            {STATUS_LABELS.inactive}
          </SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
}