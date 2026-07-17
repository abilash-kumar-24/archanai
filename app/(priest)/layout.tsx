import Link from "next/link"
import { redirect } from "next/navigation"
import { Flame, LayoutDashboard, CalendarDays, IndianRupee, UserCircle } from "lucide-react"
import { Separator } from "@/components/ui/separator"
import { SignOutButton } from "@/components/priest/sign-out-button"
import { getSessionUser } from "@/lib/supabase/get-session-user"

const NAV = [
  { href: "/priest/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/priest/calendar",  label: "Calendar",  icon: CalendarDays },
  { href: "/priest/earnings",  label: "Earnings",  icon: IndianRupee },
  { href: "/priest/profile",   label: "My Profile", icon: UserCircle },
]

export default async function PriestLayout({ children }: { children: React.ReactNode }) {
  const user = await getSessionUser()
  if (!user || (user.role !== "PRIEST" && user.role !== "ADMIN")) {
    redirect("/login")
  }

  return (
    <div className="flex min-h-screen bg-muted/30">
      {/* Sidebar */}
      <aside className="hidden lg:flex flex-col w-60 shrink-0 bg-sidebar border-r border-sidebar-border">
        <div aria-hidden className="h-[5px] w-full bg-gradient-to-r from-primary via-accent to-primary" />
        <div className="h-16 flex items-center px-5 gap-2 border-b border-sidebar-border">
          <div className="h-7 w-7 rounded-lg bg-primary flex items-center justify-center">
            <Flame className="h-3.5 w-3.5 text-primary-foreground" />
          </div>
          <span className="font-semibold text-sm">
            <span className="text-primary">Archanai</span>
            <span className="text-muted-foreground font-normal"> · Priest</span>
          </span>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          {NAV.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors"
            >
              <Icon className="h-4 w-4 shrink-0" />
              {label}
            </Link>
          ))}
        </nav>

        <div className="p-3 border-t border-sidebar-border">
          <SignOutButton />
        </div>
      </aside>

      {/* Mobile top bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 h-14 bg-background border-b border-border flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-lg bg-primary flex items-center justify-center">
            <Flame className="h-3.5 w-3.5 text-primary-foreground" />
          </div>
          <span className="font-semibold text-sm text-primary">Archanai</span>
        </div>
        <div className="flex gap-3">
          {NAV.map(({ href, icon: Icon }) => (
            <Link key={href} href={href} className="p-1.5 text-muted-foreground hover:text-foreground">
              <Icon className="h-5 w-5" />
            </Link>
          ))}
        </div>
      </div>

      <main className="flex-1 lg:p-8 p-4 pt-20 lg:pt-8 overflow-x-hidden">
        {children}
      </main>
    </div>
  )
}
