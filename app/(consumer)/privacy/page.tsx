export const metadata = {
  title: "Privacy Policy",
  description: "How Archanai collects, uses, and protects your personal information.",
}

export default function PrivacyPage() {
  return (
    <div className="flex-1 bg-background">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h1 className="text-3xl font-semibold tracking-tight mb-2">Privacy Policy</h1>
        <p className="text-sm text-muted-foreground mb-12">Last updated: April 2026</p>

        <div className="space-y-10 text-sm leading-relaxed text-muted-foreground">
          <section>
            <h2 className="text-base font-semibold text-foreground mb-3">1. What we collect</h2>
            <ul className="space-y-2 list-disc list-inside">
              <li><strong className="text-foreground">Contact details:</strong> Name, mobile number, email address.</li>
              <li><strong className="text-foreground">Booking details:</strong> Ceremony type, date, address, and family ritual details (gotram, nakshatra) you share at booking time.</li>
              <li><strong className="text-foreground">Payment data:</strong> Archanai is free — no payment details are collected or stored.</li>
              <li><strong className="text-foreground">Priest documents:</strong> Aadhaar card copies and certificates uploaded during priest registration, stored securely and accessed only by our verification team.</li>
              <li><strong className="text-foreground">Usage data:</strong> Standard server logs (IP address, browser, pages visited) for debugging and analytics.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-semibold text-foreground mb-3">2. How we use it</h2>
            <ul className="space-y-2 list-disc list-inside">
              <li>To match you with suitable priests and confirm bookings.</li>
              <li>To send email notifications about your booking status via Resend.</li>
              <li>To verify priest identities before onboarding.</li>
              <li>To improve our platform through aggregated, anonymised analytics.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-semibold text-foreground mb-3">3. Who we share it with</h2>
            <p className="mb-2">We do not sell your data. We share limited information only as necessary to deliver the service:</p>
            <ul className="space-y-2 list-disc list-inside">
              <li><strong className="text-foreground">Priests:</strong> Your name, ceremony type, date, address, and family details shared at booking time are visible to your assigned priest.</li>
              <li><strong className="text-foreground">Resend:</strong> Transactional email delivery.</li>
              <li><strong className="text-foreground">Supabase:</strong> Secure authentication and database hosting.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-semibold text-foreground mb-3">4. Data retention</h2>
            <p>Booking records are retained for 3 years for tax and dispute purposes. Priest verification documents are retained for 2 years after a priest's account is closed. You may request deletion of your account and associated data by emailing privacy@archanai.in — subject to retention obligations.</p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-foreground mb-3">5. Security</h2>
            <p>All data is encrypted in transit (TLS) and at rest. Access to sensitive data is restricted to authorised team members. Priest documents are stored in a private, access-controlled storage bucket.</p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-foreground mb-3">6. Your rights</h2>
            <p>Under applicable Indian data protection law, you have the right to access, correct, and request deletion of your personal data. Contact us at <strong className="text-foreground">privacy@archanai.in</strong> to exercise these rights.</p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-foreground mb-3">7. Contact</h2>
            <p>
              Archanai Technologies Private Limited<br />
              Email: privacy@archanai.in<br />
              WhatsApp: +91 98765 43210
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
