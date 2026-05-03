import { createClient } from "@/lib/supabase/server"
import { prisma } from "@/lib/prisma"
import type { UserRole } from "@prisma/client"

/**
 * Returns the Prisma User row for the currently authenticated Supabase session,
 * creating the row on first call (upsert). Returns null if there is no session.
 */
export async function getSessionUser() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const role = (user.user_metadata?.role as UserRole | undefined) ?? "CONSUMER"

  return prisma.user.upsert({
    where:  { supabaseId: user.id },
    update: {},
    create: {
      supabaseId: user.id,
      email:      user.email ?? `${user.id}@phone.local`,
      name:       user.user_metadata?.full_name ?? user.user_metadata?.name ?? "User",
      phone:      user.phone?.replace("+91", "") ?? undefined,
      role,
    },
  })
}
