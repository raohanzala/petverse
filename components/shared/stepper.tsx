import { CheckIcon } from "lucide-react"

import { cn } from "@/lib/utils"

export type StepperStep = {
  id: string
  label: string
}

type StepperProps = {
  steps: StepperStep[]
  currentStep: number
  className?: string
}

export function Stepper({ steps, currentStep, className }: StepperProps) {
  return (
    <ol className={cn("flex w-full items-center gap-2", className)}>
      {steps.map((step, index) => {
        const stepNumber = index + 1
        const isCompleted = stepNumber < currentStep
        const isCurrent = stepNumber === currentStep

        return (
          <li key={step.id} className="flex min-w-0 flex-1 items-center gap-2">
            <div className="flex min-w-0 flex-col items-center gap-1.5">
              <span
                className={cn(
                  "flex size-8 shrink-0 items-center justify-center rounded-full border text-sm font-medium transition-colors",
                  isCompleted || isCurrent
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-card text-muted-foreground"
                )}
              >
                {isCompleted ? (
                  <CheckIcon className="size-4" aria-hidden="true" />
                ) : (
                  stepNumber
                )}
              </span>
              <span
                className={cn(
                  "hidden truncate text-center text-xs sm:block",
                  isCurrent ? "font-medium text-foreground" : "text-muted-foreground"
                )}
              >
                {step.label}
              </span>
            </div>
            {index < steps.length - 1 ? (
              <div
                className={cn(
                  "mb-5 h-px flex-1",
                  isCompleted ? "bg-primary" : "bg-border"
                )}
                aria-hidden="true"
              />
            ) : null}
          </li>
        )
      })}
    </ol>
  )
}
