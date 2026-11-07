import { Navbar } from "@/components/shared/navbar"
import { Footer } from "@/components/shared/footer"
import { getSessionUser } from "@/lib/supabase/get-session-user"

export default async function ConsumerLayout({ children }: { children: React.ReactNode }) {
  const user = await getSessionUser()
  return (
    <div className="flex flex-col min-h-full">
      <Navbar user={user ? { name: user.name, role: user.role } : null} />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  )
}
