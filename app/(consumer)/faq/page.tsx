import Link from "next/link"
import { Button } from "@/components/ui/button"

export const metadata = {
  title: "FAQ",
  description: "Frequently asked questions about booking priests through Archanai.",
}

const FAQS: { q: string; a: string }[] = [
  {
    q: "How does Archanai find and verify priests?",
    a: "Every priest on Archanai goes through a manual verification process: a phone call to confirm their identity and background, tradition and sampradaya review, before their profile goes live.",
  },
  {
    q: "Do I pay anything through Archanai?",
    a: "No. Archanai never collects payment. You agree a contribution directly with the priest, and pay them in person on ceremony day — no deposit, no platform fee, no card details ever shared with us.",
  },
  {
    q: "How does tradition-matching work?",
    a: "Each priest lists their sampradaya (e.g. Iyer Smartha, Iyengar Sri Vaishnava, Telugu Vaidiki, Namboodiri) when registering. When you filter priests by tradition, you only see those who follow the same sampradaya as your family. This ensures the correct Agamic or Vedic procedures are followed.",
  },
  {
    q: "What happens if the priest cancels?",
    a: "You will be notified by email and can book another priest from the browse page. Since no payment is collected through the platform, there's nothing to refund.",
  },
  {
    q: "What is included in the samagri?",
    a: "When you choose 'Priest-arranged samagri', the priest brings the ritual materials; if there is any extra cost, you agree it directly with the priest. If you choose 'Self-arranged', we send you a ceremony-specific and tradition-aware checklist after booking so you can purchase the items yourself from your local shop.",
  },
  {
    q: "Can I book for a date that's far in advance?",
    a: "Yes. You can request a booking up to a year in advance. This is especially useful for Upanayanam and Seemantham ceremonies which are tied to specific muhurtam dates. The priest accepts or declines each request.",
  },
  {
    q: "What languages do priests offer ceremonies in?",
    a: "Each priest lists the languages they conduct ceremonies in. Most South Indian Vedic ceremonies are primarily in Sanskrit, and many priests also explain the rituals in a regional language. Check the languages listed on each priest's profile.",
  },
  {
    q: "Does Archanai charge a platform fee?",
    a: "No. Archanai is free for both families and priests — no commission, no listing fee, no platform deduction. We don't process any payment, so there's nothing for us to take a cut of.",
  },
  {
    q: "Can a priest decline my booking?",
    a: "Yes. Priests review booking requests and may decline if they're unavailable on the date or if the ceremony type isn't a good fit. Priests have 48 hours to respond. If a priest declines or does not reply, you are notified by email and can book someone else.",
  },
  {
    q: "I'm a priest. How do I join?",
    a: "Apply through our priest registration page. You'll complete a 4-step application covering your tradition, skills, and service area. Our team calls to verify your identity and background before your profile goes live, usually within 2–3 business days. Early applicants receive Founding Priest status — zero commission, ever.",
  },
]

export default function FaqPage() {
  return (
    <div className="flex-1 bg-background">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="mb-12 text-center">
          <h1 className="text-3xl font-semibold tracking-tight mb-3">Frequently asked questions</h1>
          <p className="text-muted-foreground">Everything you need to know about booking through Archanai.</p>
        </div>

        <div className="space-y-8">
          {FAQS.map((item) => (
            <div key={item.q} className="border-b border-border/60 pb-8 last:border-0 last:pb-0">
              <h3 className="font-semibold mb-3">{item.q}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{item.a}</p>
            </div>
          ))}
        </div>

        <div className="mt-16 rounded-2xl bg-accent/30 p-8 text-center">
          <h2 className="font-semibold mb-2">Still have questions?</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Email us at <strong>support@archanai.in</strong>
          </p>
          <Button asChild variant="outline">
            <Link href="/browse">Browse Priests</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
