export type RoomTransferListFilters = {
  search?: string
}

export function parseRoomTransferListFilters(
  params: Record<string, string | string[] | undefined>
): RoomTransferListFilters {
  const search =
    typeof params.room_transfers_q === "string"
      ? params.room_transfers_q.trim()
      : undefined

  return {
    search: search || undefined,
  }
}