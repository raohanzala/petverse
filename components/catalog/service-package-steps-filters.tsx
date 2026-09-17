"use client"

import { ListFilterIcon, SearchIcon } from "lucide-react"
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

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"

type ServicePackageStepsFiltersProps = {
  initialSearch?: string
  initialPackageId?: number
  initialServiceId?: string
  packages?: {
    id: number
    name: string
  }[]
  services?: {
    id: string
    name: string
  }[]
  onLoadingChange?: (isLoading: boolean) => void
  /** `bar` = labeled selects + clear; `search` = search input only */
  section?: "bar" | "search"
  className?: string
}

export function ServicePackageStepsFilters({
  initialSearch = "",
  initialPackageId,
  initialServiceId,
  packages = [],
  services = [],
  onLoadingChange,
  section = "bar",
  className,
}: ServicePackageStepsFiltersProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const [isPending, startTransition] = useTransition()
  const [search, setSearch] = useState(initialSearch)

  useEffect(() => {
    onLoadingChange?.(isPending)
  }, [isPending, onLoadingChange])

  const selectedPackageLabel =
    initialPackageId === undefined
      ? "All packages"
      : (packages.find((pkg) => pkg.id === initialPackageId)?.name ??
        "All packages")

  const selectedServiceLabel =
    initialServiceId === undefined
      ? "All services"
      : (services.find((service) => service.id === initialServiceId)?.name ??
        "All services")

  const hasActiveFilters =
    Boolean(initialSearch) ||
    initialPackageId !== undefined ||
    Boolean(initialServiceId)

  const updateParams = useCallback(
    (updates: {
      q?: string | null
      packageId?: number | null
      serviceId?: string | null
      clear?: boolean
    }) => {
      if (updates.clear) {
        startTransition(() => {
          router.replace(pathname)
        })
        return
      }

      const params = new URLSearchParams(searchParams.toString())

      if (updates.q !== undefined) {
        const value = updates.q?.trim()
        if (value) {
          params.set("q", value)
        } else {
          params.delete("q")
        }
      }

      if (updates.packageId !== undefined) {
        if (updates.packageId === null) {
          params.delete("packageId")
        } else {
          params.set("packageId", String(updates.packageId))
        }
      }

      if (updates.serviceId !== undefined) {
        if (updates.serviceId === null) {
          params.delete("serviceId")
        } else {
          params.set("serviceId", updates.serviceId)
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
    if (section !== "search") return
    if (search === urlSearch) return

    const timer = window.setTimeout(() => {
      updateParams({ q: search })
    }, 350)

    return () => window.clearTimeout(timer)
  }, [search, urlSearch, updateParams, section])

  if (section === "search") {
    return (
      <div className={cn("relative w-full max-w-md", className)}>
        <SearchIcon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search packages or services…"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          className="h-10 rounded-lg border-border bg-card pl-9 shadow-none"
          aria-label="Search packages or services"
        />
      </div>
    )
  }

  return (
    <div
      className={cn(
        "flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between",
        className
      )}
    >
      <div className="flex flex-1 flex-wrap items-end gap-3">
        <div className="grid w-full gap-1.5 sm:w-[200px]">
          <Label
            htmlFor="package-step-package-filter"
            className="text-xs font-medium text-muted-foreground"
          >
            Package
          </Label>
          <Select
            value={
              initialPackageId !== undefined
                ? String(initialPackageId)
                : "all"
            }
            onValueChange={(value) => {
              if (!value) return
              updateParams({
                packageId: value === "all" ? null : Number(value),
              })
            }}
          >
            <SelectTrigger
              id="package-step-package-filter"
              className="h-10 w-full rounded-lg border-border bg-card shadow-none"
            >
              <SelectValue>{selectedPackageLabel}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All packages</SelectItem>
              {packages.map((pkg) => (
                <SelectItem key={pkg.id} value={String(pkg.id)}>
                  {pkg.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid w-full gap-1.5 sm:w-[200px]">
          <Label
            htmlFor="package-step-service-filter"
            className="text-xs font-medium text-muted-foreground"
          >
            Service
          </Label>
          <Select
            value={initialServiceId ?? "all"}
            onValueChange={(value) => {
              if (!value) return
              updateParams({
                serviceId: value === "all" ? null : value,
              })
            }}
          >
            <SelectTrigger
              id="package-step-service-filter"
              className="h-10 w-full rounded-lg border-border bg-card shadow-none"
            >
              <SelectValue>{selectedServiceLabel}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All services</SelectItem>
              {services.map((service) => (
                <SelectItem key={service.id} value={service.id}>
                  {service.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Button
        type="button"
        variant="outline"
        className="h-10 shrink-0 rounded-lg border-border bg-card shadow-none"
        disabled={!hasActiveFilters || isPending}
        onClick={() => {
          setSearch("")
          updateParams({ clear: true })
        }}
      >
        <ListFilterIcon className="size-4" />
        Clear filters
      </Button>
    </div>
  )
}
