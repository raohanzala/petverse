"use client"

import { ListFilterIcon, SearchIcon, XIcon } from "lucide-react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  useTransition,
} from "react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import {
  SERVICE_KINDS,
  type ServiceKindFilter,
  type ServiceStatusFilter,
  type ServiceVisibilityFilter,
} from "@/lib/constants/service-filters"
import { STATUS_LABELS, VISIBILITY_LABELS } from "@/lib/supabase/types"
import { cn } from "@/lib/utils"

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

type FilterUpdates = {
  q?: string | null
  categoryId?: string | null
  kind?: ServiceKindFilter | "all"
  status?: ServiceStatusFilter
  visibility?: ServiceVisibilityFilter
}

function formatKindLabel(kind: ServiceKindFilter | "all") {
  if (kind === "all") return "All types"
  return kind.charAt(0).toUpperCase() + kind.slice(1)
}

function formatStatusChip(status: Exclude<ServiceStatusFilter, "all">) {
  return status === "active" ? "Active" : "Inactive"
}

function formatVisibilityChip(
  visibility: Exclude<ServiceVisibilityFilter, "all">
) {
  return visibility === "public" ? "Public" : "Private"
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

  const [categoryOpen, setCategoryOpen] = useState(false)
  const [moreOpen, setMoreOpen] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  const [draftKind, setDraftKind] = useState(initialKind)
  const [draftVisibility, setDraftVisibility] = useState(initialVisibility)
  const [mobileDraft, setMobileDraft] = useState({
    categoryId: initialCategoryId ?? null,
    kind: initialKind,
    status: initialStatus,
    visibility: initialVisibility,
  })

  useEffect(() => {
    setSearch(initialSearch)
  }, [initialSearch])

  useEffect(() => {
    onLoadingChange?.(isPending)
  }, [isPending, onLoadingChange])

  useEffect(() => {
    if (moreOpen) {
      setDraftKind(initialKind)
      setDraftVisibility(initialVisibility)
    }
  }, [moreOpen, initialKind, initialVisibility])

  useEffect(() => {
    if (mobileOpen) {
      setMobileDraft({
        categoryId: initialCategoryId ?? null,
        kind: initialKind,
        status: initialStatus,
        visibility: initialVisibility,
      })
    }
  }, [
    mobileOpen,
    initialCategoryId,
    initialKind,
    initialStatus,
    initialVisibility,
  ])

  const updateParams = useCallback(
    (updates: FilterUpdates) => {
      const params = new URLSearchParams(searchParams.toString())

      if (updates.q !== undefined) {
        const value = updates.q?.trim()
        if (value) params.set("q", value)
        else params.delete("q")
      }

      if (updates.categoryId !== undefined) {
        if (updates.categoryId) params.set("categoryId", updates.categoryId)
        else params.delete("categoryId")
      }

      if (updates.kind !== undefined) {
        if (updates.kind === "all") params.delete("kind")
        else params.set("kind", updates.kind)
      }

      if (updates.status !== undefined) {
        if (updates.status === "all") params.delete("status")
        else params.set("status", updates.status)
      }

      if (updates.visibility !== undefined) {
        if (updates.visibility === "all") params.delete("visibility")
        else params.set("visibility", updates.visibility)
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

  const selectedCategory = useMemo(
    () => categories.find((category) => category.id === initialCategoryId),
    [categories, initialCategoryId]
  )

  const moreFiltersCount =
    (initialKind !== "all" ? 1 : 0) + (initialVisibility !== "all" ? 1 : 0)

  const allFiltersCount =
    (initialCategoryId ? 1 : 0) +
    (initialKind !== "all" ? 1 : 0) +
    (initialStatus !== "all" ? 1 : 0) +
    (initialVisibility !== "all" ? 1 : 0)

  const chips = useMemo(() => {
    const items: {
      key: string
      label: string
      onClear: () => void
    }[] = []

    if (selectedCategory) {
      items.push({
        key: "category",
        label: `Category: ${selectedCategory.name}`,
        onClear: () => updateParams({ categoryId: null }),
      })
    }

    if (initialStatus !== "all") {
      items.push({
        key: "status",
        label: `Status: ${formatStatusChip(initialStatus)}`,
        onClear: () => updateParams({ status: "all" }),
      })
    }

    if (initialKind !== "all") {
      items.push({
        key: "kind",
        label: `Type: ${formatKindLabel(initialKind)}`,
        onClear: () => updateParams({ kind: "all" }),
      })
    }

    if (initialVisibility !== "all") {
      items.push({
        key: "visibility",
        label: `Visibility: ${formatVisibilityChip(initialVisibility)}`,
        onClear: () => updateParams({ visibility: "all" }),
      })
    }

    return items
  }, [
    selectedCategory,
    initialStatus,
    initialKind,
    initialVisibility,
    updateParams,
  ])

  function applyMoreFilters() {
    updateParams({
      kind: draftKind,
      visibility: draftVisibility,
    })
    setMoreOpen(false)
  }

  function applyMobileFilters() {
    updateParams({
      categoryId: mobileDraft.categoryId,
      kind: mobileDraft.kind,
      status: mobileDraft.status,
      visibility: mobileDraft.visibility,
    })
    setMobileOpen(false)
  }

  function clearMobileFilters() {
    setMobileDraft({
      categoryId: null,
      kind: "all",
      status: "all",
      visibility: "all",
    })
    updateParams({
      categoryId: null,
      kind: "all",
      status: "all",
      visibility: "all",
    })
    setMobileOpen(false)
  }

  function clearAllFilters() {
    updateParams({
      categoryId: null,
      kind: "all",
      status: "all",
      visibility: "all",
    })
  }

  return (
    <div className={cn("flex w-full flex-col gap-2", className)}>
      <div className="flex flex-1 flex-wrap items-center gap-2">
        <div className="relative w-full max-w-sm min-w-[12rem] flex-1 sm:flex-none">
          <SearchIcon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search services…"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="h-9 bg-white pl-9 shadow-none"
            aria-label="Search services"
          />
        </div>

        {/* Desktop: primary filters */}
        <div className="hidden items-center gap-2 md:flex">
          <Popover open={categoryOpen} onOpenChange={setCategoryOpen}>
            <PopoverTrigger
              render={
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className={cn(
                    "h-9 min-w-[10rem] justify-between gap-2 font-normal",
                    initialCategoryId && "border-primary/30 bg-primary/5"
                  )}
                />
              }
            >
              <span className="truncate">
                {selectedCategory
                  ? selectedCategory.name
                  : "All categories"}
              </span>
              <ListFilterIcon className="size-3.5 opacity-50" />
            </PopoverTrigger>

            <PopoverContent align="start" className="w-72 p-0">
              <Command>
                <CommandInput placeholder="Search categories…" />
                <CommandList>
                  <CommandEmpty>No categories found.</CommandEmpty>
                  <CommandGroup>
                    <CommandItem
                      value="all-categories"
                      data-checked={!initialCategoryId || undefined}
                      onSelect={() => {
                        updateParams({ categoryId: null })
                        setCategoryOpen(false)
                      }}
                    >
                      All categories
                    </CommandItem>
                    {categories.map((category) => {
                      const selected = initialCategoryId === category.id
                      return (
                        <CommandItem
                          key={category.id}
                          value={category.name}
                          data-checked={selected || undefined}
                          onSelect={() => {
                            updateParams({ categoryId: category.id })
                            setCategoryOpen(false)
                          }}
                        >
                          {category.name}
                        </CommandItem>
                      )
                    })}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>

          <Select
            value={initialStatus}
            onValueChange={(value) => {
              if (!value) return
              updateParams({ status: value as ServiceStatusFilter })
            }}
          >
            <SelectTrigger
              className={cn(
                "h-9 w-[9.5rem]",
                initialStatus !== "all" && "border-primary/30 bg-primary/5"
              )}
            >
              <SelectValue>
                {initialStatus === "all"
                  ? "All statuses"
                  : formatStatusChip(initialStatus)}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{STATUS_LABELS.all}</SelectItem>
              <SelectItem value="active">{STATUS_LABELS.active}</SelectItem>
              <SelectItem value="inactive">{STATUS_LABELS.inactive}</SelectItem>
            </SelectContent>
          </Select>

          <Popover open={moreOpen} onOpenChange={setMoreOpen}>
            <PopoverTrigger
              render={
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className={cn(
                    "h-9 gap-2 font-normal",
                    moreFiltersCount > 0 && "border-primary/30 bg-primary/5"
                  )}
                />
              }
            >
              <ListFilterIcon className="size-4" />
              Filters
              {moreFiltersCount > 0 ? (
                <Badge
                  variant="secondary"
                  className="h-5 min-w-5 justify-center rounded-full px-1.5"
                >
                  {moreFiltersCount}
                </Badge>
              ) : null}
            </PopoverTrigger>

            <PopoverContent align="start" className="w-80 p-0">
              <PopoverHeader className="flex flex-row items-center justify-between gap-2 border-b px-3 py-2.5">
                <div>
                  <PopoverTitle>More filters</PopoverTitle>
                  <PopoverDescription>
                    Type and visibility
                  </PopoverDescription>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="xs"
                  disabled={draftKind === "all" && draftVisibility === "all"}
                  onClick={() => {
                    setDraftKind("all")
                    setDraftVisibility("all")
                  }}
                >
                  Clear
                </Button>
              </PopoverHeader>

              <div className="space-y-4 p-3">
                <div className="space-y-2">
                  <Label htmlFor="service-filter-kind">Type</Label>
                  <Select
                    value={draftKind}
                    onValueChange={(value) => {
                      if (!value) return
                      setDraftKind(value as ServiceKindFilter | "all")
                    }}
                  >
                    <SelectTrigger id="service-filter-kind" className="h-9 w-full">
                      <SelectValue>{formatKindLabel(draftKind)}</SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All types</SelectItem>
                      {SERVICE_KINDS.map((kind) => (
                        <SelectItem key={kind} value={kind}>
                          {formatKindLabel(kind)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="service-filter-visibility">Visibility</Label>
                  <Select
                    value={draftVisibility}
                    onValueChange={(value) => {
                      if (!value) return
                      setDraftVisibility(value as ServiceVisibilityFilter)
                    }}
                  >
                    <SelectTrigger
                      id="service-filter-visibility"
                      className="h-9 w-full"
                    >
                      <SelectValue>
                        {draftVisibility === "all"
                          ? VISIBILITY_LABELS.all
                          : formatVisibilityChip(draftVisibility)}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">
                        {VISIBILITY_LABELS.all}
                      </SelectItem>
                      <SelectItem value="public">
                        {VISIBILITY_LABELS.public}
                      </SelectItem>
                      <SelectItem value="private">
                        {VISIBILITY_LABELS.private}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 border-t px-3 py-2.5">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setMoreOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="button" size="sm" onClick={applyMoreFilters}>
                  Apply filters
                </Button>
              </div>
            </PopoverContent>
          </Popover>
        </div>

        {/* Mobile: single filters sheet */}
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger
            render={
              <Button
                type="button"
                variant="outline"
                size="sm"
                className={cn(
                  "h-9 gap-2 font-normal md:hidden",
                  allFiltersCount > 0 && "border-primary/30 bg-primary/5"
                )}
              />
            }
          >
            <ListFilterIcon className="size-4" />
            Filters
            {allFiltersCount > 0 ? (
              <Badge
                variant="secondary"
                className="h-5 min-w-5 justify-center rounded-full px-1.5"
              >
                {allFiltersCount}
              </Badge>
            ) : null}
          </SheetTrigger>

          <SheetContent side="bottom" className="gap-0 p-0 md:hidden">
            <SheetHeader className="border-b px-4 py-3 text-left">
              <SheetTitle>Filters</SheetTitle>
              <SheetDescription>
                Narrow down services by category, type, status, and visibility.
              </SheetDescription>
            </SheetHeader>

            <div className="space-y-4 px-4 py-4">
              <div className="space-y-2">
                <Label>Category</Label>
                <Select
                  value={mobileDraft.categoryId ?? "all"}
                  onValueChange={(value) => {
                    if (!value) return
                    setMobileDraft((prev) => ({
                      ...prev,
                      categoryId: value === "all" ? null : value,
                    }))
                  }}
                >
                  <SelectTrigger className="h-9 w-full">
                    <SelectValue>
                      {mobileDraft.categoryId
                        ? (categories.find(
                            (category) => category.id === mobileDraft.categoryId
                          )?.name ?? "All categories")
                        : "All categories"}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All categories</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Type</Label>
                <Select
                  value={mobileDraft.kind}
                  onValueChange={(value) => {
                    if (!value) return
                    setMobileDraft((prev) => ({
                      ...prev,
                      kind: value as ServiceKindFilter | "all",
                    }))
                  }}
                >
                  <SelectTrigger className="h-9 w-full">
                    <SelectValue>
                      {formatKindLabel(mobileDraft.kind)}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All types</SelectItem>
                    {SERVICE_KINDS.map((kind) => (
                      <SelectItem key={kind} value={kind}>
                        {formatKindLabel(kind)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Status</Label>
                <Select
                  value={mobileDraft.status}
                  onValueChange={(value) => {
                    if (!value) return
                    setMobileDraft((prev) => ({
                      ...prev,
                      status: value as ServiceStatusFilter,
                    }))
                  }}
                >
                  <SelectTrigger className="h-9 w-full">
                    <SelectValue>
                      {mobileDraft.status === "all"
                        ? STATUS_LABELS.all
                        : formatStatusChip(mobileDraft.status)}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{STATUS_LABELS.all}</SelectItem>
                    <SelectItem value="active">{STATUS_LABELS.active}</SelectItem>
                    <SelectItem value="inactive">
                      {STATUS_LABELS.inactive}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Visibility</Label>
                <Select
                  value={mobileDraft.visibility}
                  onValueChange={(value) => {
                    if (!value) return
                    setMobileDraft((prev) => ({
                      ...prev,
                      visibility: value as ServiceVisibilityFilter,
                    }))
                  }}
                >
                  <SelectTrigger className="h-9 w-full">
                    <SelectValue>
                      {mobileDraft.visibility === "all"
                        ? VISIBILITY_LABELS.all
                        : formatVisibilityChip(mobileDraft.visibility)}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">
                      {VISIBILITY_LABELS.all}
                    </SelectItem>
                    <SelectItem value="public">
                      {VISIBILITY_LABELS.public}
                    </SelectItem>
                    <SelectItem value="private">
                      {VISIBILITY_LABELS.private}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <SheetFooter className="border-t px-4 py-3 sm:flex-row">
              <Button
                type="button"
                variant="outline"
                onClick={clearMobileFilters}
              >
                Clear
              </Button>
              <Button type="button" onClick={applyMobileFilters}>
                Apply filters
              </Button>
            </SheetFooter>
          </SheetContent>
        </Sheet>
      </div>

      {chips.length > 0 ? (
        <div className="flex flex-wrap items-center gap-2">
          {chips.map((chip) => (
            <Badge
              key={chip.key}
              variant="outline"
              className="h-7 gap-1 rounded-md px-2 font-normal"
            >
              {chip.label}
              <button
                type="button"
                onClick={chip.onClear}
                className="rounded-sm p-0.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                aria-label={`Clear ${chip.label}`}
              >
                <XIcon className="size-3" />
              </button>
            </Badge>
          ))}
          <Button
            type="button"
            variant="ghost"
            size="xs"
            className="h-7 px-2 text-muted-foreground"
            onClick={clearAllFilters}
          >
            Clear all
          </Button>
        </div>
      ) : null}
    </div>
  )
}
