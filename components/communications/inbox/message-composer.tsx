"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Send } from "lucide-react"
import { toast } from "@/components/ui/toast"

import { createConversationMessage } from "@/lib/supabase/mutations/conversation-messages"
import { Button } from "@/components/ui/button"
import {
  Field,
  FieldError,
  FieldGroup,
} from "@/components/ui/field"
import { Textarea } from "@/components/ui/textarea"

type MessageComposerProps = {
  conversationId: string
}

export function MessageComposer({
  conversationId,
}: MessageComposerProps) {
  const router = useRouter()

  const [body, setBody] = useState("")
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault()

    const trimmedBody = body.trim()

    if (!trimmedBody) {
      setError("Message body is required")
      return
    }

    setError(null)

    startTransition(async () => {
      const result = await createConversationMessage({
        conversation_id: conversationId,
        direction: "outbound",
        body: trimmedBody,
      })

      if (!result.success) {
        setError(result.error)

        toast.add({
          type: "error",
          description: result.error,
          priority: "high",
        })

        return
      }

      setBody("")

      toast.add({
        type: "success",
        description: "Message sent successfully.",
        priority: "high",
      })

      router.refresh()
    })
  }

  function handleKeyDown(
    event: React.KeyboardEvent<HTMLTextAreaElement>
  ) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault()

      if (!isPending && body.trim()) {
        event.currentTarget.form?.requestSubmit()
      }
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <FieldGroup>
        <Field data-invalid={!!error}>
          <Textarea
            value={body}
            onChange={(event) => {
              setBody(event.target.value)

              if (error) {
                setError(null)
              }
            }}
            onKeyDown={handleKeyDown}
            placeholder="Write a message..."
            disabled={isPending}
            rows={3}
            aria-invalid={!!error}
          />

          {error && <FieldError>{error}</FieldError>}
        </Field>

        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            Press Enter to send · Shift + Enter for a new line
          </p>

          <Button
            type="submit"
            disabled={isPending || !body.trim()}
          >
            <Send />
            {isPending ? "Sending…" : "Send"}
          </Button>
        </div>
      </FieldGroup>
    </form>
  )
}