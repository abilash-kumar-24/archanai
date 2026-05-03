export const dynamic = "force-dynamic"
import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import type { City, CeremonyType, Tradition, Language } from "@/types"

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const city       = searchParams.get("city")      as City | null
  const ceremony   = searchParams.get("ceremony")  as CeremonyType | null
  const tradition  = searchParams.get("tradition") as Tradition | null
  const language   = searchParams.get("language")  as Language | null
  const minRating  = searchParams.get("minRating")
  const maxPrice   = searchParams.get("maxPrice")
  const page       = parseInt(searchParams.get("page") ?? "1", 10)
  const limit      = Math.min(parseInt(searchParams.get("limit") ?? "20", 10), 50)

  try {
    const where: Record<string, unknown> = {
      isActive: true,
      verificationStatus: "VERIFIED",
    }

    if (city)      where.serviceCities = { has: city }
    if (ceremony)  where.ceremonies    = { has: ceremony }
    if (tradition) where.tradition     = tradition
    if (language)  where.languages     = { has: language }
    if (minRating) where.rating        = { gte: parseFloat(minRating) }
    if (maxPrice)  where.priceRangeMin = { lte: parseInt(maxPrice, 10) }

    const [priests, total] = await Promise.all([
      prisma.priest.findMany({
        where,
        select: {
          id: true,
          displayName: true,
          photoUrl: true,
          tradition: true,
          languages: true,
          ceremonies: true,
          serviceCities: true,
          experienceYears: true,
          ceremoniesCount: true,
          priceRangeMin: true,
          priceRangeMax: true,
          templeAffiliation: true,
          aadhaarVerified: true,
          foundingPriest: true,
          rating: true,
          reviewCount: true,
        },
        orderBy: [{ foundingPriest: "desc" }, { rating: "desc" }],
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.priest.count({ where }),
    ])

    return NextResponse.json({ priests, total, page, limit })
  } catch (err) {
    console.error("[priests GET]", err)
    return NextResponse.json({ error: "Failed to fetch priests" }, { status: 500 })
  }
}
