export const CONVERSATION_STAGE_FILTERS = [
  "all",
  "inquiry",
  "engaged",
  "quoted",
  "booked",
  "visited",
  "closed_lost",
  "closed_won",
] as const

export type ConversationStageFilter =
  (typeof CONVERSATION_STAGE_FILTERS)[number]

export type ConversationListFilters = {
  search?: string
  stage?: ConversationStageFilter
}

export function parseConversationListFilters(
  params: Record<string, string | string[] | undefined>
): ConversationListFilters {
  const rawStage =
    typeof params.stage === "string" ? params.stage : "all"

  const stage = CONVERSATION_STAGE_FILTERS.includes(
    rawStage as ConversationStageFilter
  )
    ? (rawStage as ConversationStageFilter)
    : "all"

  const search =
    typeof params.q === "string" ? params.q.trim() : undefined

  return {
    search: search || undefined,
    stage,
  }
}
