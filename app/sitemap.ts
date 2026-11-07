import type { MetadataRoute } from "next"
import { SITE_URL } from "@/lib/site-url"
import { prisma } from "@/lib/prisma"

export const dynamic = "force-dynamic"

const STATIC_ROUTES = ["", "/browse", "/about", "/faq", "/priest/register", "/login", "/privacy", "/terms"]

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const pages: MetadataRoute.Sitemap = STATIC_ROUTES.map((route) => ({
    url: `${SITE_URL}${route}`,
    lastModified: new Date(),
    changeFrequency: route === "" ? "daily" : "weekly",
    priority: route === "" ? 1 : 0.7,
  }))
  try {
    const priests = await prisma.priest.findMany({
      where: { isActive: true, verificationStatus: "VERIFIED" },
      select: { id: true, updatedAt: true },
    })
    return [...pages, ...priests.map((p) => ({ url: `${SITE_URL}/priests/${p.id}`, lastModified: p.updatedAt, changeFrequency: "weekly" as const, priority: 0.6 }))]
  } catch (err) {
    console.error("[sitemap]", err) // a DB outage should not break the sitemap's static part
    return pages
  }
}
