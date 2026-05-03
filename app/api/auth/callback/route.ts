import { NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { prisma } from "@/lib/prisma"
import type { UserRole } from "@prisma/client"

// Handles Google OAuth redirect — also ensures the User row exists in Prisma.
export async function GET(req: NextRequest) {
  const { searchParams, origin } = req.nextUrl
  const code     = searchParams.get("code")
  const redirect = searchParams.get("redirect") ?? "/"

  if (code) {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll:  () => cookieStore.getAll(),
          setAll: (toSet) => {
            toSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
          },
        },
      }
    )

    const { data: { user } } = await supabase.auth.exchangeCodeForSession(code)

    if (user) {
      const role = (user.user_metadata?.role as UserRole | undefined) ?? "CONSUMER"
      // Derive a display name: Google provides full_name, magic-link users get their email prefix
      const name =
        user.user_metadata?.full_name ??
        user.user_metadata?.name ??
        user.email?.split("@")[0] ??
        "User"
      await prisma.user.upsert({
        where:  { supabaseId: user.id },
        update: { name },
        create: {
          supabaseId: user.id,
          email:      user.email ?? `${user.id}@unknown.local`,
          name,
          role,
        },
      })
    }
  }

  return NextResponse.redirect(`${origin}${redirect}`)
}
