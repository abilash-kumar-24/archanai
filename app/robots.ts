import type { MetadataRoute } from "next"
import { SITE_URL } from "@/lib/site-url"

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/priest/dashboard", "/priest/calendar", "/priest/earnings", "/priest/profile", "/bookings", "/admin"],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  }
}
