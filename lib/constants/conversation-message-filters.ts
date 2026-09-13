export const CONVERSATION_MESSAGE_DIRECTION_FILTERS = [
  "all",
  "inbound",
  "outbound",
] as const

export type ConversationMessageDirectionFilter =
  (typeof CONVERSATION_MESSAGE_DIRECTION_FILTERS)[number]

export type ConversationMessageListFilters = {
  direction?: ConversationMessageDirectionFilter
}

export function parseConversationMessageListFilters(
  params: Record<string, string | string[] | undefined>
): ConversationMessageListFilters {
  const rawDirection =
    typeof params.direction === "string"
      ? params.direction
      : "all"

  const direction =
    CONVERSATION_MESSAGE_DIRECTION_FILTERS.includes(
      rawDirection as ConversationMessageDirectionFilter
    )
      ? (rawDirection as ConversationMessageDirectionFilter)
      : "all"

  return {
    direction,
  }
}