import { NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@supabase/ssr"

const PRIEST_ROUTES = ["/priest/dashboard", "/priest/calendar", "/priest/earnings", "/priest/profile"]
const ADMIN_ROUTES  = ["/admin"]
const AUTH_ROUTES   = ["/login", "/signup"]

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl
  const res = NextResponse.next()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => req.cookies.getAll(),
        setAll: (toSet) => {
          toSet.forEach(({ name, value, options }) => {
            req.cookies.set(name, value)
            res.cookies.set(name, value, options)
          })
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  if (user && AUTH_ROUTES.some((r) => pathname.startsWith(r))) {
    return NextResponse.redirect(new URL("/", req.url))
  }

  if (PRIEST_ROUTES.some((r) => pathname.startsWith(r))) {
    if (!user) {
      const url = new URL("/login", req.url)
      url.searchParams.set("redirect", pathname)
      return NextResponse.redirect(url)
    }
    const role = user.user_metadata?.role as string | undefined
    if (role !== "PRIEST" && role !== "ADMIN") {
      return NextResponse.redirect(new URL("/", req.url))
    }
  }

  if (ADMIN_ROUTES.some((r) => pathname.startsWith(r))) {
    if (!user) {
      const url = new URL("/login", req.url)
      url.searchParams.set("redirect", pathname)
      return NextResponse.redirect(url)
    }
    const role = user.user_metadata?.role as string | undefined
    if (role !== "ADMIN") {
      return NextResponse.redirect(new URL("/", req.url))
    }
  }

  return res
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|api/).*)",
  ],
}
