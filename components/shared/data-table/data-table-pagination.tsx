"use client"

import type { ReactTable, RowData } from "@tanstack/react-table"

import type { AdminTableFeatures } from "@/components/shared/data-table/data-table-features"
import { PaginationEllipsis, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination"
import { cn } from "@/lib/utils"

type DataTablePaginationProps<TData extends RowData> = {
  table: ReactTable<AdminTableFeatures, TData>
  pageSizeOptions?: number[]
  showSelectionCount?: boolean
}

export function DataTablePagination<TData extends RowData>({
  table,
  pageSizeOptions = [10, 20, 30, 50],
  showSelectionCount = false,
}: DataTablePaginationProps<TData>) {
  const totalRows = table.getFilteredRowModel().rows.length
  const pageIndex = table.state.pagination.pageIndex
  const pageSize = table.state.pagination.pageSize
  const start = totalRows === 0 ? 0 : pageIndex * pageSize + 1
  const end = Math.min((pageIndex + 1) * pageSize, totalRows)
  const getPageNumbers = () => {
    const pages: (number | "ellipsis")[] = []

    const pageCount = table.getPageCount()
    const pageIndex = table.state.pagination.pageIndex

    if (pageCount <= 5) {
      for (let i = 0; i < pageCount; i++) {
        pages.push(i)
      }

      return pages
    }

    pages.push(0)

    if (pageIndex > 2) {
      pages.push("ellipsis")
    }

    const start = Math.max(1, pageIndex - 1)
    const end = Math.min(pageCount - 2, pageIndex + 1)

    for (let i = start; i <= end; i++) {
      pages.push(i)
    }

    if (pageIndex < pageCount - 3) {
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
            row(s) selected · Showing {start}–{end}
          </>
        ) : (
          <>Showing {start} to {end} of {totalRows} results</>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-4 lg:gap-6">
        {/* <div className="flex items-center gap-2">
          <p className="text-sm font-medium whitespace-nowrap">Rows per page</p>
          <Select
            value={`${pageSize}`}
            onValueChange={(value) => {
              if (value) table.setPageSize(Number(value))
            }}
          >
            <SelectTrigger className="h-8 w-[72px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent side="top">
              {pageSizeOptions.map((size) => (
                <SelectItem key={size} value={`${size}`}>
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select> */}
        {/* </div> */}

        {/* <div className="flex w-24 items-center justify-center text-sm font-medium">
          Page {pageIndex + 1} of {table.getPageCount() || 1}
        </div> */}

        <div className="flex items-center gap-1">
          <PaginationPrevious
            onClick={() => table.previousPage()}
            aria-disabled={!table.getCanPreviousPage()}
            className={cn(
              !table.getCanPreviousPage() &&
              "pointer-events-none opacity-50"
            )}
          />

          {getPageNumbers().map((page, index) =>
            page === "ellipsis" ? (
                <PaginationEllipsis key={index} />
            ) : (
                <PaginationLink
                className="h-6 w-8"
                  key={index}
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
              !table.getCanNextPage() &&
              "pointer-events-none opacity-50"
            )}
          />
        </div>
      </div>
    </div>
  )
}
