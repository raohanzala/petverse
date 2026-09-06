"use client"

import type { ReactTable, RowData } from "@tanstack/react-table"

import type { AdminTableFeatures } from "@/components/shared/data-table/data-table-features"
import {
  PaginationEllipsis,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"

type DataTablePaginationProps<TData extends RowData> = {
  table: ReactTable<AdminTableFeatures, TData>
  pageSizeOptions?: number[]
  showSelectionCount?: boolean
  /** Optional noun for the summary, e.g. "appointments" → "of 248 appointments" */
  itemLabel?: string
}

export function DataTablePagination<TData extends RowData>({
  table,
  pageSizeOptions = [10, 20, 30, 50],
  showSelectionCount = false,
  itemLabel = "results",
}: DataTablePaginationProps<TData>) {
  const totalRows = table.getFilteredRowModel().rows.length
  const pageIndex = table.state.pagination.pageIndex
  const pageSize = table.state.pagination.pageSize
  const start = totalRows === 0 ? 0 : pageIndex * pageSize + 1
  const end = Math.min((pageIndex + 1) * pageSize, totalRows)

  const getPageNumbers = () => {
    const pages: (number | "ellipsis")[] = []
    const pageCount = table.getPageCount()
    const current = table.state.pagination.pageIndex

    if (pageCount <= 5) {
      for (let i = 0; i < pageCount; i++) {
        pages.push(i)
      }
      return pages
    }

    pages.push(0)

    if (current > 2) {
      pages.push("ellipsis")
    }

    const rangeStart = Math.max(1, current - 1)
    const rangeEnd = Math.min(pageCount - 2, current + 1)

    for (let i = rangeStart; i <= rangeEnd; i++) {
      pages.push(i)
    }

    if (current < pageCount - 3) {
      pages.push("ellipsis")
    }

    pages.push(pageCount - 1)

    return pages
  }

  if (totalRows === 0) return null

  return (
    <div className="flex flex-col gap-3 px-1 sm:flex-row sm:items-center sm:justify-between">
      <div className="text-sm text-muted-foreground">
        {showSelectionCount ? (
          <>
            {table.getFilteredSelectedRowModel().rows.length} of {totalRows}{" "}
            row(s) selected · Showing {start} to {end}
          </>
        ) : (
          <>
            Showing {start} to {end} of {totalRows} {itemLabel}
          </>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-1">
          <PaginationPrevious
            onClick={() => table.previousPage()}
            aria-disabled={!table.getCanPreviousPage()}
            className={cn(
              !table.getCanPreviousPage() && "pointer-events-none opacity-50"
            )}
          />

          {getPageNumbers().map((page, index) =>
            page === "ellipsis" ? (
              <PaginationEllipsis key={`ellipsis-${index}`} />
            ) : (
              <PaginationLink
                key={page}
                isActive={pageIndex === page}
                onClick={() => table.setPageIndex(page)}
              >
                {page + 1}
              </PaginationLink>
            )
          )}

          <PaginationNext
            onClick={() => table.nextPage()}
            aria-disabled={!table.getCanNextPage()}
            className={cn(
              !table.getCanNextPage() && "pointer-events-none opacity-50"
            )}
          />
        </div>

        <Select
          value={`${pageSize}`}
          onValueChange={(value) => {
            if (value) table.setPageSize(Number(value))
          }}
        >
          <SelectTrigger className="h-8 w-[6.5rem] rounded-md border-border bg-card shadow-none">
            <SelectValue>{`${pageSize} / page`}</SelectValue>
          </SelectTrigger>
          <SelectContent side="top" align="end">
            {pageSizeOptions.map((size) => (
              <SelectItem key={size} value={`${size}`}>
                {size} / page
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
