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
  ProductStatusFilter,
} from "@/lib/constants/product-filters"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"

type ProductFiltersProps = {
  initialSearch?: string
  initialStatus: ProductStatusFilter
  initialSupplierId?: string
  suppliers: {
    id: string
    name: string
  }[]
  onLoadingChange?: (isLoading: boolean) => void
  className?: string
}

export function ProductFilters({
  initialSearch = "",
  initialStatus,
  initialSupplierId = "all",
  suppliers,
  onLoadingChange,
  className,
}: ProductFiltersProps) {
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
      status?: ProductStatusFilter
      supplier_id?: string | null
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

      if (updates.supplier_id !== undefined) {
        const value = updates.supplier_id

        if (value && value !== "all") {
          params.set("supplier_id", value)
        } else {
          params.delete("supplier_id")
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
          placeholder="Search products…"
          value={search}
          onChange={(event) =>
            setSearch(event.target.value)
          }
          className="h-9 bg-white pl-9 shadow-none"
          aria-label="Search products"
        />
      </div>

      <Select
        value={initialSupplierId}
        onValueChange={(value) => {
          if (!value) return

          updateParams({
            supplier_id: value,
          })
        }}
      >
        <SelectTrigger className="h-9 w-[180px]">
          <SelectValue>
            {initialSupplierId === "all"
              ? "All suppliers"
              : `Supplier: ${
                  suppliers.find(
                    (supplier) =>
                      supplier.id === initialSupplierId
                  )?.name ?? "Unknown"
                }`}
          </SelectValue>
        </SelectTrigger>

        <SelectContent>
          <SelectItem value="all">
            All suppliers
          </SelectItem>

          {suppliers.map((supplier) => (
            <SelectItem
              key={supplier.id}
              value={supplier.id}
            >
              {supplier.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={initialStatus}
        onValueChange={(value) => {
          if (!value) return

          updateParams({
            status: value as ProductStatusFilter,
          })
        }}
      >
        <SelectTrigger className="h-9 w-[160px]">
          <SelectValue>
            {initialStatus === "all"
              ? "All statuses"
              : `Status: ${
                  initialStatus === "active"
                    ? "Active only"
                    : "Inactive only"
                }`}
          </SelectValue>
        </SelectTrigger>

        <SelectContent>
          <SelectItem value="all">
            All statuses
          </SelectItem>

          <SelectItem value="active">
            Active only
          </SelectItem>

          <SelectItem value="inactive">
            Inactive only
          </SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
}