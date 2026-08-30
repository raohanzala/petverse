import { Spinner } from "@/components/ui/spinner"
import { cn } from "@/lib/utils"

type PageLoaderProps = {
  label?: string
  className?: string
  fullScreen?: boolean
}

export function PageLoader({
  label = "Loading…",
  className,
  fullScreen = false,
}: PageLoaderProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-3 text-center",
        fullScreen ? "min-h-screen" : "min-h-[40vh] py-16",
        className
      )}
    >
      <Spinner size="lg" />
      <p className="text-sm text-muted-foreground">{label}</p>
    </div>
  )
}
