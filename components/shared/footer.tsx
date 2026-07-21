import Link from "next/link"
import { Flame } from "lucide-react"

export function Footer() {
  return (
    <footer className="border-t border-border bg-background">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-3">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary">
                <Flame className="h-3.5 w-3.5 text-primary-foreground" />
              </div>
              <span className="font-semibold text-primary">Archanai</span>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Trusted priests for every ceremony. Verified, transparent, and always there for your family.
            </p>
          </div>

          <div>
            <p className="text-sm font-medium mb-3">Ceremonies</p>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/browse?ceremony=GRIHA_PRAVESH" className="hover:text-foreground transition-colors">Griha Pravesh</Link></li>
              <li><Link href="/browse?ceremony=SATYANARAYAN_PUJA" className="hover:text-foreground transition-colors">Satyanarayan Puja</Link></li>
              <li><Link href="/browse?ceremony=NAMAKARANA" className="hover:text-foreground transition-colors">Namakarana</Link></li>
              <li><Link href="/browse?ceremony=UPANAYANAM" className="hover:text-foreground transition-colors">Upanayanam</Link></li>
              <li><Link href="/browse?ceremony=SEEMANTHAM" className="hover:text-foreground transition-colors">Seemantham</Link></li>
            </ul>
          </div>

          <div>
            <p className="text-sm font-medium mb-3">Cities</p>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/browse?city=CHENNAI" className="hover:text-foreground transition-colors">Chennai</Link></li>
              <li><Link href="/browse?city=BANGALORE" className="hover:text-foreground transition-colors">Bangalore</Link></li>
              <li><Link href="/browse?city=HYDERABAD" className="hover:text-foreground transition-colors">Hyderabad</Link></li>
              <li><Link href="/browse?city=COCHIN" className="hover:text-foreground transition-colors">Cochin</Link></li>
              <li><Link href="/browse?city=AMARAVATI" className="hover:text-foreground transition-colors">Amaravati</Link></li>
            </ul>
          </div>

          <div>
            <p className="text-sm font-medium mb-3">Platform</p>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/priest/register" className="hover:text-foreground transition-colors">Join as Priest</Link></li>
              <li><Link href="/about" className="hover:text-foreground transition-colors">About Us</Link></li>
              <li><Link href="/faq" className="hover:text-foreground transition-colors">FAQ</Link></li>
              <li><Link href="/privacy" className="hover:text-foreground transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:text-foreground transition-colors">Terms of Service</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-8 border-t border-border flex flex-col sm:flex-row justify-between items-center gap-3">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} Archanai. All rights reserved.
          </p>
          <p className="text-xs text-muted-foreground">
            Made with 🙏 for families across South India
          </p>
        </div>
      </div>
    </footer>
  )
}
