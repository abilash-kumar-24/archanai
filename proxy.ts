import { NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@supabase/ssr"

const PRIEST_ROUTES = ["/priest/dashboard", "/priest/calendar", "/priest/earnings", "/priest/profile"]
const ADMIN_ROUTES  = ["/admin"]
const AUTH_ROUTES   = ["/login", "/signup"]

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl
  const res = NextResponse.next()

  // Build a Supabase client that can read/write cookies in the middleware context
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

  // Redirect logged-in users away from auth pages
  if (user && AUTH_ROUTES.some((r) => pathname.startsWith(r))) {
    return NextResponse.redirect(new URL("/", req.url))
  }

  // Protect priest routes
  if (PRIEST_ROUTES.some((r) => pathname.startsWith(r))) {
    if (!user) {
      const url = new URL("/login", req.url)
      url.searchParams.set("redirect", pathname)
      return NextResponse.redirect(url)
    }
    // Role check — user must have priest role (stored in user_metadata)
    const role = user.user_metadata?.role as string | undefined
    if (role !== "PRIEST" && role !== "ADMIN") {
      return NextResponse.redirect(new URL("/", req.url))
    }
  }

  // Protect admin routes
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
    // Run on all routes except static files, _next internals, and API routes
    "/((?!_next/static|_next/image|favicon.ico|api/).*)",
  ],
}
