import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { BookingWizard, type BookingPrefill } from "@/components/consumer/booking-wizard"
import { getSessionUser } from "@/lib/supabase/get-session-user"
import type { CeremonyType, City, Tradition } from "@/types"

export const metadata = { title: "Book a Priest" }

export default async function BookPage({
  searchParams,
}: {
  searchParams: Promise<{ priestId?: string; ceremony?: string }>
}) {
  const [params, user] = await Promise.all([searchParams, getSessionUser()])

  if (!user) {
    const qs = new URLSearchParams()
    if (params.priestId) qs.set("priestId", params.priestId)
    if (params.ceremony) qs.set("ceremony", params.ceremony)
    redirect(`/login?redirect=${encodeURIComponent(`/book?${qs}`)}`)
  }
  if (!params.priestId) redirect("/browse")

  const [priest, last] = await Promise.all([
    prisma.priest.findFirst({
      where:  { id: params.priestId, isActive: true, verificationStatus: "VERIFIED" },
      select: {
        id: true, displayName: true, tradition: true, rating: true, reviewCount: true,
        serviceCities: true, ceremonies: true, priceRangeMin: true,
        ceremonyOfferings: { select: { ceremonyType: true, price: true, samagriIncluded: true } },
      },
    }),
    // Saves families retyping everything for a second ceremony.
    prisma.booking.findFirst({ where: { consumerId: user.id }, orderBy: { createdAt: "desc" } }),
  ])
  if (!priest) redirect("/browse")

  const offerings = priest.ceremonyOfferings.length
    ? priest.ceremonyOfferings.map((o) => ({ type: o.ceremonyType as CeremonyType, price: o.price, samagriIncluded: o.samagriIncluded }))
    : priest.ceremonies.map((c) => ({ type: c as CeremonyType, price: priest.priceRangeMin, samagriIncluded: false })) // legacy rows

  const fam = (last?.familyDetails ?? {}) as NonNullable<BookingPrefill["family"]>
  const prefill: BookingPrefill = last
    ? {
        contactPhone: last.contactPhone ?? user.phone ?? undefined,
        city: last.city as City, addressLine1: last.addressLine1, addressLine2: last.addressLine2 ?? undefined, pincode: last.pincode,
        family: { ...fam, notes: undefined },
      }
    : { contactPhone: user.phone ?? undefined, family: { primaryName: user.name === "User" ? "" : user.name } }

  return (
    <div className="flex-1 bg-muted/30">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-10">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold tracking-tight">Book a Priest</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Complete the details below — {priest.displayName} will be notified immediately.
          </p>
        </div>
        <BookingWizard
          priest={{
            id: priest.id, displayName: priest.displayName, tradition: priest.tradition as Tradition,
            rating: priest.rating, reviewCount: priest.reviewCount,
            serviceCities: priest.serviceCities as City[], offerings,
          }}
          initialCeremony={params.ceremony}
          prefill={prefill}
        />
      </div>
    </div>
  )
}
