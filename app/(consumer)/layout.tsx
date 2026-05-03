import { Navbar } from "@/components/shared/navbar"
import { Footer } from "@/components/shared/footer"

export default function ConsumerLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-full">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  )
}
