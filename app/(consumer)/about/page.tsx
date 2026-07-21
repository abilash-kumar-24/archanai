import Link from "next/link"
import { Shield, Star, Clock, MapPin, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Flame } from "@/components/shared/flame"

export const metadata = {
  title: "About Archanai",
  description: "Learn about Archanai — South India's trusted platform for booking verified Hindu priests.",
}

const VALUES = [
  {
    icon: Shield,
    title: "Trust first",
    body: "Every priest is Aadhaar-verified and tradition-reviewed before going live. We don't compromise on who represents your family's ceremonies.",
  },
  {
    icon: Star,
    title: "Dignity for priests",
    body: "Priests set their own contribution ranges. We handle the logistics so they can focus on the ceremony — not on last-minute calls or payment hassles.",
  },
  {
    icon: Clock,
    title: "Transparency",
    body: "No hidden fees. The contribution range is shown upfront. The 30% deposit is a commitment from both sides — refundable up to 7 days before the ceremony.",
  },
  {
    icon: MapPin,
    title: "Tradition-matched",
    body: "A Namboodiri family deserves a Namboodiri priest. A Telugu Vaidiki ceremony deserves a Telugu-speaking pandit. We match by sampradaya, not just availability.",
  },
]

export default function AboutPage() {
  return (
    <div className="flex-1 bg-background">
      {/* Hero */}
      <section className="dusk-section py-20 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <Flame withBase glow className="h-16 w-auto mx-auto mb-6" />
          <h1 className="text-3xl sm:text-4xl font-semibold italic tracking-tight mb-4 text-[#f2ead9]">
            We exist to make sacred ceremonies simple
          </h1>
          <p className="text-[#f2ead9]/70 leading-relaxed text-lg">
            Archanai connects Hindu families across South India with verified, tradition-matched priests
            — making every ceremony as meaningful as it should be.
          </p>
        </div>
      </section>

      {/* The problem */}
      <section className="py-20 px-4">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-semibold tracking-tight mb-6">Why we built Archanai</h2>
          <div className="prose prose-sm max-w-none text-muted-foreground space-y-4 leading-relaxed">
            <p>
              Finding a priest for a Griha Pravesh or an Upanayanam in an Indian city today often means calling
              an uncle who knows someone who knows a pandit — and hoping he's available on your muhurtam date.
              If you've recently relocated from your hometown, you're starting from scratch.
            </p>
            <p>
              On the other side, many learned priests spend more time managing phone calls, chasing payments,
              and travelling without clarity than performing the ceremonies they trained decades to do.
            </p>
            <p>
              Archanai exists to fix both sides of that equation. Families find tradition-matched, verified
              priests in minutes. Priests get a structured calendar, confirmed bookings, and on-time deposits
              — so they can focus entirely on the ceremony.
            </p>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-16 bg-secondary/50 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-semibold tracking-tight mb-10 text-center">What we stand for</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {VALUES.map((v) => (
              <Card key={v.title} className="border-border shadow-none hover:shadow-md transition-shadow">
                <CardContent className="pt-6 flex flex-col gap-3">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <v.icon className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="font-heading font-semibold">{v.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{v.body}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Team note */}
      <section className="py-20 px-4">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-semibold tracking-tight mb-6">V1 — South India first</h2>
          <p className="text-muted-foreground leading-relaxed mb-4">
            We launched in Chennai, Bangalore, Hyderabad, Cochin, and Amaravati — five cities with
            deep, distinct Hindu traditions and large populations of families who've moved away
            from their ancestral towns.
          </p>
          <p className="text-muted-foreground leading-relaxed mb-8">
            We're starting small and doing it properly: manually verifying every priest, personally
            onboarding the first cohort as Founding Priests, and learning from each ceremony before
            we expand.
          </p>
          <Button asChild>
            <Link href="/browse">
              Find a Priest <ChevronRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>
    </div>
  )
}
