import { ConstructionIcon } from "lucide-react"

import { EmptyState } from "@/components/shared/empty-state"
import { PageHeader } from "@/components/shared/page-header"

type AdminPlaceholderPageProps = {
  title: string
  description?: string
}

export function AdminPlaceholderPage({
  title,
  description,
}: AdminPlaceholderPageProps) {
  return (
    <div className="space-y-6">
      <PageHeader
        title={title}
        description={
          description ??
          `The ${title.toLowerCase()} module will be built in a future phase.`
        }
      />
      <EmptyState
        icon={ConstructionIcon}
        title="Coming soon"
        description={`We're setting up ${title.toLowerCase()} workflows for your clinic.`}
      />
    </div>
  )
}
