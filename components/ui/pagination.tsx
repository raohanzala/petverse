import * as React from "react"
import { cn } from "@/lib/utils"

import { Button } from "@/components/ui/button"
import { ChevronLeftIcon, ChevronRightIcon, MoreHorizontalIcon } from "lucide-react"
import type { RowData, ReactTable } from "@tanstack/react-table"
import type { AdminTableFeatures } from "../shared/data-table"

type PaginationProps<TData extends RowData> = {
  table: ReactTable<AdminTableFeatures, TData>
  className?: string
}

function Pagination<TData extends RowData>({
  table,
  className,
}: PaginationProps<TData>) {
  const pageCount = table.getPageCount()
  const pageIndex = table.state.pagination.pageIndex

  const getPageNumbers = () => {
    const pages: (number | "ellipsis")[] = []

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

  return (
    <nav
      role="navigation"
      aria-label="pagination"
      data-slot="pagination"
      className={cn("mx-auto flex w-full justify-center", className)}
    >
      <PaginationContent>
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
              <PaginationEllipsis />
          ) : (
              <PaginationLink
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
      </PaginationContent>
    </nav >
  )
}

function PaginationContent({
  className,
  ...props
}: React.ComponentProps<"ul">) {
  return (
    <ul
      data-slot="pagination-content"
      className={cn("flex items-center gap-0.5", className)}
      {...props}
    />
  )
}

type PaginationLinkProps = {
  isActive?: boolean
} & Pick<React.ComponentProps<typeof Button>, "size"> &
  React.ComponentProps<"a">

function PaginationLink({
  className,
  isActive,
  size = "icon",
  ...props
}: PaginationLinkProps) {
  return (
    <Button
      variant={isActive ? "outline" : "ghost"}
      size={size}
      className={cn(className)}
      nativeButton={false}
      render={
        <a
          aria-current={isActive ? "page" : undefined}
          data-slot="pagination-link"
          data-active={isActive}
          {...props}
        />
      }
    />
  )
}

function PaginationPrevious({
  className,
  text = "Previous",
  ...props
}: React.ComponentProps<typeof PaginationLink> & { text?: string }) {
  return (
    <PaginationLink
      aria-label="Go to previous page"
      size="default"
      className={cn("pl-1.5!", className)}
      {...props}
    >
      <ChevronLeftIcon data-icon="inline-start" />
      <span className="hidden sm:block">{text}</span>
    </PaginationLink>
  )
}

function PaginationNext({
  className,
  text = "Next",
  ...props
}: React.ComponentProps<typeof PaginationLink> & { text?: string }) {
  return (
    <PaginationLink
      aria-label="Go to next page"
      size="default"
      className={cn("pr-1.5!", className)}
      {...props}
    >
      <span className="hidden sm:block">{text}</span>
      <ChevronRightIcon data-icon="inline-end" />
    </PaginationLink>
  )
}

function PaginationEllipsis({
  className,
  ...props
}: React.ComponentProps<"span">) {
  return (
    <span
      aria-hidden
      data-slot="pagination-ellipsis"
      className={cn(
        "flex size-8 items-center justify-center [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      {...props}
    >
      <MoreHorizontalIcon
      />
      <span className="sr-only">More pages</span>
    </span>
  )
}

export {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  // PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
}
