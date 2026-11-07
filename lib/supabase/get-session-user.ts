import { createClient } from "@/lib/supabase/server"
import { prisma } from "@/lib/prisma"
import type { UserRole } from "@prisma/client"

/**
 * Returns the Prisma User row for the currently authenticated Supabase session,
 * creating the row on first sight. Returns null if there is no session.
 * Read-first: this runs on most page loads, so it must not write when the row exists.
 */
export async function getSessionUser() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const existing = await prisma.user.findUnique({ where: { supabaseId: user.id } })
  if (existing) return existing

  // app_metadata is service-role-only; user_metadata is user-editable and never trusted for role.
  const role = (user.app_metadata?.role as UserRole | undefined) ?? "CONSUMER"
  const data = {
    supabaseId: user.id,
    email:      user.email ?? `${user.id}@phone.local`,
    name:       user.user_metadata?.full_name ?? user.user_metadata?.name ?? user.email?.split("@")[0] ?? "User",
    phone:      user.phone?.replace("+91", "") || undefined,
    role,
  }
  // Two parallel first requests can both reach here; the loser's insert hits the unique key, so re-read.
  return prisma.user.create({ data }).catch(() => prisma.user.findUniqueOrThrow({ where: { supabaseId: user.id } }))
}
