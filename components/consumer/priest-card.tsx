import Link from "next/link"
import { Star, MapPin, Shield } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { FlameBadge } from "@/components/shared/flame-badge"
import { TRADITIONS, LANGUAGES, CEREMONIES, CITIES } from "@/lib/constants"
import { formatINR } from "@/lib/utils/booking"
import type { PriestProfile } from "@/types"

interface PriestCardProps {
  priest: PriestProfile & { city?: string }
}

export function PriestCard({ priest }: PriestCardProps) {
  const initials = priest.displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()

  return (
    <Card className="border-border shadow-none hover:border-primary/50 hover:shadow-md transition-all group">
      <CardContent className="p-5">
        <div className="flex gap-4">
          {/* Avatar */}
          <div className="relative shrink-0">
            <Avatar className="h-16 w-16 rounded-xl">
              <AvatarImage src={priest.photoUrl ?? ""} alt={priest.displayName} />
              <AvatarFallback className="rounded-xl bg-secondary text-primary font-heading font-semibold text-lg">
                {initials}
              </AvatarFallback>
            </Avatar>
            {priest.aadhaarVerified && (
              <div className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full bg-primary flex items-center justify-center">
                <Shield className="h-3 w-3 text-primary-foreground" />
              </div>
            )}
          </div>

          {/* Details */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="font-heading font-semibold text-sm leading-tight group-hover:text-primary transition-colors">
                  {priest.displayName}
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {TRADITIONS[priest.tradition]?.label}
                </p>
              </div>
              {priest.foundingPriest && (
                <FlameBadge className="text-[9px] px-2 py-0.5 shrink-0">Founding</FlameBadge>
              )}
            </div>

            {/* Rating */}
            <div className="flex items-center gap-1.5 mt-2">
              <Star className="h-3.5 w-3.5 fill-primary text-primary" />
              <span className="font-mono tabular text-xs font-medium">{priest.rating.toFixed(1)}</span>
              <span className="text-xs text-muted-foreground">({priest.reviewCount} reviews)</span>
              <span className="text-muted-foreground">·</span>
              <span className="font-mono tabular text-xs text-muted-foreground">{priest.experienceYears}y exp</span>
            </div>

            {/* Languages */}
            <div className="flex flex-wrap gap-1 mt-2">
              {priest.languages.slice(0, 3).map((lang) => (
                <Badge key={lang} variant="outline" className="text-xs px-1.5 py-0 h-5 border-border">
                  {LANGUAGES[lang]}
                </Badge>
              ))}
            </div>
          </div>
        </div>

        {/* Ceremonies */}
        <div className="mt-3 flex flex-wrap gap-1">
          {priest.ceremonies.slice(0, 4).map((c) => (
            <span key={c} className="text-xs text-muted-foreground bg-muted rounded-md px-2 py-0.5">
              {CEREMONIES[c].emoji} {CEREMONIES[c].label}
            </span>
          ))}
          {priest.ceremonies.length > 4 && (
            <span className="text-xs text-muted-foreground bg-muted rounded-md px-2 py-0.5">
              +{priest.ceremonies.length - 4} more
            </span>
          )}
        </div>

        {/* Cities served */}
        <div className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
          <MapPin className="h-3 w-3 shrink-0" />
          <span>{priest.serviceCities.map((c) => CITIES[c]?.label).join(", ")}</span>
        </div>

        {/* Price + CTA */}
        <div className="mt-4 flex items-center justify-between gap-3 pt-3 border-t border-border">
          <div>
            <p className="text-xs text-muted-foreground">Starting from</p>
            <p className="font-mono tabular font-bold text-sm text-primary">
              {formatINR(priest.priceRangeMin)}
            </p>
          </div>
          <Button size="sm" asChild>
            <Link href={`/priests/${priest.id}`}>View Profile</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
