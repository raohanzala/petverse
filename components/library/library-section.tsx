import { cn } from "@/lib/utils"

type LibrarySectionProps = {
  id: string
  title: string
  description: string
  usage: string
  importFrom?: string
  children: React.ReactNode
  className?: string
}

export function LibrarySection({
  id,
  title,
  description,
  usage,
  importFrom,
  children,
  className,
}: LibrarySectionProps) {
  return (
    <section id={id} className={cn("scroll-mt-24 space-y-4", className)}>
      <div className="space-y-1">
        <h2 className="text-lg font-semibold text-foreground">{title}</h2>
        <p className="text-sm text-muted-foreground">{description}</p>
        {importFrom ? (
          <p className="font-mono text-xs text-muted-foreground">
            import from &quot;{importFrom}&quot;
          </p>
        ) : null}
      </div>

      <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
        {children}
      </div>

      <div className="rounded-lg bg-muted/50 p-4">
        <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Usage
        </p>
        <pre className="overflow-x-auto font-mono text-xs leading-relaxed text-foreground">
          <code>{usage}</code>
        </pre>
      </div>
    </section>
  )
}
