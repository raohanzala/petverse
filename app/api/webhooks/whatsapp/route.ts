import { NextRequest, NextResponse } from "next/server"

import { createClient } from "@/lib/supabase/server"

const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN

/**
 * Meta webhook verification
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams

  const mode = searchParams.get("hub.mode")
  const token = searchParams.get("hub.verify_token")
  const challenge = searchParams.get("hub.challenge")

  if (
    mode === "subscribe" &&
    token === VERIFY_TOKEN &&
    challenge
  ) {
    return new NextResponse(challenge, {
      status: 200,
    })
  }

  return NextResponse.json(
    {
      error: "Webhook verification failed",
    },
    {
      status: 403,
    },
  )
}

/**
 * WhatsApp incoming webhook
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    console.log(
      "WhatsApp webhook received:",
      JSON.stringify(body, null, 2),
    )

    return NextResponse.json(
      {
        success: true,
        received: true,
        field: body?.field ?? null,
        hasMessages: Boolean(body?.value?.messages),
      },
      { status: 200 },
    )
  } catch (error) {
    console.error("WhatsApp webhook error:", error)

    return NextResponse.json(
      {
        error: "Invalid webhook payload",
      },
      { status: 400 },
    )
  }
}