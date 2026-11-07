export const dynamic = "force-dynamic"
import { NextResponse } from "next/server"
import { z } from "zod"
import { Prisma } from "@prisma/client"
import { prisma } from "@/lib/prisma"
import { getSessionUser } from "@/lib/supabase/get-session-user"
import { supabaseAdmin } from "@/lib/supabase/admin"
import { deriveFromOfferings, priestProfileSchema, DEFAULT_WINDOWS } from "@/lib/priest/schema"
import { sendAdminNewPriest } from "@/lib/resend/emails"
import { notify } from "@/lib/notify"
import { CITIES } from "@/lib/constants"

// Registration needs the same fields as the profile editor, minus the free-text extras.
const bodySchema = priestProfileSchema

export async function POST(req: Request) {
  const user = await getSessionUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const existing = await prisma.priest.findUnique({ where: { userId: user.id } })
  if (existing) return NextResponse.json({ error: "Priest profile already exists" }, { status: 409 })

  const parsed = bodySchema.safeParse(await req.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ error: z.flattenError(parsed.error) }, { status: 422 })
  const d = parsed.data

  let priest
  try {
    priest = await prisma.$transaction(async (tx) => {
      await tx.user.update({ where: { id: user.id }, data: { role: "PRIEST", phone: d.phone } })
      return tx.priest.create({
        data: {
          userId:            user.id,
          displayName:       d.displayName,
          bio:               d.bio,
          experienceYears:   d.experienceYears,
          tradition:         d.tradition,
          languages:         d.languages,
          serviceCities:     d.cities,
          templeAffiliation: d.templeAffiliation,
          foundingPriest:    true,
          ...deriveFromOfferings(d.offerings),
          ceremonyOfferings: { create: d.offerings.map((o) => ({ ceremonyType: o.type, price: o.price, samagriIncluded: o.samagriIncluded, notes: o.notes })) },
        },
      })
    })
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
      return NextResponse.json({ error: "That phone number is already registered" }, { status: 409 })
    }
    throw err
  }
  await prisma.priestAvailability.createMany({ data: DEFAULT_WINDOWS.map((w) => ({ ...w, priestId: priest.id })) })

  // app_metadata is service-role-only (user_metadata is user-editable), so the proxy can trust it
  await supabaseAdmin.auth.admin.updateUserById(user.supabaseId, { app_metadata: { role: "PRIEST" } })

  const admins = await prisma.user.findMany({ where: { role: "ADMIN" }, select: { id: true, email: true } })
  admins.forEach((a) => notify(a.id, { type: "PRIEST_APPLIED", title: "New priest application", body: d.displayName, href: "/admin/dashboard" }))
  sendAdminNewPriest(admins.map((a) => a.email), { name: d.displayName, city: d.cities.map((c) => CITIES[c].label).join(", ") }).catch(console.error)

  return NextResponse.json({ priestId: priest.id }, { status: 201 })
}
