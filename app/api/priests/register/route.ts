import { NextResponse } from "next/server"
import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { getSessionUser } from "@/lib/supabase/get-session-user"
import { supabaseAdmin } from "@/lib/supabase/admin"
import type { Tradition, Language, CeremonyType, City } from "@prisma/client"

const bodySchema = z.object({
  displayName:       z.string().min(3),
  bio:               z.string().min(50),
  experienceYears:   z.number().int().min(1).max(60),
  tradition:         z.string(),
  languages:         z.array(z.string()),
  ceremonies:        z.array(z.string()),
  cities:            z.array(z.string()),
  priceRangeMin:     z.number().int().min(500),
  priceRangeMax:     z.number().int().min(500),
  travelFeePerKm:    z.number().int().min(0).max(50).default(10),
  templeAffiliation: z.string().optional(),
})

export async function POST(req: Request) {
  const user = await getSessionUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const existing = await prisma.priest.findUnique({ where: { userId: user.id } })
  if (existing) return NextResponse.json({ error: "Priest profile already exists" }, { status: 409 })

  const body = await req.json()
  const parsed = bodySchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 })

  const d = parsed.data

  const priest = await prisma.priest.create({
    data: {
      userId:            user.id,
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
      foundingPriest:    true,
    },
  })

  // Update Supabase user_metadata so middleware allows /priest/* routes
  await supabaseAdmin.auth.admin.updateUserById(user.supabaseId, {
    user_metadata: { role: "PRIEST" },
  })

  // Update Prisma user role
  await prisma.user.update({ where: { id: user.id }, data: { role: "PRIEST" } })

  return NextResponse.json({ priestId: priest.id }, { status: 201 })
}
