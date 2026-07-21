import Link from "next/link"
import { MapPin, Shield, Star, Clock, ChevronRight, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Navbar } from "@/components/shared/navbar"
import { Footer } from "@/components/shared/footer"
import { Reveal } from "@/components/shared/reveal"
import { Divider } from "@/components/shared/divider"
import { Stamp } from "@/components/shared/stamp"
import { CEREMONIES, CITIES } from "@/lib/constants"
import type { CeremonyType, City } from "@/types"

const FEATURED_CEREMONIES: CeremonyType[] = [
  "GRIHA_PRAVESH",
  "SATYANARAYAN_PUJA",
  "NAMAKARANA",
  "UPANAYANAM",
  "SEEMANTHAM",
  "ANNAPRASHANA",
]

const FEATURED_CITIES: City[] = ["CHENNAI", "BANGALORE", "HYDERABAD", "COCHIN", "AMARAVATI"]

const TRUST_POINTS = [
  { icon: Shield, title: "Aadhaar Verified", desc: "Every priest is identity-verified before onboarding" },
  { icon: Star, title: "Family Reviews", desc: "Real reviews from families, with ceremony photos" },
  { icon: Clock, title: "On-Time Guarantee", desc: "Priest cancellation? We find a replacement within 2 hours" },
  { icon: MapPin, title: "Tradition Matched", desc: "Sampradaya and language matched to your family" },
]

const HOW_IT_WORKS = [
  { step: "01", title: "Choose your ceremony", desc: "Pick from 6 ceremony types across all South Indian traditions" },
  { step: "02", title: "Find your priest", desc: "Filter by tradition, language, rating, and availability" },
  { step: "03", title: "Book & confirm", desc: "Pay a 30% deposit — balance paid directly to priest on the day" },
  { step: "04", title: "Ceremony day", desc: "Priest arrives prepared with your family details. You just be present." },
]

const TESTIMONIALS = [
  {
    name: "Priya Subramaniam",
    city: "Chennai",
    ceremony: "Griha Pravesh",
    rating: 5,
    body: "Pandit Venkatesh arrived 15 minutes early with all the samagri. The puja was conducted beautifully in Tamil with Sanskrit shlokas. Our family was deeply moved.",
    tradition: "Iyer (Smartha)",
  },
  {
    name: "Ramesh Naidu",
    city: "Hyderabad",
    ceremony: "Upanayanam",
    rating: 5,
    body: "The entire Upanayanam was flawless. The priest took time to explain each ritual to my son in Telugu. Archanai made a complex ceremony feel effortless.",
    tradition: "Telugu Vaidiki",
  },
  {
    name: "Anitha Krishnaswamy",
    city: "Bangalore",
    ceremony: "Namakarana",
    rating: 5,
    body: "Booking was so easy. The priest received all our family details in advance — no scrambling on the day. Will definitely use Archanai again.",
    tradition: "Iyengar (Sri Vaishnava)",
  },
]

const TODAYS_REGISTER = [
  { ceremony: "Griha Pravesh", city: "Chennai", date: "14 Feb" },
  { ceremony: "Upanayanam", city: "Hyderabad", date: "22 Feb" },
  { ceremony: "Satyanarayan Puja", city: "Bangalore", date: "27 Feb" },
  { ceremony: "Namakarana", city: "Cochin", date: "03 Mar" },
]

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-full">
      <Navbar />

      {/* Hero — a ledger spread, not a brochure cover */}
      <section className="relative bg-background">
        <div aria-hidden className="paper-grain pointer-events-none absolute inset-0" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-16 pb-20 grid lg:grid-cols-[1.15fr_0.85fr] gap-12 lg:gap-16 items-start">

          {/* Left — title page */}
          <Reveal>
            <p className="font-mono tabular text-xs tracking-[0.2em] uppercase text-muted-foreground mb-5">
              Archanai · Register of Ceremonies · Est. South India
            </p>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.05] mb-6">
              Book a trusted priest{" "}
              <span className="text-primary">for every ceremony</span>
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed mb-8 max-w-xl">
              Verified Hindu priests across Chennai, Bangalore, Hyderabad, Cochin and Amaravati.
              Tradition-matched, transparent pricing, and always prepared.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 mb-8">
              <Button size="lg" className="h-12 text-base" asChild>
                <Link href="/browse">
                  Find a Priest <ChevronRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="h-12 text-base" asChild>
                <Link href="/priest/register">Join as Priest</Link>
              </Button>
            </div>

            <div className="flex flex-wrap gap-x-5 gap-y-2 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-verdigris" /> 125+ verified priests</span>
              <span className="flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-verdigris" /> 6 ceremony types</span>
              <span className="flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-verdigris" /> 5 cities</span>
              <span className="flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-verdigris" /> Samagri included</span>
            </div>
          </Reveal>

          {/* Right — today's register */}
          <Reveal delay={120}>
            <div className="border border-border bg-card">
              <div className="flex items-center justify-between px-5 py-3 border-b border-border">
                <span className="font-heading font-semibold text-sm">Today&apos;s register</span>
                <Stamp tone="verdigris" className="text-[9px] px-2 py-0.5">Live</Stamp>
              </div>
              <div>
                {TODAYS_REGISTER.map((entry, i) => (
                  <div
                    key={entry.ceremony + entry.city}
                    className={`flex items-center justify-between px-5 py-3.5 ${i !== TODAYS_REGISTER.length - 1 ? "border-b border-dashed border-border" : ""}`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{entry.ceremony}</p>
                        <p className="text-xs text-muted-foreground">{entry.city}</p>
                      </div>
                    </div>
                    <span className="font-mono tabular text-xs text-muted-foreground shrink-0 ml-3">{entry.date}</span>
                  </div>
                ))}
              </div>
              <div className="px-5 py-3 border-t border-border">
                <Link href="/browse" className="text-xs text-primary hover:underline font-medium">
                  View the full register →
                </Link>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <Divider />

      {/* Ceremonies */}
      <section className="py-16 bg-background">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Reveal className="mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-2">Browse by ceremony</h2>
            <p className="text-muted-foreground">6 ceremonies covering major life events and occasions</p>
          </Reveal>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {FEATURED_CEREMONIES.map((type, i) => {
              const c = CEREMONIES[type]
              return (
                <Reveal key={type} delay={i * 60}>
                  <Link
                    href={`/browse?ceremony=${type}`}
                    className="group flex flex-col items-center gap-2 border border-border bg-card p-4 text-center hover:border-verdigris transition-colors"
                  >
                    <span className="text-3xl">{c.emoji}</span>
                    <span className="text-sm font-medium leading-snug group-hover:text-primary transition-colors">
                      {c.label}
                    </span>
                    <span className="font-mono tabular text-xs text-muted-foreground">
                      {Math.round(c.durationMin / 60)}–{Math.round(c.durationMax / 60)}h
                    </span>
                  </Link>
                </Reveal>
              )
            })}
          </div>
        </div>
      </section>

      {/* Cities */}
      <section className="py-16 bg-secondary/60">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Reveal className="mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-2">Available in your city</h2>
            <p className="text-muted-foreground">Serving families across South India</p>
          </Reveal>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {FEATURED_CITIES.map((city, i) => {
              const c = CITIES[city]
              return (
                <Reveal key={city} delay={i * 60}>
                  <Link
                    href={`/browse?city=${city}`}
                    className="group flex flex-col gap-1 border border-border bg-card p-4 hover:border-verdigris transition-colors"
                  >
                    <MapPin className="h-4 w-4 text-primary mb-1" />
                    <span className="font-medium text-sm group-hover:text-primary transition-colors">{c.label}</span>
                    <span className="text-xs text-muted-foreground">{c.state}</span>
                  </Link>
                </Reveal>
              )
            })}
          </div>
        </div>
      </section>

      {/* How it works — a real sequence, numbered like ledger entries */}
      <section className="py-20 bg-background">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Reveal className="mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-2">How Archanai works</h2>
            <p className="text-muted-foreground">Book your priest in under 5 minutes</p>
          </Reveal>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4">
            {HOW_IT_WORKS.map((step, i) => (
              <Reveal
                key={step.step}
                delay={i * 80}
                className={`flex flex-col gap-2 py-4 lg:py-0 lg:px-6 ${i !== 0 ? "lg:border-l border-border" : ""}`}
              >
                <span className="font-mono tabular text-sm text-primary">{step.step}</span>
                <h3 className="font-heading font-semibold">{step.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{step.desc}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Trust */}
      <section className="py-20 bg-secondary/60">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Reveal className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-2">Why families trust Archanai</h2>
            <p className="text-muted-foreground">Every ceremony is sacred. We treat it that way.</p>
          </Reveal>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {TRUST_POINTS.map((point, i) => (
              <Reveal key={point.title} delay={i * 80}>
                <Card className="border-border shadow-none hover:border-verdigris transition-colors">
                  <CardContent className="pt-6 flex flex-col gap-3">
                    <div className="h-10 w-10 rounded-full border-2 border-verdigris flex items-center justify-center">
                      <point.icon className="h-4.5 w-4.5 text-verdigris" />
                    </div>
                    <h3 className="font-heading font-semibold text-sm">{point.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{point.desc}</p>
                  </CardContent>
                </Card>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-background">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Reveal className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-2">Families love Archanai</h2>
            <p className="text-muted-foreground">Real reviews from real ceremonies</p>
          </Reveal>
          <div className="grid sm:grid-cols-3 gap-4">
            {TESTIMONIALS.map((t, i) => (
              <Reveal key={t.name} delay={i * 100}>
                <Card className="border-border shadow-none hover:border-verdigris transition-colors">
                  <CardContent className="pt-6 flex flex-col gap-4">
                    <div className="flex gap-0.5">
                      {Array.from({ length: t.rating }).map((_, j) => (
                        <Star key={j} className="h-4 w-4 fill-primary text-primary" />
                      ))}
                    </div>
                    <p className="text-sm leading-relaxed text-foreground/80">&ldquo;{t.body}&rdquo;</p>
                    <div className="flex items-center gap-3 pt-3 border-t border-dashed border-border">
                      <div className="h-8 w-8 border-2 border-primary flex items-center justify-center text-sm font-heading font-semibold text-primary shrink-0">
                        {t.name[0]}
                      </div>
                      <div>
                        <p className="text-sm font-medium">{t.name}</p>
                        <p className="font-mono tabular text-xs text-muted-foreground">{t.ceremony} · {t.city}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Samagri section */}
      <section className="py-16 bg-secondary/60">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <Reveal>
              <p className="font-mono tabular text-xs tracking-[0.2em] uppercase text-muted-foreground mb-3">Samagri made easy</p>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-4">
                All ritual materials, sorted
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-6">
                Choose how you want to handle samagri. We generate a region-specific, tradition-aware checklist for every ceremony.
              </p>
              <div className="space-y-4">
                <div className="flex gap-3">
                  <div className="h-8 w-8 border-2 border-primary flex items-center justify-center shrink-0 font-mono tabular text-sm font-bold text-primary">
                    A
                  </div>
                  <div>
                    <p className="font-medium text-sm">Priest-arranged</p>
                    <p className="text-sm text-muted-foreground">Priest sources all materials, bundled into the price. You just open the door.</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="h-8 w-8 border-2 border-primary flex items-center justify-center shrink-0 font-mono tabular text-sm font-bold text-primary">
                    B
                  </div>
                  <div>
                    <p className="font-medium text-sm">Self-arranged with checklist</p>
                    <p className="text-sm text-muted-foreground">Get a precise samagri checklist after booking — ceremony + tradition specific. Shop at your local store.</p>
                  </div>
                </div>
              </div>
            </Reveal>
            <Reveal delay={150} className="grid grid-cols-2 gap-3">
              {(["GRIHA_PRAVESH", "SATYANARAYAN_PUJA", "UPANAYANAM", "SEEMANTHAM"] as CeremonyType[]).map((type) => {
                const c = CEREMONIES[type]
                return (
                  <div key={type} className="border border-border bg-card p-4 hover:border-verdigris transition-colors">
                    <span className="text-2xl">{c.emoji}</span>
                    <p className="font-medium text-sm mt-2">{c.label}</p>
                    <p className="text-xs text-muted-foreground mt-1">Checklist available</p>
                  </div>
                )
              })}
            </Reveal>
          </div>
        </div>
      </section>

      {/* CTA for priests */}
      <section className="py-20 bg-primary text-primary-foreground">
        <Reveal className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center flex flex-col items-center">
          <Stamp className="mb-6 border-primary-foreground text-primary-foreground">Founding Priest</Stamp>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-3">
            Are you a priest?
          </h2>
          <p className="text-primary-foreground/80 mb-6 max-w-xl mx-auto leading-relaxed">
            Join as a Founding Priest — zero commission for your first 3 months, a permanent badge on your profile, and access to hundreds of families in your city.
          </p>
          <Button size="lg" variant="secondary" asChild>
            <Link href="/priest/register">
              Join Archanai as a Priest <ChevronRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
        </Reveal>
      </section>

      <Footer />
    </div>
  )
}
