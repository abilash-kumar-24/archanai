export const dynamic = "force-dynamic"
import { NextRequest, NextResponse } from "next/server"
import crypto from "crypto"
import { prisma } from "@/lib/prisma"
import { env } from "@/lib/env"

export async function POST(req: NextRequest) {
  if (!env.razorpayWebhookSecret) {
    console.error("[razorpay webhook] RAZORPAY_WEBHOOK_SECRET not set")
    return NextResponse.json({ error: "Webhook not configured" }, { status: 500 })
  }

  const body = await req.text()
  const signature = req.headers.get("x-razorpay-signature") ?? ""

  const expectedSignature = crypto
    .createHmac("sha256", env.razorpayWebhookSecret)
    .update(body)
    .digest("hex")

  if (expectedSignature !== signature) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 })
  }

  const event = JSON.parse(body) as {
    event: string
    payload: { payment: { entity: { id: string; order_id: string } } }
  }

  if (event.event === "payment.captured") {
    const { order_id, id: paymentId } = event.payload.payment.entity
    await prisma.booking.updateMany({
      where: { razorpayOrderId: order_id },
      data: {
        razorpayPaymentId: paymentId,
        paymentStatus: "DEPOSIT_PAID",
        status: "CONFIRMED",
        confirmedAt: new Date(),
      },
    })
  }

  if (event.event === "payment.failed") {
    const { order_id } = event.payload.payment.entity
    console.warn("[razorpay webhook] payment.failed for order", order_id)
  }

  return NextResponse.json({ received: true })
}
