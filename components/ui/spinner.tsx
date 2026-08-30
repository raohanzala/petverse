import { Loader2Icon } from "lucide-react"

import { cn } from "@/lib/utils"

const sizeClasses = {
  sm: "size-4",
  default: "size-6",
  lg: "size-8",
  xl: "size-10",
} as const

type SpinnerProps = {
  className?: string
  size?: keyof typeof sizeClasses
  label?: string
}

function Spinner({
  className,
  size = "default",
  label = "Loading",
}: SpinnerProps) {
  return (
    <Loader2Icon
      role="status"
      aria-label={label}
      className={cn("animate-spin text-primary", sizeClasses[size], className)}
    />
  )
}

export { Spinner, sizeClasses }
