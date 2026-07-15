import type { MetadataRoute } from "next"
import { SITE_URL } from "@/lib/site-url"

const STATIC_ROUTES = ["", "/browse", "/about", "/faq", "/priest/register", "/login", "/privacy", "/terms"]

export default function sitemap(): MetadataRoute.Sitemap {
  return STATIC_ROUTES.map((route) => ({
    url: `${SITE_URL}${route}`,
    lastModified: new Date(),
    changeFrequency: route === "" ? "daily" : "weekly",
    priority: route === "" ? 1 : 0.7,
  }))
}
