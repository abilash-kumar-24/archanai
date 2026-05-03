import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { BookingWizard } from "@/components/consumer/booking-wizard"
import { getSessionUser } from "@/lib/supabase/get-session-user"
import type { Tradition } from "@/types"

export const metadata = { title: "Book a Priest" }

export default async function BookPage({
  searchParams,
}: {
  searchParams: Promise<{ priestId?: string; ceremony?: string }>
}) {
  const [params, user] = await Promise.all([
    searchParams,
    getSessionUser(),
  ])

  if (!user) {
    redirect(`/login?redirect=/book${params.priestId ? `?priestId=${params.priestId}` : ""}`)
  }

  if (!params.priestId) {
    redirect("/browse")
  }

  const priest = await prisma.priest.findUnique({
    where:  { id: params.priestId, isActive: true, verificationStatus: "VERIFIED" },
    select: {
      id:            true,
      displayName:   true,
      tradition:     true,
      priceRangeMin: true,
      priceRangeMax: true,
      rating:        true,
      reviewCount:   true,
    },
  })

  if (!priest) {
    redirect("/browse")
  }

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
          priest={{ ...priest, tradition: priest.tradition as Tradition }}
          initialCeremony={params.ceremony}
        />
      </div>
    </div>
  )
}
