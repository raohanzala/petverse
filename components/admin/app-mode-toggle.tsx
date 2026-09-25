"use client"

import { useTransition } from "react"
import { PawPrintIcon } from "lucide-react"
import { useRouter } from "next/navigation"

import { useFeatures } from "@/lib/features/feature-context"
import { APP_MODES } from "@/lib/supabase/types/index"
import { setAppMode } from "@/lib/app-mode/set-app-mode"

export function AppModeToggle() {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const { mode } = useFeatures()

  const isPetMode = mode === APP_MODES.PET

  function handleToggle() {
    const nextMode = isPetMode
      ? APP_MODES.GENERAL
      : APP_MODES.PET

    startTransition(async () => {
      await setAppMode(nextMode)
      router.refresh()
    })
  }

  return (
    <button
      type="button"
      onClick={handleToggle}
      disabled={isPending}
      aria-label={`Switch to ${isPetMode ? "general" : "pet"} mode`}
      aria-pressed={isPetMode}
      className="flex h-10 items-center gap-2 rounded-lg border border-border bg-background px-3 text-sm font-medium transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-60"
    >
      <PawPrintIcon className="size-4" />

      <span className="hidden sm:inline">
        Pet Mode
      </span>

      <span
        className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
          isPetMode ? "bg-primary" : "bg-muted"
        }`}
      >
        <span
          className={`size-4 rounded-full bg-background shadow-sm transition-transform ${
            isPetMode ? "translate-x-4" : "translate-x-0.5"
          }`}
        />
      </span>
    </button>
  )
}