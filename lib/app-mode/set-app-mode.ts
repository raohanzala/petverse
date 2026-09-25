"use server"

import { cookies } from "next/headers"

import {
  APP_MODE_COOKIE,
  type AppMode,
} from "@/lib/supabase/types/index"


export async function setAppMode(mode: AppMode): Promise<void> {
  const cookieStore = await cookies()

  cookieStore.set(APP_MODE_COOKIE, mode, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  })
}