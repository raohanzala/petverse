"use client"

import { format } from "date-fns"
import { CalendarIcon } from "lucide-react"
import { type DateRange } from "react-day-picker"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Field } from "@/components/ui/field"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

type DatePickerWithRangeProps = {
  date?: DateRange
  onDateChange: (date: DateRange | undefined) => void
}

export function DatePickerWithRange({
  date,
  onDateChange,
}: DatePickerWithRangeProps) {
  return (
    <Field>
      <Popover>
        <PopoverTrigger
          render={
            <Button
              variant="outline"
              id="date-picker-range"
              className="h-9 justify-start px-2.5 font-normal"
            >
              <CalendarIcon data-icon="inline-start" />

              {date?.from ? (
                date.to ? (
                  <>
                    {format(date.from, "LLL dd, y")} -{" "}
                    {format(date.to, "LLL dd, y")}
                  </>
                ) : (
                  format(date.from, "LLL dd, y")
                )
              ) : (
                <span className="text-muted-foreground">
                  Pick a date range
                </span>
              )}
            </Button>
          }
        />

        <PopoverContent
          className="w-auto p-0"
          align="start"
        >
          <Calendar
            mode="range"
            defaultMonth={date?.from}
            selected={date}
            onSelect={onDateChange}
            numberOfMonths={2}
          />
        </PopoverContent>
      </Popover>
    </Field>
  )
}