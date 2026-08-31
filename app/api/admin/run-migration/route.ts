export const dynamic = "force-dynamic"
import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// One-off: run via the working serverless runtime connection rather than
// Vercel's build-time `prisma migrate deploy`, since DB reachability has
// been intermittent this session and a build-time failure blocks the
// whole deploy. Delete this route once run.
export async function POST(req: NextRequest) {
  const auth = req.headers.get("x-migration-secret")
  if (!auth || auth !== process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  try {
    const cols: { column_name: string }[] = await prisma.$queryRawUnsafe(
      `select column_name from information_schema.columns where table_name = 'bookings' and column_name in ('paymentStatus','platform_fee','deposit_amount','razorpay_order_id','razorpay_payment_id')`
    )
    if (cols.length === 0) {
      return NextResponse.json({ success: true, note: "already applied" })
    }

    await prisma.$executeRawUnsafe(`ALTER TABLE "bookings" DROP COLUMN IF EXISTS "paymentStatus"`)
    await prisma.$executeRawUnsafe(`ALTER TABLE "bookings" DROP COLUMN IF EXISTS "platform_fee"`)
    await prisma.$executeRawUnsafe(`ALTER TABLE "bookings" DROP COLUMN IF EXISTS "deposit_amount"`)
    await prisma.$executeRawUnsafe(`ALTER TABLE "bookings" DROP COLUMN IF EXISTS "razorpay_order_id"`)
    await prisma.$executeRawUnsafe(`ALTER TABLE "bookings" DROP COLUMN IF EXISTS "razorpay_payment_id"`)
    await prisma.$executeRawUnsafe(`DROP TYPE IF EXISTS "PaymentStatus"`)

    return NextResponse.json({ success: true, droppedCols: cols })
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : String(e) }, { status: 500 })
  }
}
