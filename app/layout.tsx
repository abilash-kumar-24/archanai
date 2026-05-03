import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { Toaster } from "@/components/ui/sonner"
import "./globals.css"

const geistSans = Geist({
  variable: "--font-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

export const metadata: Metadata = {
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
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-background text-foreground">
        {children}
        <Toaster richColors position="top-right" />
      </body>
    </html>
  )
}
