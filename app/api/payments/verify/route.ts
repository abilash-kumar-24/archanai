export const dynamic = "force-dynamic"
import { NextRequest, NextResponse } from "next/server"
import crypto from "crypto"
import { prisma } from "@/lib/prisma"
import { getSessionUser } from "@/lib/supabase/get-session-user"
import { env } from "@/lib/env"

export async function POST(req: NextRequest) {
  const user = await getSessionUser()
  if (!user) return NextResponse.json({ error: "Unauthorised" }, { status: 401 })

  if (!env.razorpayKeySecret) {
    return NextResponse.json({ error: "Payment verification not configured" }, { status: 500 })
  }

  try {
    const { bookingId, razorpay_order_id, razorpay_payment_id, razorpay_signature } = await req.json()

    const expectedSignature = crypto
      .createHmac("sha256", env.razorpayKeySecret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex")

    if (expectedSignature !== razorpay_signature) {
      return NextResponse.json({ error: "Invalid payment signature" }, { status: 400 })
    }

    await prisma.booking.update({
      where: { id: bookingId, consumerId: user.id },
      data: {
        razorpayPaymentId: razorpay_payment_id,
        paymentStatus: "DEPOSIT_PAID",
        status: "CONFIRMED",
        confirmedAt: new Date(),
      },
    })

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error("[payments/verify]", err)
    return NextResponse.json({ error: "Payment verification failed" }, { status: 500 })
  }
}
