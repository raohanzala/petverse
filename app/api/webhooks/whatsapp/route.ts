import { NextRequest, NextResponse } from "next/server"

const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN

/**
 * Meta webhook verification
 *
 * Meta sends a GET request when we configure the webhook.
 * We verify that the token sent by Meta matches our secret token.
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
 *
 * Meta will send POST requests here when a WhatsApp event occurs.
 *
 * We will implement message processing after
 * webhook verification is working.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    console.log("WhatsApp webhook received:", body)

    return NextResponse.json(
      {
        success: true,
      },
      {
        status: 200,
      },
    )
  } catch (error) {
    console.error("WhatsApp webhook error:", error)

    return NextResponse.json(
      {
        error: "Invalid webhook payload",
      },
      {
        status: 400,
      },
    )
  }
}