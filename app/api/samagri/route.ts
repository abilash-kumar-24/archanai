export const dynamic = "force-dynamic"
import { NextRequest, NextResponse } from "next/server"
import { getSamagriList } from "@/lib/samagri/data"
import type { CeremonyType, Tradition } from "@/types"

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const ceremony  = searchParams.get("ceremony")  as CeremonyType | null
  const tradition = searchParams.get("tradition") as Tradition | null

  if (!ceremony) {
    return NextResponse.json({ error: "ceremony is required" }, { status: 400 })
  }

  const items = getSamagriList(ceremony, tradition ?? undefined)

  return NextResponse.json({ ceremony, tradition, items, count: items.length })
}
