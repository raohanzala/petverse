"use client"

import { SearchIcon } from "lucide-react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useCallback, useEffect, useState, useTransition } from "react"

import type { InvoiceStatusFilter } from "@/lib/constants/invoice-filters"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"

const INVOICE_STATUS_LABELS: Record<
  InvoiceStatusFilter,
  string
> = {
  all: "All statuses",
  draft: "Draft",
  open: "Open",
  paid: "Paid",
  void: "Void",
}

type InvoiceFiltersProps = {
  initialSearch?: string
  initialStatus: InvoiceStatusFilter
  onLoadingChange?: (isLoading: boolean) => void
  className?: string
}

export function InvoiceFilters({
  initialSearch = "",
  initialStatus,
  onLoadingChange,
  className,
}: InvoiceFiltersProps) {
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
      status?: InvoiceStatusFilter
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
          placeholder="Search invoices…"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          className="h-9 bg-white pl-9 shadow-none"
          aria-label="Search invoices"
        />
      </div>

      <Select
        value={initialStatus}
        onValueChange={(value) => {
          if (!value) return

          updateParams({
            status: value as InvoiceStatusFilter,
          })
        }}
      >
        <SelectTrigger className="h-9 w-[160px]">
          <SelectValue>
            {initialStatus === "all"
              ? INVOICE_STATUS_LABELS.all
              : `Status: ${INVOICE_STATUS_LABELS[initialStatus]}`}
          </SelectValue>
        </SelectTrigger>

        <SelectContent>
          <SelectItem value="all">
            {INVOICE_STATUS_LABELS.all}
          </SelectItem>

          <SelectItem value="draft">
            {INVOICE_STATUS_LABELS.draft}
          </SelectItem>

          <SelectItem value="open">
            {INVOICE_STATUS_LABELS.open}
          </SelectItem>

          <SelectItem value="paid">
            {INVOICE_STATUS_LABELS.paid}
          </SelectItem>

          <SelectItem value="void">
            {INVOICE_STATUS_LABELS.void}
          </SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
}