"use client"

import {
  ChevronDown,
  Clock3,
  Scissors,
  Stethoscope,
  Home,
  PawPrint,
  CircleDollarSign,
  Box,
} from "lucide-react"

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

import { cn } from "@/lib/utils"

import type {
  ServiceCategoryRow,
  ServiceRow,
} from "@/lib/supabase/types"

type GroupedService = {
  category: ServiceCategoryRow
  services: ServiceRow[]
}

type ServiceStepProps = {
  groupedServices: GroupedService[]
  uncategorizedServices: ServiceRow[]
  selectedServiceId: string | null
  onSelectService: (
    service: ServiceRow
  ) => void
}

function CategoryIcon({
  name,
}: {
  name: string
}) {
  const value = name.toLowerCase()

  if (value.includes("groom")) {
    return <Scissors />
  }

  if (
    value.includes("veter") ||
    value.includes("medical")
  ) {
    return <Stethoscope />
  }

  if (
    value.includes("board") ||
    value.includes("stay")
  ) {
    return <Home />
  }

  return <PawPrint />
}

function ServiceIcon() {
  return (
    <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted text-primary">
      <Box className="size-4" />
    </div>
  )
}

function ServiceOption({
  service,
  selected,
  onSelect,
}: {
  service: ServiceRow
  selected: boolean
  onSelect: () => void
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "group flex w-full items-center gap-4 rounded-lg border p-4 text-left transition-all",
        selected
          ? "border-gold bg-gold/5 ring-1 ring-gold/30"
          : "border-border bg-card hover:border-navy/25 hover:bg-muted/40"
      )}
    >
      <ServiceIcon />

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-heading text-sm font-semibold text-foreground">
            {service.name}
          </span>

          <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
            Other
          </span>
        </div>

        <p className="mt-1 text-xs text-muted-foreground">
          {service.description}
        </p>

        <div className="mt-2.5 flex items-center gap-4 text-xs text-muted-foreground">

          <span className="flex items-center gap-1.5 font-medium text-foreground">
            <CircleDollarSign className="size-3.5 text-gold" />
            PKR{" "}
            {Number(service.price).toLocaleString()}
          </span>

          <span className="flex items-center gap-1.5">
            <Clock3 className="size-3.5" />
            {service.duration_minutes} min
          </span>

        </div>
      </div>

      <span
        className={cn(
          "flex size-5 shrink-0 items-center justify-center rounded-full border transition-all",
          selected
            ? "border-gold bg-gold"
            : "border-border bg-card group-hover:border-navy/40"
        )}
      >
        {selected ? (
          <span className="size-2 rounded-full bg-white" />
        ) : null}
      </span>
    </button>
  )
}

function ServiceAccordionItem({
  category,
  services,
  selectedServiceId,
  onSelectService,
}: {
  category: ServiceCategoryRow
  services: ServiceRow[]
  selectedServiceId: string | null
  onSelectService: (
    service: ServiceRow
  ) => void
}) {
  if (!services.length) return null

  return (
    <AccordionItem
      value={category.id}
      className="border-border"
    >
      <AccordionTrigger className="px-4 py-4 hover:no-underline">
        <div className="flex min-w-0 items-center gap-3">

          <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted text-primary">
            <CategoryIcon
              name={category.name}
            />
          </div>

          <div className="min-w-0 text-left">
            <div className="font-heading text-sm font-semibold text-foreground">
              {category.name}
            </div>

            <div className="mt-0.5 text-xs text-muted-foreground">
              {services.length}{" "}
              {services.length === 1
                ? "service"
                : "services"}{" "}
              available
            </div>
          </div>

        </div>
      </AccordionTrigger>

      <AccordionContent className="px-4 pb-4">
        <div className="grid gap-3">
          {services.map((service) => (
            <ServiceOption
              key={service.id}
              service={service}
              selected={
                selectedServiceId ===
                service.id
              }
              onSelect={() =>
                onSelectService(service)
              }
            />
          ))}
        </div>
      </AccordionContent>
    </AccordionItem>
  )
}

export function ServiceStep({
  groupedServices,
  uncategorizedServices,
  selectedServiceId,
  onSelectService,
}: ServiceStepProps) {
  return (
    <div className="p-5 lg:p-6">

      {/* Header */}
      <div className="mb-5 flex items-start gap-3">

        <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <PawPrint className="size-5" />
        </div>

        <div>
          <h2 className="font-heading text-base font-semibold text-foreground">
            Choose a Service
          </h2>

          <p className="mt-0.5 text-sm text-muted-foreground">
            Select the service that best suits your pet&apos;s needs.
          </p>
        </div>

      </div>

      {/* Accordion Card */}
      <Card
        size="sm"
        className="overflow-hidden border-border shadow-none flex"
      >
        <Accordion
          multiple={false}
          defaultValue={
            groupedServices[0]?.category
              ? [groupedServices[0].category.id]
              : []
          }
        >
          {groupedServices.map(
            ({
              category,
              services,
            }) => (
              <ServiceAccordionItem
                key={category.id}
                category={category}
                services={services}
                selectedServiceId={
                  selectedServiceId
                }
                onSelectService={
                  onSelectService
                }
              />
            )
          )}

          {uncategorizedServices.length > 0 ? (
            <AccordionItem
              value="other-services"
              className="border-border"
            >
              <AccordionTrigger className="px-4 py-4 hover:no-underline">
                <div className="flex min-w-0 items-center gap-3">

                  <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted text-primary">
                    <PawPrint />
                  </div>

                  <div className="min-w-0 text-left">
                    <div className="font-heading text-sm font-semibold text-foreground">
                      Other Services
                    </div>

                    <div className="mt-0.5 text-xs text-muted-foreground">
                      {uncategorizedServices.length}{" "}
                      {uncategorizedServices.length ===
                      1
                        ? "service"
                        : "services"}{" "}
                      available
                    </div>
                  </div>

                </div>
              </AccordionTrigger>

              <AccordionContent className="px-4 pb-4">
                <div className="grid gap-3">
                  {uncategorizedServices.map(
                    (service) => (
                      <ServiceOption
                        key={service.id}
                        service={service}
                        selected={
                          selectedServiceId ===
                          service.id
                        }
                        onSelect={() =>
                          onSelectService(
                            service
                          )
                        }
                      />
                    )
                  )}
                </div>
              </AccordionContent>
            </AccordionItem>
          ) : null}
        </Accordion>
      </Card>

    </div>
  )
}