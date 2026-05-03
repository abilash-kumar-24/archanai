import Link from "next/link"
import { Button } from "@/components/ui/button"

export const metadata = {
  title: "FAQ",
  description: "Frequently asked questions about booking priests through Archanai.",
}

const FAQS: { q: string; a: string }[] = [
  {
    q: "How does Archanai find and verify priests?",
    a: "Every priest on Archanai goes through a manual verification process: Aadhaar ID check, tradition and sampradaya review, and a reference call before their profile goes live. We also review their first 3 bookings to ensure quality.",
  },
  {
    q: "What is the 30% deposit? Is it refundable?",
    a: "The deposit is a commitment from both sides. Families pay 30% of the agreed contribution online at the time of booking. The balance is paid directly to the priest on ceremony day. If you cancel more than 7 days before the ceremony, the deposit is fully refunded. Cancellations within 7 days are subject to a 50% retention fee.",
  },
  {
    q: "How does tradition-matching work?",
    a: "Each priest lists their sampradaya (e.g. Iyer Smartha, Iyengar Sri Vaishnava, Telugu Vaidiki, Namboodiri) when registering. When you filter priests by tradition, you only see those who follow the same sampradaya as your family. This ensures the correct Agamic or Vedic procedures are followed.",
  },
  {
    q: "What happens if the priest cancels?",
    a: "If a priest cancels within 48 hours of the ceremony, Archanai will work to find a replacement priest of the same tradition within 2 hours. If no suitable replacement is found, you receive a full refund of your deposit.",
  },
  {
    q: "What is included in the samagri?",
    a: "When you choose 'Priest-arranged samagri', the priest sources all required ritual materials and the cost is bundled into the agreed contribution. If you choose 'Self-arranged', we send you a ceremony-specific and tradition-aware checklist after booking so you can purchase the items yourself from your local shop.",
  },
  {
    q: "Can I book for a date that's far in advance?",
    a: "Yes. You can book up to 6 months in advance. This is especially useful for Upanayanam and Seemantham ceremonies which are tied to specific muhurtam dates. The priest will confirm availability when they accept the booking.",
  },
  {
    q: "What languages do priests offer ceremonies in?",
    a: "Each priest lists the languages they conduct ceremonies in. Most South Indian Vedic ceremonies are primarily in Sanskrit, but the priest will explain and guide your family in your regional language (Tamil, Telugu, Kannada, or Malayalam).",
  },
  {
    q: "How is the platform fee calculated?",
    a: "Archanai charges 12% of the deposit amount as a platform fee. This is already factored into the deposit you pay — there are no hidden charges. The balance paid to the priest on ceremony day has no platform deduction.",
  },
  {
    q: "Can a priest decline my booking?",
    a: "Yes. Priests review booking requests and may decline if they're unavailable on the date or if the ceremony type isn't a good fit. You'll be notified via WhatsApp within 24 hours, and your deposit hold is released if declined.",
  },
  {
    q: "I'm a priest. How do I join?",
    a: "Apply through our priest registration page. You'll complete a 4-step application covering your tradition, skills, service area, and identity documents. Our team reviews applications within 2–3 business days. Early applicants receive Founding Priest status — zero commission for the first 3 months.",
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
            Reach us on WhatsApp at <strong>+91 98765 43210</strong> or email{" "}
            <strong>support@archanai.in</strong>
          </p>
          <Button asChild variant="outline">
            <Link href="/browse">Browse Priests</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
