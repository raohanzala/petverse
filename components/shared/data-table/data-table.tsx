"use client"

import {
  useTable,
  type ColumnDef,
  type ColumnFiltersState,
  type ColumnVisibilityState,
  type RowData,
  type RowSelectionState,
  type SortingState,
} from "@tanstack/react-table"
import { useEffect, useMemo, useState } from "react"

import { DataTablePagination } from "@/components/shared/data-table/data-table-pagination"
import { DataTableToolbar } from "@/components/shared/data-table/data-table-toolbar"
import {
  adminTableFeatures,
  type AdminTableFeatures,
} from "@/components/shared/data-table/data-table-features"
import { Checkbox } from "@/components/ui/checkbox"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { cn } from "@/lib/utils"

export type AdminColumnDef<TData extends RowData> = ColumnDef<
  AdminTableFeatures,
  TData
>

type DataTableProps<TData extends RowData> = {
  columns: AdminColumnDef<TData>[]
  data: TData[]
  pageSize?: number
  pageSizeOptions?: number[]
  emptyMessage?: string
  className?: string
  isLoading?: boolean
  /** Column id to filter with the toolbar search input */
  searchKey?: string
  searchPlaceholder?: string
  /** Search across all columns instead of a single searchKey */
  enableGlobalSearch?: boolean
  enableSorting?: boolean
  enableColumnVisibility?: boolean
  enableRowSelection?: boolean
  showSelectionCount?: boolean
  toolbar?: React.ReactNode
  onRowSelectionChange?: (rows: TData[]) => void
}

function DataTableSkeleton({ columns, rows = 5 }: { columns: number; rows?: number }) {
  return (
    <>
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <TableRow key={rowIndex} className="hover:bg-transparent">
          {Array.from({ length: columns }).map((__, cellIndex) => (
            <TableCell key={cellIndex}>
              <Skeleton className="h-4 w-full max-w-[12rem]" />
            </TableCell>
          ))}
        </TableRow>
      ))}
    </>
  )
}

export function DataTable<TData extends RowData>({
  columns,
  data,
  pageSize = 10,
  pageSizeOptions,
  emptyMessage = "No results found.",
  className,
  isLoading = false,
  searchKey,
  searchPlaceholder,
  enableGlobalSearch = false,
  enableSorting = true,
  enableColumnVisibility = true,
  enableRowSelection = false,
  showSelectionCount = false,
  toolbar,
  onRowSelectionChange,
}: DataTableProps<TData>) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = useState<ColumnVisibilityState>(
    {}
  )
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({})
  const [globalFilter, setGlobalFilter] = useState("")
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize,
  })

  const selectColumn = useMemo<AdminColumnDef<TData>>(
    () => ({
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllPageRowsSelected()}
          indeterminate={
            table.getIsSomePageRowsSelected() &&
            !table.getIsAllPageRowsSelected()
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all rows"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    }),
    []
  )

  const tableColumns = useMemo(
    () => (enableRowSelection ? [selectColumn, ...columns] : columns),
    [columns, enableRowSelection, selectColumn]
  )

  const table = useTable({
    features: adminTableFeatures,
    data,
    columns: tableColumns,
    enableSorting,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onGlobalFilterChange: setGlobalFilter,
    onPaginationChange: setPagination,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      globalFilter,
      pagination,
    },
  })

  const visibleColumnCount = table.getVisibleLeafColumns().length
  const hasToolbar =
    Boolean(searchKey) ||
    enableGlobalSearch ||
    enableColumnVisibility ||
    Boolean(toolbar)

  useEffect(() => {
    if (!onRowSelectionChange) return

    const selected = table
      .getFilteredSelectedRowModel()
      .rows.map((row) => row.original)
    onRowSelectionChange(selected)
  }, [rowSelection, table, onRowSelectionChange])

  return (
    <div className={cn("space-y-4", className)}>
      {hasToolbar ? (
        <DataTableToolbar
          table={table}
          searchKey={searchKey}
          searchPlaceholder={searchPlaceholder}
          enableGlobalSearch={enableGlobalSearch}
          enableColumnVisibility={enableColumnVisibility}
        >
          {toolbar}
        </DataTableToolbar>
      ) : null}

      <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="hover:bg-transparent">
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder ? null : (
                      <table.FlexRender header={header} />
                    )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <DataTableSkeleton columns={visibleColumnCount} />
            ) : table.getRowModel().rows.length > 0 ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() ? "selected" : undefined}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      <table.FlexRender cell={cell} />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow className="hover:bg-transparent">
                <TableCell
                  colSpan={visibleColumnCount}
                  className="h-24 text-center text-muted-foreground"
                >
                  {emptyMessage}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {!isLoading ? (
        <DataTablePagination
          table={table}
          pageSizeOptions={pageSizeOptions}
          showSelectionCount={showSelectionCount || enableRowSelection}
        />
      ) : null}
    </div>
  )
}

export type { ColumnDef }
