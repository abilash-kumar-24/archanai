export const metadata = {
  title: "Terms of Service",
  description: "Terms of Service for Archanai — the priest booking platform.",
}

export default function TermsPage() {
  return (
    <div className="flex-1 bg-background">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h1 className="text-3xl font-semibold tracking-tight mb-2">Terms of Service</h1>
        <p className="text-sm text-muted-foreground mb-12">Last updated: April 2026</p>

        <div className="space-y-10 text-sm leading-relaxed text-muted-foreground">
          <section>
            <h2 className="text-base font-semibold text-foreground mb-3">1. Acceptance</h2>
            <p>By using Archanai (the &quot;Platform&quot;), you agree to these Terms. If you are registering as a priest, you additionally agree to the Priest Code of Conduct referenced in Section 5.</p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-foreground mb-3">2. The Platform</h2>
            <p>Archanai is a marketplace that connects Hindu families (&quot;Consumers&quot;) with independent Hindu priests (&quot;Priests&quot;). Archanai facilitates discovery and booking only — we are not a party to payment or to the ceremony itself. The ceremony is conducted solely by the Priest.</p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-foreground mb-3">3. Bookings and payment</h2>
            <ul className="space-y-2 list-disc list-inside">
              <li>A booking is a request. It is confirmed once the Priest accepts it via the dashboard, and the Consumer is notified by email.</li>
              <li>Archanai does not collect, process, or hold any payment. The full contribution (&quot;dakshina&quot;) is agreed and paid directly between the Consumer and the Priest, on ceremony day.</li>
              <li>Archanai charges no commission, no platform fee, and no listing fee to either party.</li>
              <li>Prices shown are the contribution each Priest asks for. They are not fees collected by Archanai, and the final amount is agreed directly between the Consumer and the Priest.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-semibold text-foreground mb-3">4. Cancellation</h2>
            <p>Since Archanai does not collect payment, there is nothing to refund. If a Consumer or Priest needs to cancel, they should notify the other party as early as possible.</p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-foreground mb-3">5. Priest obligations</h2>
            <ul className="space-y-2 list-disc list-inside">
              <li>Priests must complete Archanai&apos;s verification call and maintain an accurate profile at all times.</li>
              <li>Priests must arrive at the ceremony venue on time and perform the ceremony as agreed.</li>
              <li>Priests with more than 2 cancellations per quarter may be suspended from the Platform.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-semibold text-foreground mb-3">6. Consumer obligations</h2>
            <ul className="space-y-2 list-disc list-inside">
              <li>Consumers must provide accurate ceremony and family details at booking time.</li>
              <li>Consumers must have the ceremony venue ready and accessible at the booked time.</li>
              <li>Consumers agree to pay the contribution to the Priest directly on ceremony day.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-semibold text-foreground mb-3">7. Limitation of liability</h2>
            <p>Archanai is a marketplace and is not liable for the conduct of Priests, the outcome of any ceremony, or any payment made directly between Consumer and Priest — Archanai is not a party to that payment.</p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-foreground mb-3">8. Governing law</h2>
            <p>These Terms are governed by the laws of India. Any disputes shall be subject to the exclusive jurisdiction of the courts of Chennai, Tamil Nadu.</p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-foreground mb-3">9. Contact</h2>
            <p>
              Archanai<br />
              Email: legal@archanai.in
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
