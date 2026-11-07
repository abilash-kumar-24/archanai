import Link from "next/link"
import { redirect } from "next/navigation"
import { PriestCard } from "@/components/consumer/priest-card"
import { Button } from "@/components/ui/button"
import { prisma } from "@/lib/prisma"
import { getSessionUser } from "@/lib/supabase/get-session-user"

export const metadata = { title: "Saved priests" }
export const dynamic = "force-dynamic"

export default async function FavoritesPage() {
  const user = await getSessionUser()
  if (!user) redirect("/login?redirect=/favorites")

  const favs = await prisma.favorite.findMany({
    where: { userId: user.id, priest: { isActive: true, verificationStatus: "VERIFIED" } },
    include: { priest: true },
    orderBy: { createdAt: "desc" },
  })

  return (
    <div className="flex-1 bg-background">
      <div className="mx-auto max-w-5xl px-4 py-8">
        <h1 className="text-2xl font-semibold tracking-tight mb-6">Saved priests</h1>
        {favs.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-sm text-muted-foreground mb-4">Save priests you like to find them quickly.</p>
            <Button size="sm" asChild><Link href="/browse">Browse priests</Link></Button>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 gap-4">
            {favs.map(({ priest }) => (
              <PriestCard key={priest.id} priest={{
                ...priest,
                photoUrl: priest.photoUrl ?? undefined, templeAffiliation: priest.templeAffiliation ?? undefined,
                bio: priest.bio ?? undefined,
                galleryUrls: priest.galleryUrls,
              }} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
