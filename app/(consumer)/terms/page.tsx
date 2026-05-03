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
            <p>By using Archanai (the "Platform"), you agree to these Terms. If you are registering as a priest, you additionally agree to the Priest Code of Conduct referenced in Section 5.</p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-foreground mb-3">2. The Platform</h2>
            <p>Archanai is a marketplace that connects Hindu families ("Consumers") with independent Hindu priests ("Priests"). Archanai is not a party to the ceremony itself — we facilitate discovery, booking, and payment. The ceremony is conducted solely by the Priest.</p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-foreground mb-3">3. Bookings and payment</h2>
            <ul className="space-y-2 list-disc list-inside">
              <li>Bookings are confirmed when the Consumer pays the 30% deposit and the Priest accepts the booking via WhatsApp or the dashboard.</li>
              <li>The remaining balance ("dakshina") is paid directly to the Priest on ceremony day. Archanai has no involvement in the balance payment.</li>
              <li>Archanai charges a 12% platform fee on the deposit amount. This is included in the deposit total displayed at checkout.</li>
              <li>Prices shown are suggested contribution ranges set by the Priest, not fixed fees.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-semibold text-foreground mb-3">4. Cancellation and refunds</h2>
            <ul className="space-y-2 list-disc list-inside">
              <li><strong className="text-foreground">Consumer cancels 7+ days before ceremony:</strong> Full deposit refund (minus Razorpay processing fees, typically 2%).</li>
              <li><strong className="text-foreground">Consumer cancels within 7 days:</strong> 50% of the deposit is refunded. The remaining 50% is paid to the Priest as a cancellation fee.</li>
              <li><strong className="text-foreground">Priest cancels:</strong> Full deposit refund to the Consumer. Archanai will attempt to find a replacement priest within 2 hours.</li>
              <li>Refunds are processed within 5–7 business days to the original payment method.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-semibold text-foreground mb-3">5. Priest obligations</h2>
            <ul className="space-y-2 list-disc list-inside">
              <li>Priests must be Aadhaar-verified and maintain an accurate profile at all times.</li>
              <li>Priests must arrive at the ceremony venue on time and perform the ceremony as agreed.</li>
              <li>Priests must not accept private bookings from Consumers met through Archanai for a period of 12 months after any Archanai booking, to protect the marketplace integrity.</li>
              <li>Priests with more than 2 cancellations per quarter may be suspended from the Platform.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-semibold text-foreground mb-3">6. Consumer obligations</h2>
            <ul className="space-y-2 list-disc list-inside">
              <li>Consumers must provide accurate ceremony and family details at booking time.</li>
              <li>Consumers must have the ceremony venue ready and accessible at the booked time.</li>
              <li>Consumers agree to pay the balance contribution to the Priest directly on ceremony day.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-semibold text-foreground mb-3">7. Limitation of liability</h2>
            <p>Archanai is a marketplace and is not liable for the conduct of Priests or the outcome of any ceremony. Our total liability to you in connection with any booking is limited to the deposit amount paid for that booking.</p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-foreground mb-3">8. Governing law</h2>
            <p>These Terms are governed by the laws of India. Any disputes shall be subject to the exclusive jurisdiction of the courts of Chennai, Tamil Nadu.</p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-foreground mb-3">9. Contact</h2>
            <p>
              Archanai Technologies Private Limited<br />
              Email: legal@archanai.in<br />
              WhatsApp: +91 98765 43210
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
