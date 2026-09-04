"use client"

import {
  Box,
  CalendarClock,
  CircleDollarSign,
  Clock3,
  House,
  PawPrint,
  Stethoscope,
  Sun,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import type {
  ServiceCategoryRow,
  ServiceRow,
} from "@/lib/supabase/types"
import { cn } from "@/lib/utils"

type ServiceGroup = {
  category: ServiceCategoryRow
  services: ServiceRow[]
}

type ServiceStepProps = {
  groupedServices: ServiceGroup[]
  uncategorizedServices: ServiceRow[]
  selectedServiceId: string | null
  onSelectService: (service: ServiceRow) => void
}

function getCategoryIcon(categoryName: string) {
  const name = categoryName.toLowerCase()

  if (
    name.includes("veterinary") ||
    name.includes("vet")
  ) {
    return Stethoscope
  }

  if (
    name.includes("boarding") ||
    name.includes("stay")
  ) {
    return House
  }

  if (
    name.includes("daycare") ||
    name.includes("day care")
  ) {
    return Sun
  }

  if (
    name.includes("groom") ||
    name.includes("package")
  ) {
    return Box
  }

  return PawPrint
}

function formatPrice(price: number) {
  return `PKR ${price.toLocaleString()}`
}

function formatDuration(minutes: number) {
  if (minutes < 60) {
    return `${minutes} min`
  }

  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60

  if (!remainingMinutes) {
    return `${hours} hr`
  }

  return `${hours} hr ${remainingMinutes} min`
}

function formatKind(kind: string) {
  return kind.charAt(0).toUpperCase() + kind.slice(1)
}

export function ServiceStep({
  groupedServices,
  uncategorizedServices,
  selectedServiceId,
  onSelectService,
}: ServiceStepProps) {
  const visibleGroups = groupedServices.filter(
    (group) => group.services.length > 0
  )

  return (
    <div className="space-y-6">
      {/* Heading */}
      <div>
        <h2 className="text-lg font-semibold">
          Select a Service
        </h2>

        <p className="text-sm text-muted-foreground">
          Choose the service you&apos;d like to book for
          your pet.
        </p>
      </div>

      {/* Categories */}
      <div className="space-y-4">
        {visibleGroups.map(
          ({ category, services }) => {
            const Icon = getCategoryIcon(category.name)

            return (
              <section
                key={category.id}
                className="overflow-hidden rounded-xl border"
              >
                {/* Category header */}
                <div className="flex items-center gap-3 border-b bg-muted/30 px-4 py-3">
                  <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Icon className="size-4" />
                  </div>

                  <div className="min-w-0">
                    <h3 className="text-sm font-semibold">
                      {category.name}
                    </h3>

                    <p className="text-xs text-muted-foreground">
                      {services.length}{" "}
                      {services.length === 1
                        ? "service"
                        : "services"}{" "}
                      available
                    </p>
                  </div>
                </div>

                {/* Services */}
                <div className="grid gap-3 p-3 sm:grid-cols-2">
                  {services.map((service) => {
                    const isSelected =
                      selectedServiceId === service.id

                    return (
                      <button
                        key={service.id}
                        type="button"
                        onClick={() =>
                          onSelectService(service)
                        }
                        aria-pressed={isSelected}
                        className={cn(
                          "group w-full rounded-xl border bg-background p-4 text-left transition-all",
                          "hover:border-primary/40 hover:bg-muted/20",
                          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30",
                          isSelected &&
                            "border-primary bg-primary/5 ring-1 ring-primary"
                        )}
                      >
                        <div className="flex items-start gap-3">
                          {/* Service icon */}
                          <div
                            className={cn(
                              "flex size-9 shrink-0 items-center justify-center rounded-lg",
                              "bg-primary/10 text-primary",
                              isSelected &&
                                "bg-primary text-primary-foreground"
                            )}
                          >
                            <Icon className="size-4" />
                          </div>

                          {/* Service content */}
                          <div className="min-w-0 flex-1">
                            <div className="flex items-start justify-between gap-2">
                              <div className="min-w-0">
                                <h4 className="truncate text-sm font-semibold">
                                  {service.name}
                                </h4>

                                {service.kind ? (
                                  <Badge
                                    variant="secondary"
                                    className="mt-1 text-[10px]"
                                  >
                                    {formatKind(
                                      service.kind
                                    )}
                                  </Badge>
                                ) : null}
                              </div>

                              {isSelected ? (
                                <span className="shrink-0 text-xs font-medium text-primary">
                                  Selected
                                </span>
                              ) : null}
                            </div>

                            {service.description ? (
                              <p className="mt-2 line-clamp-2 text-xs leading-5 text-muted-foreground">
                                {service.description}
                              </p>
                            ) : null}

                            {/* Price + duration */}
                            <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs">
                              <span className="inline-flex items-center gap-1 font-medium text-foreground">
                                <CircleDollarSign className="size-3.5 text-muted-foreground" />
                                {formatPrice(
                                  service.price
                                )}
                              </span>

                              <span className="inline-flex items-center gap-1 text-muted-foreground">
                                <Clock3 className="size-3.5" />
                                {formatDuration(
                                  service.duration_minutes
                                )}
                              </span>
                            </div>
                          </div>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </section>
            )
          }
        )}

        {/* Uncategorized */}
        {uncategorizedServices.length > 0 ? (
          <section className="overflow-hidden rounded-xl border">
            <div className="flex items-center gap-3 border-b bg-muted/30 px-4 py-3">
              <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <PawPrint className="size-4" />
              </div>

              <div>
                <h3 className="text-sm font-semibold">
                  Other Services
                </h3>

                <p className="text-xs text-muted-foreground">
                  Services without a category
                </p>
              </div>
            </div>

            <div className="grid gap-3 p-3 sm:grid-cols-2">
              {uncategorizedServices.map(
                (service) => {
                  const isSelected =
                    selectedServiceId === service.id

                  return (
                    <button
                      key={service.id}
                      type="button"
                      onClick={() =>
                        onSelectService(service)
                      }
                      aria-pressed={isSelected}
                      className={cn(
                        "group w-full rounded-xl border bg-background p-4 text-left transition-all",
                        "hover:border-primary/40 hover:bg-muted/20",
                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30",
                        isSelected &&
                          "border-primary bg-primary/5 ring-1 ring-primary"
                      )}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={cn(
                            "flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary",
                            isSelected &&
                              "bg-primary text-primary-foreground"
                          )}
                        >
                          <PawPrint className="size-4" />
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-2">
                            <h4 className="truncate text-sm font-semibold">
                              {service.name}
                            </h4>

                            {isSelected ? (
                              <span className="shrink-0 text-xs font-medium text-primary">
                                Selected
                              </span>
                            ) : null}
                          </div>

                          {service.description ? (
                            <p className="mt-2 line-clamp-2 text-xs leading-5 text-muted-foreground">
                              {service.description}
                            </p>
                          ) : null}

                          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs">
                            <span className="inline-flex items-center gap-1 font-medium">
                              <CircleDollarSign className="size-3.5 text-muted-foreground" />
                              {formatPrice(service.price)}
                            </span>

                            <span className="inline-flex items-center gap-1 text-muted-foreground">
                              <Clock3 className="size-3.5" />
                              {formatDuration(
                                service.duration_minutes
                              )}
                            </span>
                          </div>
                        </div>
                      </div>
                    </button>
                  )
                }
              )}
            </div>
          </section>
        ) : null}

        {/* No services */}
        {visibleGroups.length === 0 &&
        uncategorizedServices.length === 0 ? (
          <div className="rounded-xl border border-dashed px-6 py-12 text-center">
            <CalendarClock className="mx-auto size-8 text-muted-foreground" />

            <h3 className="mt-3 text-sm font-semibold">
              No services available
            </h3>

            <p className="mt-1 text-sm text-muted-foreground">
              There are currently no active public
              services available for booking.
            </p>
          </div>
        ) : null}
      </div>
    </div>
  )
}