"use client"

import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  Grid2X2,
  PawPrint,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Tabs,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"

import type { ResourceFilter } from "./room-board-manager"
import { formatDate } from "./room-board-manager"

type RoomBoardControlsProps = {
  filter: ResourceFilter
  onFilterChange: (
    filter: ResourceFilter
  ) => void
  selectedDate: Date
  onPreviousDay: () => void
  onNextDay: () => void
  onToday: () => void
  occupiedCount: number
  totalCount: number
}

const FILTERS: {
  value: ResourceFilter
  label: string
}[] = [
  {
    value: "all",
    label: "All",
  },
  {
    value: "kennel",
    label: "Kennels",
  },
  {
    value: "suite",
    label: "Suites",
  },
  {
    value: "playroom",
    label: "Playrooms",
  },
  {
    value: "other",
    label: "Other",
  },
]

export function RoomBoardControls({
  filter,
  onFilterChange,
  selectedDate,
  onPreviousDay,
  onNextDay,
  onToday,
  occupiedCount,
  totalCount,
}: RoomBoardControlsProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border bg-background p-2">
      <Tabs
        value={filter}
        onValueChange={(value) =>
          onFilterChange(
            value as ResourceFilter
          )
        }
      >
        <TabsList
          variant="line"
          className="h-9 w-auto justify-start gap-1 rounded-md p-0"
        >
          {FILTERS.map((item) => {
            return (
              <TabsTrigger
                key={item.value}
                value={item.value}
                className="h-9 flex-none px-3"
              >
                {item.value === "all" && (
                  <Grid2X2 className="size-4" />
                )}

                {item.value === "kennel" && (
                  <PawPrint className="size-4" />
                )}

                {item.value === "suite" && (
                  <Grid2X2 className="size-4" />
                )}

                {item.value === "playroom" && (
                  <PawPrint className="size-4" />
                )}

                {item.value === "other" && (
                  <Grid2X2 className="size-4" />
                )}

                {item.label}
              </TabsTrigger>
            )
          })}
        </TabsList>
      </Tabs>

      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onToday}
        >
          Today
        </Button>

        <div className="flex items-center rounded-md border">
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={onPreviousDay}
            aria-label="Previous day"
          >
            <ArrowLeft className="size-4" />
          </Button>

          <div className="flex min-w-[145px] items-center justify-center gap-2 border-x px-3 py-1.5 text-sm font-medium">
            <CalendarDays className="size-4 text-muted-foreground" />

            {formatDate(selectedDate)}
          </div>

          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={onNextDay}
            aria-label="Next day"
          >
            <ArrowRight className="size-4" />
          </Button>
        </div>

        <Badge variant="outline">
          {occupiedCount}/{totalCount} occupied
        </Badge>
      </div>
    </div>
  )
}