import type { Metadata } from "next"
import { Zilla_Slab, Noto_Serif, Courier_Prime } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { SpeedInsights } from "@vercel/speed-insights/next"
import { Toaster } from "@/components/ui/sonner"
import { SITE_URL } from "@/lib/site-url"
import "./globals.css"

const slabDisplay = Zilla_Slab({
  variable: "--font-slab-display",
  weight: ["500", "600", "700"],
  subsets: ["latin"],
})

const bodySerif = Noto_Serif({
  variable: "--font-body-serif",
  subsets: ["latin"],
})

const tabularMono = Courier_Prime({
  variable: "--font-tabular",
  weight: ["400", "700"],
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
    <html lang="en" className={`${slabDisplay.variable} ${bodySerif.variable} ${tabularMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-background text-foreground">
        {children}
        <Toaster richColors position="top-right" />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  )
}
