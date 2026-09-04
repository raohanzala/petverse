"use client"

import { SearchIcon } from "lucide-react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useCallback, useEffect, useState, useTransition } from "react"

import {
  SERVICE_KINDS,
  type ServiceKindFilter,
  type ServiceStatusFilter,
  type ServiceVisibilityFilter,
} from "@/lib/constants/service-filters"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { STATUS_LABELS, VISIBILITY_LABELS } from "@/lib/supabase/types"

type ServiceFiltersProps = {
  initialSearch?: string
  initialCategoryId?: string
  initialKind: ServiceKindFilter | "all"
  initialStatus: ServiceStatusFilter
  initialVisibility: ServiceVisibilityFilter
  categories: {
    id: string
    name: string
  }[]
  onLoadingChange?: (isLoading: boolean) => void
  className?: string
}

export function ServicesFilters({
  initialSearch = "",
  initialCategoryId,
  initialKind,
  initialStatus,
  initialVisibility,
  categories,
  onLoadingChange,
  className,
}: ServiceFiltersProps) {
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
      categoryId?: string | null
      kind?: ServiceKindFilter | "all"
      status?: ServiceStatusFilter
      visibility?: ServiceVisibilityFilter
    }) => {
      const params = new URLSearchParams(searchParams.toString())

      if (updates.q !== undefined) {
        const value = updates.q?.trim()

        if (value) params.set("q", value)
        else params.delete("q")
      }

      if (updates.categoryId !== undefined) {
        if (updates.categoryId) {
          params.set("categoryId", updates.categoryId)
        } else {
          params.delete("categoryId")
        }
      }

      if (updates.kind !== undefined) {
        if (updates.kind === "all") {
          params.delete("kind")
        } else {
          params.set("kind", updates.kind)
        }
      }

      if (updates.status !== undefined) {
        if (updates.status === "all") {
          params.delete("status")
        } else {
          params.set("status", updates.status)
        }
      }

      if (updates.visibility !== undefined) {
        if (updates.visibility === "all") {
          params.delete("visibility")
        } else {
          params.set("visibility", updates.visibility)
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

  const selectedCategoryLabel =
    initialCategoryId === undefined
      ? "All Categories"
      : `Category: ${categories.find(
        (category) => category.id === initialCategoryId
      )?.name} ?? "All Categories"`

  const selectedKindLabel =
    initialKind === "all"
      ? "All types"
      : `Type: ${initialKind.charAt(0).toUpperCase() +
      initialKind.slice(1)}`

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
          placeholder="Search services…"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          className="h-9 bg-white pl-9 shadow-none"
          aria-label="Search services"
        />
      </div>

      {/* Category */}
      <Select
        value={initialCategoryId ?? "all"}
        onValueChange={(value) => {
          if (!value) return

          updateParams({
            categoryId: value === "all" ? null : value,
          })
        }}
      >
        <SelectTrigger className="h-9 w-[180px]">
          <SelectValue>
            {selectedCategoryLabel}
          </SelectValue>
        </SelectTrigger>

        <SelectContent>
          <SelectItem value="all">All Categories</SelectItem>

          {categories.map((category) => (
            <SelectItem
              key={category.id}
              value={category.id}
            >
              {category.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Type */}
      <Select
        value={initialKind}
        onValueChange={(value) => {
          if (!value) return

          updateParams({
            kind: value as ServiceKindFilter | "all",
          })
        }}
      >
        <SelectTrigger className="h-9 w-[160px]">
          <SelectValue>
            {selectedKindLabel}
          </SelectValue>
        </SelectTrigger>

        <SelectContent>
          <SelectItem value="all">All types</SelectItem>

          {SERVICE_KINDS.map((kind) => (
            <SelectItem
              key={kind}
              value={kind}
            >
              {kind.charAt(0).toUpperCase() + kind.slice(1)}
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
            status: value as ServiceStatusFilter,
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
          <SelectItem value="all">{STATUS_LABELS.all}</SelectItem>
          <SelectItem value="active">{STATUS_LABELS.active}</SelectItem>
          <SelectItem value="inactive">{STATUS_LABELS.inactive}</SelectItem>
        </SelectContent>
      </Select>

      {/* Visibility */}
      <Select
        value={initialVisibility}
        onValueChange={(value) => {
          if (!value) return

          updateParams({
            visibility: value as ServiceVisibilityFilter,
          })
        }}
      >
        <SelectTrigger className="h-9 w-[160px]">
          <SelectValue>
            {initialVisibility === "all"
              ? VISIBILITY_LABELS.all
              : `Visibility: ${VISIBILITY_LABELS[initialVisibility]}`}
          </SelectValue>
        </SelectTrigger>

        <SelectContent>
          <SelectItem value="all">{VISIBILITY_LABELS.all}</SelectItem>
          <SelectItem value="public">{VISIBILITY_LABELS.public}</SelectItem>
          <SelectItem value="private">{VISIBILITY_LABELS.private}</SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
}