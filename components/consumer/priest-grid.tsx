import { prisma } from "@/lib/prisma"
import { PriestCard } from "@/components/consumer/priest-card"
import type { City, CeremonyType, Tradition, Language } from "@/types"

interface PriestGridProps {
  filters: {
    city?:      string
    ceremony?:  string
    tradition?: string
    language?:  string
    minRating?: string
    maxPrice?:  string
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
      aadhaarVerified:  true,
      foundingPriest:   true,
      rating:           true,
      reviewCount:      true,
    },
    orderBy: [{ foundingPriest: "desc" }, { rating: "desc" }],
    take: 50,
  })

  if (priests.length === 0) {
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
        {priests.length} priest{priests.length !== 1 ? "s" : ""} found
      </p>
      <div className="grid sm:grid-cols-2 gap-4">
        {priests.map((priest) => (
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
