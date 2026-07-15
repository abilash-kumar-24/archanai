export const dynamic = "force-dynamic"
import { NextRequest, NextResponse } from "next/server"
import Razorpay from "razorpay"
import { prisma } from "@/lib/prisma"
import { getSessionUser } from "@/lib/supabase/get-session-user"
import { env } from "@/lib/env"

function getRazorpay() {
  if (!env.razorpayKeyId || !env.razorpayKeySecret) {
    throw new Error("Razorpay keys not configured")
  }
  return new Razorpay({ key_id: env.razorpayKeyId, key_secret: env.razorpayKeySecret })
}

export async function POST(req: NextRequest) {
  const user = await getSessionUser()
  if (!user) return NextResponse.json({ error: "Unauthorised" }, { status: 401 })

  try {
    const { bookingId } = await req.json()

    const booking = await prisma.booking.findFirst({
      where: { id: bookingId, consumerId: user.id },
    })

    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 })
    }

    if (booking.depositAmount <= 0) {
      return NextResponse.json({ error: "No deposit required for this booking" }, { status: 400 })
    }

    const razorpay = getRazorpay()
    const order = await razorpay.orders.create({
      amount: booking.depositAmount * 100, // paise
      currency: "INR",
      receipt: booking.bookingRef,
      notes: { bookingId: booking.id },
    })

    await prisma.booking.update({
      where: { id: booking.id },
      data: { razorpayOrderId: order.id },
    })

    return NextResponse.json({
      orderId: order.id,
      amount: booking.depositAmount,
      currency: "INR",
      keyId: env.razorpayKeyId,
      bookingRef: booking.bookingRef,
    })
  } catch (err) {
    console.error("[payments/create-order]", err)
    return NextResponse.json({ error: "Failed to create payment order" }, { status: 500 })
  }
}
