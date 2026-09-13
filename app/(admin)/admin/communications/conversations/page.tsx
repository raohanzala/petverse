import { Suspense } from "react"

import { ConversationsManager } from "@/components/communications/conversations/conversations-manager"
import { PageLoader } from "@/components/shared/page-loader"
import { parseConversationListFilters } from "@/lib/constants/conversations-filters"
import { listConversations } from "@/lib/supabase/queries/conversations"
import { listEmployees } from "@/lib/supabase/queries/employees"
import { listOwners } from "@/lib/supabase/queries/owners"

type ConversationsPageProps = {
  searchParams: Promise<
    Record<string, string | string[] | undefined>
  >
}

export default async function ConversationsPage({
  searchParams,
}: ConversationsPageProps) {
  const params = await searchParams
  const filters = parseConversationListFilters(params)

  const conversations = await listConversations(filters)
  const owners = await listOwners()
  const employeeRows = await listEmployees()

  const employees = employeeRows.map((employee) => ({
    id: employee.id,
    name: employee.display_name,
  }))

  return (
    <Suspense
      fallback={
        <PageLoader label="Loading conversations…" />
      }
    >
      <ConversationsManager
        owners={owners}
        employees={employees}
        conversations={conversations}
        filters={filters}
      />
    </Suspense>
  )
}