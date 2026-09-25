import { cookies } from "next/headers"

import {
  APP_MODE_COOKIE,
  APP_MODES,
  DEFAULT_APP_MODE,
  type AppMode,
} from "@/lib/supabase/types/index"

export async function getAppMode(): Promise<AppMode> {
  const cookieStore = await cookies()
  const mode = cookieStore.get(APP_MODE_COOKIE)?.value

  if (mode === APP_MODES.GENERAL) {
    return APP_MODES.GENERAL
  }

  if (mode === APP_MODES.PET) {
    return APP_MODES.PET
  }

  return DEFAULT_APP_MODE
}