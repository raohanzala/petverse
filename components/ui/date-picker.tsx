"use client"

import * as React from "react"
import { format } from "date-fns"
import { ChevronDownIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

type DatePickerProps = {
  date?: Date
  onDateChange: (date: Date | undefined) => void
  placeholder?: string
}

export function DatePicker({
  date,
  onDateChange,
  placeholder = "Pick a date",
}: DatePickerProps) {
  return (
    <Popover>
      <PopoverTrigger
        render={
          <Button
            variant="outline"
            data-empty={!date}
            className="h-9 w-[180px] justify-between text-left font-normal data-[empty=true]:text-muted-foreground"
          >
            {date ? (
              format(date, "PPP")
            ) : (
              <span>{placeholder}</span>
            )}

            {!date && <ChevronDownIcon data-icon="inline-end" />}
          </Button>
        }
      />

      <PopoverContent
        className="w-auto p-0"
        align="start"
      >
        <Calendar
          mode="single"
          selected={date}
          onSelect={onDateChange}
          defaultMonth={date}
        />
      </PopoverContent>
    </Popover>
  )
}