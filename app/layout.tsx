import type { Metadata } from "next"
import { Fraunces, Source_Serif_4, IBM_Plex_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { SpeedInsights } from "@vercel/speed-insights/next"
import { Toaster } from "@/components/ui/sonner"
import { SITE_URL } from "@/lib/site-url"
import "./globals.css"

const display = Fraunces({
  variable: "--font-display",
  style: ["normal", "italic"],
  axes: ["opsz", "SOFT", "WONK"],
  subsets: ["latin"],
})

const body = Source_Serif_4({
  variable: "--font-body",
  subsets: ["latin"],
})

const tabularMono = IBM_Plex_Mono({
  variable: "--font-tabular",
  weight: ["400", "600"],
  subsets: ["latin"],
})

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Archanai — Book Trusted Priests Online",
    template: "%s | Archanai",
  },
  description:
    "Find and book verified Hindu priests for Griha Pravesh, Satyanarayan Puja, Namakarana, Upanayanam and more — across Chennai, Bangalore, Hyderabad, Cochin and Amaravati.",
  keywords: ["Hindu priest", "puja booking", "pandit online", "griha pravesh", "south india priest"],
  openGraph: {
    title: "Archanai — Book Trusted Priests Online",
    description: "Verified priests for every ceremony. Transparent pricing. South India's most trusted puja booking platform.",
    type: "website",
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable} ${tabularMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-background text-foreground">
        {children}
        <Toaster richColors position="top-right" />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  )
}
