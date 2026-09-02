"use client"

import type { ReactTable, RowData } from "@tanstack/react-table"
import { SearchIcon } from "lucide-react"

import { DataTableViewOptions } from "@/components/shared/data-table/data-table-view-options"
import type { AdminTableFeatures } from "@/components/shared/data-table/data-table-features"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

type DataTableToolbarProps<TData extends RowData> = {
  table: ReactTable<AdminTableFeatures, TData>
  searchKey?: string
  searchPlaceholder?: string
  enableGlobalSearch?: boolean
  enableColumnVisibility?: boolean
  children?: React.ReactNode
  className?: string
}

export function DataTableToolbar<TData extends RowData>({
  table,
  searchKey,
  searchPlaceholder = "Search…",
  enableGlobalSearch = false,
  enableColumnVisibility = true,
  children,
  className,
}: DataTableToolbarProps<TData>) {
  const showSearch = Boolean(searchKey) || enableGlobalSearch

  if (!showSearch && !enableColumnVisibility && !children) {
    return null
  }

  const searchValue = enableGlobalSearch
    ? ((table.state.globalFilter as string) ?? "")
    : searchKey
      ? ((table.getColumn(searchKey)?.getFilterValue() as string) ?? "")
      : ""

  function handleSearchChange(value: string) {
    if (enableGlobalSearch) {
      table.setGlobalFilter(value)
      return
    }

    if (searchKey) {
      table.getColumn(searchKey)?.setFilterValue(value)
    }
  }

  return (
    <div
      className={cn(
        "flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between",
        className
      )}
    >
      <div className="flex flex-1 flex-wrap items-center gap-2">
        {showSearch ? (
          <div className="relative w-full max-w-sm">
            <SearchIcon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder={searchPlaceholder}
              value={searchValue}
              onChange={(event) => handleSearchChange(event.target.value)}
              className="h-9 bg-muted/40 pl-9 shadow-none"
            />
          </div>
        ) : null}
        {children}
      </div>
      {enableColumnVisibility ? <DataTableViewOptions table={table} /> : null}
    </div>
  )
}
