import type { LucideIcon } from "lucide-react"

import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

type StatCardProps = {
  title: string
  value: string | number
  icon: LucideIcon
  trend?: {
    value: string
    positive?: boolean
  }
  iconClassName?: string
  className?: string
}

export function StatCard({
  title,
  value,
  icon: Icon,
  trend,
  iconClassName,
  className,
}: StatCardProps) {
  return (
    <Card className={cn("shadow-sm", className)}>
      <CardContent className="flex items-start gap-4 p-5">
        <div
          className={cn(
            "flex size-11 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary",
            iconClassName
          )}
        >
          <Icon className="size-5" />
        </div>
        <div className="min-w-0 space-y-1">
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className="text-2xl font-semibold tracking-tight text-foreground">
            {value}
          </p>
          {trend ? (
            <p
              className={cn(
                "text-xs font-medium",
                trend.positive ? "text-success" : "text-destructive"
              )}
            >
              {trend.value}
            </p>
          ) : null}
        </div>
      </CardContent>
    </Card>
  )
}
