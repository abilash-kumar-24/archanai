import { prisma } from "@/lib/prisma"
import { PriestCard } from "@/components/consumer/priest-card"
import { bookedKey, dayAvailable } from "@/lib/booking/availability"
import { parseDateOnly, todayIST } from "@/lib/dates"
import type { City, CeremonyType, Tradition, Language } from "@/types"

interface PriestGridProps {
  filters: {
    city?:      string
    ceremony?:  string
    tradition?: string
    language?:  string
    minRating?: string
    maxPrice?:  string
    sort?:      string
    date?:      string
    minExp?:    string
    gender?:    string
    samagri?:   string
    travel?:    string
  }
}

export async function PriestGrid({ filters }: PriestGridProps) {
  const where: Record<string, unknown> = {
    isActive:           true,
    verificationStatus: "VERIFIED",
  }

  if (filters.city)      where.serviceCities = { has: filters.city as City }
  if (filters.ceremony)  where.ceremonies    = { has: filters.ceremony as CeremonyType }
  if (filters.tradition) where.tradition     = filters.tradition as Tradition
  if (filters.language)  where.languages     = { has: filters.language as Language }
  if (filters.minRating) where.rating        = { gte: parseFloat(filters.minRating) }
  if (filters.minExp)    where.experienceYears = { gte: parseInt(filters.minExp, 10) || 0 }
  if (filters.gender === "MALE" || filters.gender === "FEMALE") where.gender = filters.gender
  if (filters.travel === "1") where.travelsOutsideCity = true
  if (filters.samagri === "1") {
    where.ceremonyOfferings = { some: { samagriIncluded: true, ...(filters.ceremony ? { ceremonyType: filters.ceremony as CeremonyType } : {}) } }
  }
  if (filters.maxPrice)  where.priceRangeMin = { lte: parseInt(filters.maxPrice, 10) }

  const priests = await prisma.priest.findMany({
    where,
    select: {
      id:               true,
      displayName:      true,
      photoUrl:         true,
      tradition:        true,
      languages:        true,
      ceremonies:       true,
      serviceCities:    true,
      experienceYears:  true,
      ceremoniesCount:  true,
      priceRangeMin:    true,
      priceRangeMax:    true,
      templeAffiliation:true,
      identityVerified:  true,
      foundingPriest:   true,
      rating:           true,
      reviewCount:      true,
      gender:           true,
      travelsOutsideCity: true,
    },
    orderBy:
      filters.sort === "price_asc"  ? [{ priceRangeMin: "asc" }] :
      filters.sort === "experience" ? [{ experienceYears: "desc" }] :
      [{ foundingPriest: "desc" }, { rating: "desc" }],
    take: 50,
  })

  // "Available on" filter: drop priests who are blocked, booked, or don't work that weekday.
  const day = filters.date && parseDateOnly(filters.date) ? filters.date : null
  let shown = priests
  if (day) {
    const dayDate = parseDateOnly(day)!
    const ids = priests.map((p) => p.id)
    const [windows, blocked, booked] = await Promise.all([
      prisma.priestAvailability.findMany({ where: { priestId: { in: ids } } }),
      prisma.blockedDate.findMany({ where: { priestId: { in: ids }, date: dayDate }, select: { priestId: true } }),
      prisma.booking.findMany({
        where: { priestId: { in: ids }, scheduledDate: dayDate, status: { in: ["PENDING", "CONFIRMED", "PRIEST_ACCEPTED"] } },
        select: { priestId: true, scheduledTime: true },
      }),
    ])
    const blockedIds = new Set(blocked.map((b) => b.priestId))
    shown = priests.filter((p) =>
      dayAvailable({
        day, today: todayIST(),
        windows: windows.filter((w) => w.priestId === p.id).map((w) => ({ dayOfWeek: w.dayOfWeek, startTime: w.startTime, endTime: w.endTime })),
        blocked: blockedIds.has(p.id) ? new Set([day]) : new Set(),
        booked: new Set(booked.filter((b) => b.priestId === p.id).map((b) => bookedKey(day, b.scheduledTime))),
      })
    )
  }

  if (shown.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <span className="text-4xl mb-4">🙏</span>
        <h3 className="font-semibold mb-2">No priests found</h3>
        <p className="text-sm text-muted-foreground max-w-xs">
          Try adjusting your filters — we&apos;re adding more priests across all cities every week.
        </p>
      </div>
    )
  }

  return (
    <div>
      <p className="text-sm text-muted-foreground mb-4">
        {shown.length} priest{shown.length !== 1 ? "s" : ""} found{day ? " available on that date" : ""}
      </p>
      <div className="grid sm:grid-cols-2 gap-4">
        {shown.map((priest) => (
          <PriestCard
            key={priest.id}
            priest={{
              ...priest,
              userId:             "",
              galleryUrls:        [],
              travelFeePerKm:     0,
              isActive:           true,
              verificationStatus: "VERIFIED",
              photoUrl:           priest.photoUrl ?? undefined,
              templeAffiliation:  priest.templeAffiliation ?? undefined,
            }}
          />
        ))}
      </div>
    </div>
  )
}
