"use client"

import { Button } from "@/components/ui/button"
import {
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Message,
  MessageContent,
  MessageFooter,
  MessageGroup,
} from "@/components/ui/message"
import type {
  ConversationMessageRow,
  ConversationRow,
} from "@/lib/supabase/types"
import { MessageComposer } from "./message-composer"

type ConversationThreadProps = {
  conversation: ConversationRow
  messages: ConversationMessageRow[]
  onClose: () => void
}

export function ConversationThread({
  conversation,
  messages,
  onClose,
}: ConversationThreadProps) {
  return (
    <>
      <CardHeader className="border-b">
        <div className="flex items-center justify-between gap-4">
          <div className="min-w-0">
            <CardTitle className="truncate text-base">
              Conversation
            </CardTitle>

            <p className="mt-1 truncate text-xs text-muted-foreground">
              {conversation.channel}
            </p>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
          >
            Close
          </Button>
        </div>
      </CardHeader>

      <CardContent className="flex flex-1 flex-col p-0">
        <div className="flex-1 overflow-y-auto p-4">
          {messages.length === 0 ? (
            <div className="flex min-h-[300px] items-center justify-center text-sm text-muted-foreground">
              No messages in this conversation.
            </div>
          ) : (
            <MessageGroup className="gap-4">
              {messages.map((message) => {
                const isOutbound =
                  message.direction === "outbound"

                return (
                  <Message
                    key={message.id}
                    align={isOutbound ? "end" : "start"}
                  >
                    <MessageContent className="w-auto max-w-[75%]">
                      <div
                        className={
                          isOutbound
                            ? "rounded-2xl rounded-br-sm bg-primary px-4 py-2.5 text-sm text-primary-foreground"
                            : "rounded-2xl rounded-bl-sm bg-muted px-4 py-2.5 text-sm"
                        }
                      >
                        <p className="whitespace-pre-wrap break-words">
                          {message.body}
                        </p>
                      </div>

                      <MessageFooter className="px-1 text-[11px]">
                        {new Date(
                          message.sent_at
                        ).toLocaleString()}
                      </MessageFooter>
                    </MessageContent>
                  </Message>
                )
              })}
            </MessageGroup>
          )}
        </div>

        <div className="border-t p-4">
          <MessageComposer
            conversationId={conversation.id}
          />
        </div>
      </CardContent>
    </>
  )
}