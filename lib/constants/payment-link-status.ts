import type { PaymentTokenRow } from "@/lib/supabase/types"

export type PaymentLinkStatus =
  | "active"
  | "used"
  | "expired"

export function getPaymentLinkStatus(
  paymentLink: PaymentTokenRow,
  now = new Date()
): PaymentLinkStatus {
  if (paymentLink.used_at) {
    return "used"
  }

  if (
    new Date(paymentLink.expires_at).getTime() <=
    now.getTime()
  ) {
    return "expired"
  }

  return "active"
}