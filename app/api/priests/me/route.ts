import { NextResponse } from "next/server"
import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { getSessionUser } from "@/lib/supabase/get-session-user"
import type { Tradition, Language, CeremonyType, City } from "@prisma/client"

export async function GET() {
  const user = await getSessionUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const priest = await prisma.priest.findUnique({ where: { userId: user.id } })
  return NextResponse.json({ priest })
}

const bodySchema = z.object({
  displayName:       z.string().min(3),
  bio:               z.string().min(20),
  experienceYears:   z.number().int().min(1),
  tradition:         z.string(),
  languages:         z.array(z.string()),
  ceremonies:        z.array(z.string()),
  cities:            z.array(z.string()),
  priceRangeMin:     z.number().int().min(500),
  priceRangeMax:     z.number().int().min(500),
  travelFeePerKm:    z.number().int().min(0),
  templeAffiliation: z.string().optional(),
})

export async function PUT(req: Request) {
  const user = await getSessionUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const priest = await prisma.priest.findUnique({ where: { userId: user.id } })
  if (!priest) return NextResponse.json({ error: "Priest profile not found" }, { status: 404 })

  const body = await req.json()
  const parsed = bodySchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 })

  const d = parsed.data

  const updated = await prisma.priest.update({
    where: { id: priest.id },
    data: {
      displayName:       d.displayName,
      bio:               d.bio,
      experienceYears:   d.experienceYears,
      tradition:         d.tradition as Tradition,
      languages:         d.languages as Language[],
      ceremonies:        d.ceremonies as CeremonyType[],
      serviceCities:     d.cities as City[],
      priceRangeMin:     d.priceRangeMin,
      priceRangeMax:     d.priceRangeMax,
      travelFeePerKm:    d.travelFeePerKm,
      templeAffiliation: d.templeAffiliation,
    },
  })

  return NextResponse.json({ priestId: updated.id })
}
