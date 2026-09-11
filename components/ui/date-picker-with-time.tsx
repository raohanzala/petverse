"use client"

import * as React from "react"
import { format } from "date-fns"
import { ChevronDownIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Field,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

type DatePickerTimeProps = {
  date?: Date
  onDateChange: (date: Date | undefined) => void
  time?: string
  onTimeChange: (time: string) => void
  dateLabel?: string
  timeLabel?: string
  datePlaceholder?: string
}

export function DatePickerTime({
  date,
  onDateChange,
  time = "",
  onTimeChange,
  dateLabel = "Date",
  timeLabel = "Time",
  datePlaceholder = "Select date",
}: DatePickerTimeProps) {
  const [open, setOpen] = React.useState(false)

  return (
    <FieldGroup className="flex-row">
      <Field>
        <FieldLabel>Date</FieldLabel>

        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger
            render={
              <Button
                variant="outline"
                type="button"
                className="w-32 justify-between font-normal"
              >
                {date
                  ? format(date, "PPP")
                  : datePlaceholder}

                <ChevronDownIcon data-icon="inline-end" />
              </Button>
            }
          />

          <PopoverContent
            className="w-auto overflow-hidden p-0"
            align="start"
          >
            <Calendar
              mode="single"
              selected={date}
              captionLayout="dropdown"
              defaultMonth={date}
              onSelect={(selectedDate) => {
                onDateChange(selectedDate)
                setOpen(false)
              }}
            />
          </PopoverContent>
        </Popover>
      </Field>

      <Field className="w-32">
        <FieldLabel>{timeLabel}</FieldLabel>

        <Input
          type="time"
          step="1"
          value={time}
          onChange={(event) => onTimeChange(event.target.value)}
          className="appearance-none bg-background [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
        />
      </Field>
    </FieldGroup>
  )
}