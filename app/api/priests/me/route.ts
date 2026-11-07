export const dynamic = "force-dynamic"
import { NextResponse } from "next/server"
import { z } from "zod"
import { Prisma } from "@prisma/client"
import { prisma } from "@/lib/prisma"
import { getSessionUser } from "@/lib/supabase/get-session-user"
import { deriveFromOfferings, priestProfileSchema, windowSchema } from "@/lib/priest/schema"

export async function GET() {
  const user = await getSessionUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const priest = await prisma.priest.findUnique({
    where:   { userId: user.id },
    include: { ceremonyOfferings: true, availability: true, documents: { orderBy: { createdAt: "desc" } } },
  })
  return NextResponse.json({ priest, phone: user.phone })
}

const bodySchema = priestProfileSchema.extend({
  availability: z.array(windowSchema).min(1, "Choose at least one working day").max(7).refine((w) => new Set(w.map((x) => x.dayOfWeek)).size === w.length, "Duplicate weekday"),
})

export async function PUT(req: Request) {
  const user = await getSessionUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const priest = await prisma.priest.findUnique({ where: { userId: user.id } })
  if (!priest) return NextResponse.json({ error: "Priest profile not found" }, { status: 404 })

  const parsed = bodySchema.safeParse(await req.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ error: z.flattenError(parsed.error) }, { status: 422 })
  const d = parsed.data

  try {
    await prisma.$transaction([
      prisma.user.update({ where: { id: user.id }, data: { phone: d.phone } }),
      prisma.priest.update({
        where: { id: priest.id },
        data: {
          displayName:       d.displayName,
          bio:               d.bio,
          experienceYears:   d.experienceYears,
          tradition:         d.tradition,
          languages:         d.languages,
          serviceCities:     d.cities,
          templeAffiliation: d.templeAffiliation,
          ...deriveFromOfferings(d.offerings),
        },
      }),
      prisma.priestCeremony.deleteMany({ where: { priestId: priest.id } }),
      prisma.priestCeremony.createMany({
        data: d.offerings.map((o) => ({ priestId: priest.id, ceremonyType: o.type, price: o.price, samagriIncluded: o.samagriIncluded, notes: o.notes })),
      }),
      prisma.priestAvailability.deleteMany({ where: { priestId: priest.id } }),
      prisma.priestAvailability.createMany({ data: d.availability.map((w) => ({ ...w, priestId: priest.id })) }),
    ])
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
      return NextResponse.json({ error: "That phone number is already registered" }, { status: 409 })
    }
    throw err
  }

  return NextResponse.json({ priestId: priest.id })
}
