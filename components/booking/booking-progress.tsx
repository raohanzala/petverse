"use client"

import { Check } from "lucide-react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type BookingStep = 1 | 2 | 3 | 4

type BookingProgressStep = {
  number: BookingStep
  label: string
}

type BookingProgressProps = {
  currentStep: BookingStep
  steps: readonly BookingProgressStep[]
  onStepClick?: (step: BookingStep) => void
}

export function BookingProgress({
  currentStep,
  steps,
  onStepClick,
}: BookingProgressProps) {
  return (
    <div
      className="w-full"
      aria-label="Booking progress"
    >
      <div className="relative flex items-start justify-between">
        {/* Progress line */}
        <div
          className="absolute top-4 right-0 left-0 -z-0 h-px bg-muted"
          aria-hidden="true"
        />

        {/* Active progress line */}
        <div
          className="absolute top-4 left-0 -z-0 h-px bg-primary transition-all duration-300"
          style={{
            width:
              steps.length > 1
                ? `${((currentStep - 1) / (steps.length - 1)) * 100}%`
                : "0%",
          }}
          aria-hidden="true"
        />

        {steps.map((step) => {
          const isCompleted =
            step.number < currentStep

          const isCurrent =
            step.number === currentStep

          const isAccessible =
            step.number <= currentStep

          return (
            <div
              key={step.number}
              className="relative z-10 flex min-w-0 flex-1 flex-col items-center"
            >
              <Button
                type="button"
                variant="ghost"
                size="icon"
                disabled={!isAccessible}
                onClick={() => {
                  if (isAccessible) {
                    onStepClick?.(step.number)
                  }
                }}
                aria-current={
                  isCurrent ? "step" : undefined
                }
                aria-label={`Step ${step.number}: ${step.label}`}
                className={cn(
                  "size-8 rounded-full border p-0 shadow-none transition-colors",
                  "hover:bg-background",
                  "focus-visible:ring-2 focus-visible:ring-primary/30",

                  isCompleted &&
                    "border-primary bg-background text-primary",

                  isCurrent &&
                    "border-primary bg-primary text-primary-foreground hover:bg-primary",

                  !isCurrent &&
                    !isCompleted &&
                    "border-muted bg-muted text-muted-foreground"
                )}
              >
                {isCompleted ? (
                  <Check className="size-4" />
                ) : (
                  <span className="text-xs font-medium">
                    {step.number}
                  </span>
                )}
              </Button>

              <span
                className={cn(
                  "mt-1.5 text-center text-xs font-medium",
                  isCurrent || isCompleted
                    ? "text-primary"
                    : "text-muted-foreground"
                )}
              >
                {step.label}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}