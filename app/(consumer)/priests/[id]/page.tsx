import Link from "next/link"
import { notFound } from "next/navigation"
import { Star, MapPin, Shield, Clock, ChevronRight, Check } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Stamp } from "@/components/shared/stamp"
import { TRADITIONS, LANGUAGES, CEREMONIES, CITIES } from "@/lib/constants"
import { formatINR } from "@/lib/utils/booking"
import { prisma } from "@/lib/prisma"
import type { CeremonyType, City, Language, Tradition } from "@/types"

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const priest = await prisma.priest.findUnique({ where: { id }, select: { displayName: true } })
  return { title: priest?.displayName ?? "Priest Profile" }
}

export default async function PriestProfilePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const [priest, reviews] = await Promise.all([
    prisma.priest.findUnique({
      where: { id, isActive: true },
      select: {
        id:               true,
        displayName:      true,
        bio:              true,
        photoUrl:         true,
        tradition:        true,
        languages:        true,
        ceremonies:       true,
        serviceCities:    true,
        experienceYears:  true,
        ceremoniesCount:  true,
        priceRangeMin:    true,
        priceRangeMax:    true,
        travelFeePerKm:   true,
        templeAffiliation:true,
        aadhaarVerified:  true,
        foundingPriest:   true,
        rating:           true,
        reviewCount:      true,
        verificationStatus: true,
      },
    }),
    prisma.review.findMany({
      where:   { priestId: id, isVerified: true },
      include: { consumer: { select: { name: true } }, booking: { include: { ceremony: true } } },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
  ])

  if (!priest) notFound()

  const initials = priest.displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()

  return (
    <div className="flex-1 bg-background">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1 text-xs text-muted-foreground mb-6">
          <Link href="/" className="hover:text-foreground">Home</Link>
          <ChevronRight className="h-3 w-3" />
          <Link href="/browse" className="hover:text-foreground">Browse Priests</Link>
          <ChevronRight className="h-3 w-3" />
          <span className="text-foreground">{priest.displayName}</span>
        </nav>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main column */}
          <div className="lg:col-span-2 space-y-8">
            {/* Profile header */}
            <div className="flex gap-5 items-start">
              <div className="relative shrink-0">
                <Avatar className="h-24 w-24 rounded-none border border-border">
                  <AvatarImage src={priest.photoUrl ?? ""} />
                  <AvatarFallback className="rounded-none bg-secondary text-primary font-heading font-bold text-2xl">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                {priest.aadhaarVerified && (
                  <div className="absolute -bottom-1.5 -right-1.5 h-6 w-6 rounded-full bg-card border-2 border-primary flex items-center justify-center">
                    <Shield className="h-3 w-3 text-primary" />
                  </div>
                )}
              </div>

              <div className="flex-1">
                <div className="flex items-start gap-2 flex-wrap">
                  <h1 className="text-xl font-heading font-semibold">{priest.displayName}</h1>
                  {priest.foundingPriest && (
                    <Stamp className="text-[10px]">Founding Priest</Stamp>
                  )}
                </div>
                <p className="text-sm text-muted-foreground mt-0.5">
                  {TRADITIONS[priest.tradition as Tradition]?.label}
                </p>
                {priest.templeAffiliation && (
                  <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
                    🛕 {priest.templeAffiliation}
                  </p>
                )}
                <div className="flex flex-wrap items-center gap-3 mt-3">
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-primary text-primary" />
                    <span className="text-sm font-medium">{priest.rating.toFixed(1)}</span>
                    <span className="text-xs text-muted-foreground">({priest.reviewCount} reviews)</span>
                  </div>
                  <Separator orientation="vertical" className="h-4" />
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Clock className="h-3.5 w-3.5" />
                    {priest.experienceYears} years experience
                  </div>
                  <Separator orientation="vertical" className="h-4" />
                  <span className="text-sm text-muted-foreground">{priest.ceremoniesCount}+ ceremonies</span>
                </div>
              </div>
            </div>

            {/* Bio */}
            {priest.bio && (
              <div>
                <h2 className="font-heading font-semibold mb-3">About</h2>
                <p className="text-sm text-muted-foreground leading-relaxed">{priest.bio}</p>
              </div>
            )}

            <Separator />

            {/* Ceremonies */}
            <div>
              <h2 className="font-heading font-semibold mb-4">Ceremonies offered</h2>
              <div className="grid sm:grid-cols-2 gap-3">
                {(priest.ceremonies as CeremonyType[]).map((c) => {
                  const ceremony = CEREMONIES[c]
                  return (
                    <div key={c} className="flex items-center gap-3 border border-border p-3">
                      <span className="text-2xl">{ceremony.emoji}</span>
                      <div>
                        <p className="text-sm font-medium">{ceremony.label}</p>
                        <p className="font-mono tabular text-xs text-muted-foreground">
                          {Math.round(ceremony.durationMin / 60)}–{Math.round(ceremony.durationMax / 60)} hours
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            <Separator />

            {/* Languages */}
            <div>
              <h2 className="font-heading font-semibold mb-3">Languages</h2>
              <div className="flex flex-wrap gap-2">
                {(priest.languages as Language[]).map((l) => (
                  <Badge key={l} variant="secondary" className="text-sm rounded-none">
                    {LANGUAGES[l]}
                  </Badge>
                ))}
              </div>
            </div>

            <Separator />

            {/* Service areas */}
            <div>
              <h2 className="font-heading font-semibold mb-3">Service areas</h2>
              <div className="flex flex-wrap gap-4">
                {(priest.serviceCities as City[]).map((c) => (
                  <div key={c} className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <MapPin className="h-3.5 w-3.5" />
                    {CITIES[c]?.label}, {CITIES[c]?.state}
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            {/* Reviews */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-heading font-semibold">Reviews</h2>
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-primary text-primary" />
                  <span className="font-mono tabular font-semibold">{priest.rating.toFixed(1)}</span>
                  <span className="text-sm text-muted-foreground">· {priest.reviewCount} reviews</span>
                </div>
              </div>

              {reviews.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No reviews yet — be the first to book and leave a review.
                </p>
              ) : (
                <div className="space-y-4">
                  {reviews.map((review) => (
                    <div key={review.id} className="border border-border p-4">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2">
                          <div className="h-8 w-8 border-2 border-primary flex items-center justify-center text-xs font-heading font-medium text-primary">
                            {review.consumer.name[0]}
                          </div>
                          <div>
                            <p className="text-sm font-medium">{review.consumer.name}</p>
                            <p className="text-xs text-muted-foreground">{review.booking.ceremony.name}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-0.5">
                          {Array.from({ length: review.rating }).map((_, i) => (
                            <Star key={i} className="h-3.5 w-3.5 fill-primary text-primary" />
                          ))}
                        </div>
                      </div>
                      {review.body && (
                        <p className="text-sm text-muted-foreground leading-relaxed">{review.body}</p>
                      )}
                      <p className="text-xs text-muted-foreground mt-2">
                        {new Date(review.createdAt).toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" })}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Booking sidebar */}
          <aside className="lg:col-span-1">
            <div className="sticky top-24">
              <Card className="border-border shadow-none">
                <CardContent className="p-5 space-y-5">
                  <div>
                    <p className="text-xs text-muted-foreground">Suggested contribution</p>
                    <p className="font-mono tabular text-2xl font-bold text-primary mt-0.5">
                      {formatINR(priest.priceRangeMin)} – {formatINR(priest.priceRangeMax)}
                    </p>
                    <p className="text-xs text-muted-foreground">Paid directly to priest on ceremony day</p>
                  </div>

                  <div className="space-y-2">
                    {[
                      "No platform fee — 100% free",
                      "Priest notified immediately",
                      "Confirmation via WhatsApp",
                      "Samagri checklist included",
                    ].map((point) => (
                      <div key={point} className="flex items-center gap-2 text-sm">
                        <Check className="h-4 w-4 text-primary shrink-0" />
                        <span>{point}</span>
                      </div>
                    ))}
                  </div>

                  <Button className="w-full" size="lg" asChild>
                    <Link href={`/book?priestId=${priest.id}`}>
                      Book {priest.displayName.split(" ")[0]}
                    </Link>
                  </Button>

                  <p className="text-xs text-center text-muted-foreground">
                    Free cancellation up to 7 days before ceremony
                  </p>

                  <Separator />

                  <div className="grid grid-cols-2 gap-3 text-center">
                    <div className="border border-border p-3">
                      <p className="font-mono tabular font-semibold text-lg">{priest.ceremoniesCount}+</p>
                      <p className="text-xs text-muted-foreground">Ceremonies</p>
                    </div>
                    <div className="border border-border p-3">
                      <p className="font-mono tabular font-semibold text-lg">{priest.experienceYears}yr</p>
                      <p className="text-xs text-muted-foreground">Experience</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}
